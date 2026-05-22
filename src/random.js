#!/usr/bin/env node
import { join } from 'node:path'
import { spawn } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { parseOptions } from './utils/parseOptions.js'


const HELP = `
SYNOPSIS
  mediasnacks random [-r | --recursive]

DESCRIPTION
  Opens a random file in the current working directory
`.trim()

async function main() {
	if (process.platform !== 'darwin') {
		console.error('Error: This command is only supported on macOS.')
		process.exit(1)
	}

	const { values } = await parseOptions({
		recursive: { short: 'r', type: 'boolean' },
		help: { short: 'h', type: 'boolean' }
	})

	if (values.help) {
		console.log(HELP)
		process.exit(0)
	}

	spawn('open', [pickRandomFile('.', values.recursive)])
}

function pickRandomFile(dir, recursive) {
	const files = readdirSync(dir, { withFileTypes: true, recursive })
		.filter(entry => !entry.name.startsWith('.') && entry.isFile())
		.map(entry => join(entry.parentPath, entry.name))
	return files[Math.floor(Math.random() * files.length)]
}

main().catch(err => {
	console.error(err.message)
	process.exit(1)
})
