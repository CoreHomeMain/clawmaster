#!/usr/bin/env node
/**
 * Seed script: Insert all 15 modules + learning paths into Supabase
 * Usage: node scripts/seed-modules.mjs
 */

import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://hatwvhqjplvlcqrddmif.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhdHd2aHFqcGx2bGNxcmRkbWlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg2NTQ0MCwiZXhwIjoyMDg3NDQxNDQwfQ.NJ2s9GD3SsmUG5OE4ykGIODXF0134D89YD1EvIVlaYs'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const MODULES_DIR = join(__dirname, '../src/lib/data/modules')

const LEARNING_PATHS = [
  {
    slug: 'beginner',
    title: 'Beginner Track',
    description: 'Start from zero and get OpenClaw running with your first channel connected.',
    level: 'beginner',
    module_slugs: [
      'what-is-openclaw',
      'self-hosted-ai',
      'installing-openclaw',
      'your-first-gateway',
      'the-control-ui',
      'connecting-telegram',
      'your-first-ai-conversation',
      'understanding-sessions'
    ]
  },
  {
    slug: 'intermediate',
    title: 'Intermediate Track',
    description: 'Go deeper with persona config, memory mastery, multi-channel setup, and agent routing.',
    level: 'intermediate',
    module_slugs: [
      'configuring-agent-persona',
      'memory-system-mastery',
      'connecting-discord',
      'connecting-whatsapp',
      'multi-agent-routing'
    ]
  },
  {
    slug: 'advanced',
    title: 'Advanced Track',
    description: 'Build custom skills and become an OpenClaw power user.',
    level: 'advanced',
    module_slugs: [
      'introduction-to-skills',
      'building-your-first-skill'
    ]
  }
]

async function main() {
  console.log('🌱 Seeding ClawMaster database...\n')

  // Read all module files
  const moduleFiles = readdirSync(MODULES_DIR)
    .filter(f => f.endsWith('.json'))
    .sort()

  const modules = moduleFiles.map(file => {
    const data = JSON.parse(readFileSync(join(MODULES_DIR, file), 'utf-8'))
    return data
  })

  console.log(`Found ${modules.length} modules to seed\n`)

  // Insert/upsert modules
  console.log('📚 Inserting modules...')
  for (const module of modules) {
    const { data, error } = await supabase
      .from('modules')
      .upsert({
        slug: module.slug,
        title: module.title,
        description: module.description,
        content_mdx: module.content_mdx,
        level: module.level,
        order_index: module.order_index,
        xp_reward: module.xp_reward,
        estimated_minutes: module.estimated_minutes
      }, { onConflict: 'slug' })
      .select()

    if (error) {
      console.error(`  ❌ Error inserting ${module.slug}:`, error.message)
    } else {
      console.log(`  ✅ ${module.slug}`)
    }
  }

  // Insert learning paths
  console.log('\n🗺️ Inserting learning paths...')
  for (const path of LEARNING_PATHS) {
    // First insert path without module IDs to get UUID
    const { data: pathData, error: pathError } = await supabase
      .from('learning_paths')
      .upsert({
        slug: path.slug,
        title: path.title,
        description: path.description,
        level: path.level
      }, { onConflict: 'slug' })
      .select()
      .single()

    if (pathError) {
      console.error(`  ❌ Error inserting path ${path.slug}:`, pathError.message)
      continue
    }

    // Fetch module IDs for this path
    const { data: pathModules } = await supabase
      .from('modules')
      .select('id, slug, order_index')
      .in('slug', path.module_slugs)
      .order('order_index', { ascending: true })

    if (pathModules && pathData) {
      // Update path with module order
      const modulesOrder = path.module_slugs
        .map(slug => pathModules.find(m => m.slug === slug)?.id)
        .filter(Boolean)

      await supabase
        .from('learning_paths')
        .update({ modules_order: modulesOrder })
        .eq('id', pathData.id)

      // Update each module to reference this path
      for (const moduleSlug of path.module_slugs) {
        const module = pathModules.find(m => m.slug === moduleSlug)
        if (module) {
          await supabase
            .from('modules')
            .update({ path_id: pathData.id })
            .eq('id', module.id)
        }
      }
    }

    console.log(`  ✅ ${path.slug} (${path.module_slugs.length} modules)`)
  }

  // Seed achievements
  console.log('\n🏆 Seeding achievements...')
  const achievements = [
    { slug: 'welcome', title: '🦞 Welcome to ClawMaster', description: 'You joined the community!', icon: '🦞', xp_reward: 10 },
    { slug: 'know-your-level', title: '🎯 Know Your Level', description: 'Completed the onboarding quiz', icon: '🎯', xp_reward: 20 },
    { slug: 'first-steps', title: '📚 First Steps', description: 'Completed your first module', icon: '📚', xp_reward: 25 },
    { slug: 'gateway-online', title: '⚡ Gateway Online', description: 'Completed the Gateway module', icon: '⚡', xp_reward: 50 },
    { slug: 'first-chat', title: '💬 First Chat', description: 'Completed the First AI Conversation module', icon: '💬', xp_reward: 50 },
    { slug: 'connected', title: '🔌 Connected', description: 'Completed any channel setup module', icon: '🔌', xp_reward: 75 },
    { slug: 'ai-curious', title: '🤖 AI Curious', description: 'Sent your first message to ClawBot', icon: '🤖', xp_reward: 25 },
    { slug: 'memory-master', title: '🧠 Memory Master', description: 'Completed the Memory System module', icon: '🧠', xp_reward: 50 },
    { slug: 'multi-agent', title: '👥 Multi-Agent', description: 'Completed Multi-Agent Routing module', icon: '👥', xp_reward: 100 },
    { slug: 'path-complete', title: '🏆 Path Complete', description: 'Completed all modules in a learning path', icon: '🏆', xp_reward: 200 }
  ]

  for (const achievement of achievements) {
    const { error } = await supabase
      .from('achievements')
      .upsert(achievement, { onConflict: 'slug' })

    if (error) {
      console.error(`  ❌ Error inserting achievement ${achievement.slug}:`, error.message)
    } else {
      console.log(`  ✅ ${achievement.slug}`)
    }
  }

  console.log('\n✅ Seed complete!')
  console.log('\nNote: If you see errors about tables not existing, apply the migration first:')
  console.log('https://supabase.com/dashboard/project/hatwvhqjplvlcqrddmif/sql/new')
  console.log('Then run: node scripts/seed-modules.mjs')
}

main().catch(console.error)
