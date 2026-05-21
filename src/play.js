#!/usr/bin/env node
import { join } from 'node:path'
import { spawn } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { parseOptions } from './utils/parseOptions.js'


const HELP = `
SYNOPSIS
  mediasnacks play [--no-recursive] [-h | --help] [query ...]

DESCRIPTION
  Plays a filtered playlist with mpv.
 
EXAMPLE
  cd Music
  mediasnacks play artistX artistY
`.trim()


async function main() {
	const { values, positionals } = await parseOptions({
		recursive: { short: 'r', type: 'boolean', default: true },
		help: { short: 'h', type: 'boolean' }
	}, { allowNegative: true })

	if (values.help) {
		console.log(HELP)
		process.exit(0)
	}

	const pattern = positionals.length
		? positionals.join('|')
		: ''
	const files = findFiles('.', new RegExp(pattern, 'i'), values.recursive)

	if (!files.length) {
		console.error('No matching files found.')
		process.exit(0)
	}

	const child = spawn('mpv', ['--playlist=-'], {
		detached: true,
		stdio: ['pipe', 'ignore', 'ignore']
	})
	child.stdin.end(files.join('\n'))
	child.unref()
}

function findFiles(dir, regex, recursive = true) {
	const IGNORED_DIRS = ['.fcpbundle/']
	return readdirSync(dir, { withFileTypes: true, recursive })
		.filter(entry =>
			entry.isFile()
			&& !entry.name.startsWith('.')
			&& !IGNORED_DIRS.some(d => entry.parentPath.includes(d))
			&& regex.test(entry.name))
		.map(entry => join(entry.parentPath, entry.name))
}

main().catch(err => {
	console.error(err.message)
	process.exit(1)
})
