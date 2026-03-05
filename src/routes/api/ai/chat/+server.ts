import { error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { createClient } from '@supabase/supabase-js'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!
const MODEL = 'minimax/minimax-m2.5'
const CREDITS_PER_TOKEN = 0.02

const SYSTEM_PROMPT = `You are ClawBot 🦞 — an expert AI assistant specializing exclusively in OpenClaw, the self-hosted AI gateway platform.

You have deep knowledge of:
- OpenClaw installation and configuration on macOS, Windows, Linux, and Raspberry Pi
- The Gateway system (starting, stopping, configuring, monitoring)
- All supported channels: Telegram, Discord, WhatsApp, Signal, Slack, and 15+ more
- The SOUL.md, USER.md, MEMORY.md, and AGENTS.md file system
- Skills system — built-in skills, custom skill creation, skill packaging
- Multi-agent routing and agent configuration
- ACP (Agent Control Protocol) and coding agents (Claude Code, Codex, Pi)
- Session management and conversation routing
- The Canvas feature
- Nodes (mobile/device pairing)
- OpenClaw CLI commands and options
- Common errors and their solutions
- Best practices for production OpenClaw deployments

Your communication style:
- Extremely helpful and practical
- Always include code examples and exact commands
- Use one-click copyable code blocks for everything
- Be concise but complete — don't ramble
- Use emojis sparingly but effectively 🦞
- If you don't know something specific to OpenClaw, say so honestly

When giving commands, always use code blocks:
\`\`\`bash
openclaw gateway start
\`\`\`

You are not a general-purpose AI — you're an OpenClaw specialist. For off-topic questions, gently redirect to OpenClaw-related topics.`

export const POST: RequestHandler = async ({ request, locals }) => {
  const { session, user } = await locals.safeGetSession()
  if (!session || !user) {
    throw error(401, 'Unauthorized')
  }

  const { messages, conversationId, userApiKey } = await request.json()
  if (!messages || !Array.isArray(messages)) {
    throw error(400, 'Invalid request')
  }

  // Check user's API key preference or use platform key
  const { data: profile } = await locals.supabase
    .from('user_profiles')
    .select('credits, openrouter_key')
    .eq('id', user.id)
    .single()

  const apiKey = userApiKey || profile?.openrouter_key || OPENROUTER_API_KEY
  const usesPlatformKey = !userApiKey && !profile?.openrouter_key

  // Check credits if using platform key
  if (usesPlatformKey && (!profile || profile.credits < 1)) {
    throw error(402, 'Insufficient credits. Please top up or use your own OpenRouter key.')
  }

  // Call OpenRouter with streaming
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://clawmaster.io',
      'X-Title': 'ClawMaster'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.slice(-20) // Keep last 20 messages for context
      ],
      stream: true,
      max_tokens: 2000
    })
  })

  if (!response.ok) {
    const errText = await response.text()
    console.error('OpenRouter error:', errText)
    throw error(500, 'AI service error')
  }

  // Stream the response back
  const reader = response.body!.getReader()
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  let totalTokens = 0
  let fullResponse = ''

  const stream = new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n').filter(line => line.startsWith('data: '))

          for (const line of lines) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              controller.close()
              break
            }
            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content || ''
              if (content) {
                fullResponse += content
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
              }
              if (parsed.usage) {
                totalTokens = parsed.usage.total_tokens || 0
              }
            } catch {}
          }
        }
        controller.close()

        // After streaming, deduct credits and save conversation
        if (usesPlatformKey && totalTokens > 0) {
          const creditsUsed = Math.ceil(totalTokens * CREDITS_PER_TOKEN)
          await locals.supabase
            .from('user_profiles')
            .update({ credits: Math.max(0, (profile?.credits || 0) - creditsUsed) })
            .eq('id', user.id)

          // Save conversation and messages
          if (conversationId) {
            await locals.supabase.from('messages').insert([
              ...messages.slice(-1).map((m: any) => ({
                conversation_id: conversationId,
                role: m.role,
                content: m.content,
                credits_used: 0
              })),
              {
                conversation_id: conversationId,
                role: 'assistant',
                content: fullResponse,
                credits_used: creditsUsed
              }
            ])
          }
        }
      } catch (e) {
        controller.error(e)
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}
