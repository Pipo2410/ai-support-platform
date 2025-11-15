// import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'
import { Agent } from '@convex-dev/agent'
import { components } from '../../../_generated/api'
import { SUPPORT_AGENT_PROMPT } from '../constants/constants'

export const supportAgent = new Agent(components.agent, {
  // chat: openai.chat('gpt-5-nano'),
  chat: google.chat('gemini-2.5-flash'),
  instructions: SUPPORT_AGENT_PROMPT,
})
