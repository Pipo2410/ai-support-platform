// import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'
import { RAG } from '@convex-dev/rag'
import { components } from '../../_generated/api'

const rag = new RAG(components.rag, {
  // textEmbeddingModel: openai.embedding('text-embedding-3-small'),
  // embeddingDimension: 1536,
  textEmbeddingModel: google.textEmbeddingModel('gemini-embedding-001'),
  embeddingDimension: 3072,
})
export default rag
