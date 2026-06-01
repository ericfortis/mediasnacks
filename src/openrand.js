import { join } from 'node:path'
import { spawn } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { parseOptions } from './utils/parseOptions.js'


const HELP = `
SYNOPSIS
  mediasnacks openrand [-r | --recursive]

DESCRIPTION
  Opens a random file in the current working directory
`

export default async function main() {
	const { values } = await parseOptions(HELP, {
		recursive: { short: 'r', type: 'boolean' },
	})

	if (process.platform !== 'darwin')
		throw 'This command is only supported on macOS.'

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
