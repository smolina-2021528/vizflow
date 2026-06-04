#!/usr/bin/env node

// ─── VizFlow CLI entry point ──────────────────────────────────────

import { select } from '@inquirer/prompts'

const COMMANDS = {
  chart: '/chart      — Generate a chart from your data',
  table: '/table      — Generate a searchable table from your data',
  heatmap: '/heatmap    — Generate a heatmap matrix',
  components: '/components — Generate KPI cards and progress bars',
} as const

type Command = keyof typeof COMMANDS

async function main(): Promise<void> {
  console.log('\n🌊 Welcome to VizFlow CLI\n')

  const command = await select<Command>({
    message: 'What do you want to generate?',
    choices: [
      { name: COMMANDS.chart, value: 'chart' },
      { name: COMMANDS.table, value: 'table' },
      { name: COMMANDS.heatmap, value: 'heatmap' },
      { name: COMMANDS.components, value: 'components' },
    ],
  })

  // Dynamic import — each command is loaded only when needed
  const { run } = await import(`./commands/${command}.js`)
  await run()
}

main().catch((err: unknown) => {
  console.error('\n❌ VizFlow CLI error:', err)
  process.exit(1)
})