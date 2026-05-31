import { join } from 'node:path'
import { spawn } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { parseOptions } from './utils/parseOptions.js'


const HELP = `
SYNOPSIS
  mediasnacks openrand [-r | --recursive]

DESCRIPTION
  Opens a random file in the current working directory
`.trim()

export default async function main() {
	if (process.platform !== 'darwin')
		throw new Error('Error: This command is only supported on macOS.')

	const { values } = await parseOptions({
		recursive: { short: 'r', type: 'boolean' },
		help: { short: 'h', type: 'boolean' }
	})

	if (values.help) {
		console.log(HELP)
		return
	}

	openrand('.', values.recursive)
}

export function openrand(dir = '.', recursive = false) {
	spawn('open', [pickRandomFile(dir, recursive)])
}

export function pickRandomFile(dir = '.', recursive = false) {
	const files = readdirSync(dir, { withFileTypes: true, recursive })
		.filter(entry => !entry.name.startsWith('.') && entry.isFile())
		.map(entry => join(entry.parentPath, entry.name))
	return files[Math.floor(Math.random() * files.length)]
}
