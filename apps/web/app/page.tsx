'use client'

import {
  Authenticated,
  Unauthenticated,
  useMutation,
  useQuery,
} from 'convex/react'
import { api } from '@workspace/backend/_generated/api'
import { Button } from '@workspace/ui/components/button'
import { SignInButton, UserButton } from '@clerk/nextjs'

/**
 * Page component that shows an authentication-gated UI for viewing and adding users.
 *
 * When the visitor is authenticated, renders a centered view that displays a Clerk UserButton,
 * a Button to trigger the `addUser` Convex mutation, and the list of users fetched via
 * `api.users.getMany`. When unauthenticated, shows a sign-in prompt with a Clerk SignInButton.
 *
 * The Add User button invokes the `addUser` mutation without arguments; the users list is
 * rendered as JSON. No explicit loading or error states are handled by this component.
 *
 * @returns A React element with authenticated and unauthenticated UI branches.
 */
export default function Page() {
  const users = useQuery(api.users.getMany)
  const addUser = useMutation(api.users.add)

  return (
    <>
      <Authenticated>
        <div className='flex flex-col items-center justify-center min-h-svh'>
          <p>apps/web</p>
          <UserButton />
          <Button onClick={() => addUser()}>Add User</Button>
          <div className='max-w-sm w-full mx-auto'>
            {JSON.stringify(users, null, 2)}
          </div>
        </div>
      </Authenticated>
      <Unauthenticated>
        <p>Must be signed in!</p>
        <SignInButton>Sign in!</SignInButton>
      </Unauthenticated>
    </>
  )
}
