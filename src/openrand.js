import { join } from 'node:path'
import { spawn } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { parseOptions } from './utils/parseOptions.js'


const HELP = `
SYNOPSIS
  mediasnacks openrand [-r | --recursive] [dir]

DESCRIPTION
  Opens a random file in a dir on macOS.
  The dir defaults to the current working directory.
`

export default async function main() {
	const { values, positionals, usage } = await parseOptions(HELP, {
		recursive: { short: 'r', type: 'boolean' },
	})

	if (process.platform !== 'darwin')
		throw usage('This command is only supported on macOS.')

	const dir = positionals[0] || '.'
	openrand(dir, values.recursive)
}

export function openrand(dir = '.', recursive = false) {
	spawn('open', [pickRandomFile(dir, recursive)])
}

export function pickRandomFile(dir = '.', recursive = false) {
	const files = readdirSync(dir, { withFileTypes: true, recursive })
		.filter(dirent => !dirent.name.startsWith('.') && dirent.isFile())
		.map(dirent => join(dirent.parentPath, dirent.name))
	return files[Math.floor(Math.random() * files.length)]
}
