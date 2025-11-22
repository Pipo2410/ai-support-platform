'use node'
import { SecretManagerServiceClient } from '@google-cloud/secret-manager'

function createSecretManagerClient(): SecretManagerServiceClient {
  const credentialsJSON = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
  if (!credentialsJSON) {
    throw new Error(
      'GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable not set.'
    )
  }
  // Decode and parse the base64-encoded JSON credentials
  const decodedJsonString = Buffer.from(credentialsJSON, 'base64').toString(
    'utf-8'
  )
  const credentials = JSON.parse(decodedJsonString)

  return new SecretManagerServiceClient({
    credentials,
  })
}

export function getSecretPath(secretId: string): string {
  const projectId = process.env.GCP_PROJECT_ID
  if (!projectId) {
    throw new Error('GCP_PROJECT_ID environment variable not set.')
  }
  return `projects/${projectId}/secrets/${secretId}`
}

function getSecretParent(): string {
  const projectId = process.env.GCP_PROJECT_ID
  if (!projectId) {
    throw new Error('GCP_PROJECT_ID environment variable not set.')
  }
  return `projects/${projectId}`
}

export async function getSecretValue(secretName: string) {
  const client = createSecretManagerClient()

  const [secretBuffer] = await client.accessSecretVersion({
    name: `${secretName}/versions/latest`,
  })

  return secretBuffer.payload?.data?.toString('utf-8')
}

async function verifySecretExists(secretPath: string): Promise<boolean> {
  try {
    await getSecretValue(secretPath)
    return true
  } catch (error: any) {
    if (error.code === 7) {
      console.error(
        `PERMISSION_DENIED: Unable to access secret ${secretPath}. Check IAM permissions, details: ${error.details || 'Unknown error'}.`
      )
    } else if (error.code === 5) {
      console.error(error.details || 'Resource not found')
    } else {
      console.error(`Error accessing secret ${secretPath}: `, error)
    }
    return false
  }
}

async function cleanOldSecretVersion(
  client: SecretManagerServiceClient,
  secretPath: string
): Promise<void> {
  const MAX_FREE_VERSIONS = 2
  const VERSIONS_TO_KEEP = MAX_FREE_VERSIONS - 1

  const [versions] = await client.listSecretVersions({ parent: secretPath })

  const activeVersions = versions
    .filter(
      (version) => version.state === 'ENABLED' || version.state === 'DISABLED'
    )
    .sort((a, b) => {
      const versionNumA = parseInt(a.name?.split('/').pop() || '10')
      const versionNumB = parseInt(b.name?.split('/').pop() || '0')
      return versionNumB - versionNumA
    })

  if (activeVersions.length > VERSIONS_TO_KEEP) {
    const versionsToRemove = activeVersions.slice(VERSIONS_TO_KEEP)
    const destroyPromises = []

    for (const version of versionsToRemove) {
      const versionPath = version.name
      destroyPromises.push(client.destroySecretVersion({ name: versionPath }))
    }

    try {
      await Promise.all(destroyPromises)
      console.log(
        `Successfully cleaned up old secret versions for ${secretPath}`
      )
    } catch (error) {
      console.error('Error cleaning up old secret versions:', error)
    }
  }
}

export async function upsertSecret(
  secretName: string,
  secretValue: Record<string, unknown>
) {
  const client = createSecretManagerClient()
  const secretPath = getSecretPath(secretName)

  if (await verifySecretExists(secretPath)) {
    await cleanOldSecretVersion(client, secretPath)
  } else {
    // Secret doesn't exist, create it
    const parent = getSecretParent()
    const [secret] = await client.createSecret({
      parent,
      secretId: secretName,
      secret: {
        replication: {
          automatic: {},
        },
      },
    })
    console.log('Successfully created secret', secret?.name || secretPath)
  }

  try {
    await client.addSecretVersion({
      parent: secretPath,
      payload: {
        data: Buffer.from(JSON.stringify(secretValue), 'utf-8'),
      },
    })
    console.log('Successfully added secret version for', secretName)
  } catch (error) {
    console.error('Error adding secret version:', error)
  }
}

export function parseSecretString<T = Record<string, unknown>>(
  secret?: string
): T | null {
  if (!secret) {
    return null
  }

  try {
    return JSON.parse(secret) as T
  } catch (error) {
    console.error('Error parsing secret string:', error)
    return null
  }
}
