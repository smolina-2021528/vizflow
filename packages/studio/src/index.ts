#!/usr/bin/env node

// ─── VizFlow Studio CLI entrypoint ────────────────────────────────

import { getStudioCliOptions } from './config.js'
import { startStudioServer } from './server.js'

async function main(): Promise<void> {
  const options = getStudioCliOptions()
  const handle = await startStudioServer({
    port: options.port,
  })

  console.log('\n🌊 VizFlow Studio')
  console.log(`   Local server running at ${handle.url}`)
  console.log('   Press Ctrl+C to stop.\n')
}

main().catch(error => {
  const message = error instanceof Error ? error.message : String(error)

  console.error('\n❌ Could not start VizFlow Studio')
  console.error(`   ${message}\n`)

  process.exitCode = 1
})