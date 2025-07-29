import { openai } from '@ai-sdk/openai'
import { streamText, convertToModelMessages, UIMessage } from 'ai'
import { tools } from './tools'

export const runtime = 'edge'

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: openai('gpt-4o'),
    system: 'You are Rosa, the CTBTO conference assistant. Answer briefly and use tools to provide structured information.',
    messages: convertToModelMessages(messages),
    tools,
  })

  return result.toUIMessageStreamResponse()
} 