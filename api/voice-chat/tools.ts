import { tool as createTool } from 'ai'
import { z } from 'zod'

const DATA_API = process.env.DATA_API_URL || process.env.DATA_API || 'http://localhost:8000'

export const showSpeaker = createTool({
  description: 'Get details and sessions for a speaker by name',
  inputSchema: z.object({ name: z.string() }),
  execute: async ({ name }) => {
    const res = await fetch(`${DATA_API}/speakers/${encodeURIComponent(name)}`)
    if (!res.ok) throw new Error('Speaker not found')
    return await res.json()
  },
})

export const showSession = createTool({
  description: 'Get details for a session by ID',
  inputSchema: z.object({ id: z.string() }),
  execute: async ({ id }) => {
    const res = await fetch(`${DATA_API}/sessions/${encodeURIComponent(id)}`)
    if (!res.ok) throw new Error('Session not found')
    return await res.json()
  },
})

export const ragSearch = createTool({
  description: 'Search the knowledge base for a free-form query',
  inputSchema: z.object({ query: z.string(), category: z.string().optional() }),
  execute: async ({ query, category }) => {
    const res = await fetch(`${DATA_API}/rag/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, category }),
    })
    if (!res.ok) throw new Error('RAG search failed')
    return await res.json()
  },
})

export const tools = { showSpeaker, showSession, ragSearch } 