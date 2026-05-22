#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { parseOptions } from './utils/parseOptions.js'
import { findFiles } from './utils/fs-utils.js'


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

	const files = findFiles({
		dir: '.',
		regex: new RegExp(positionals.join('|'), 'i'),
		recursive: values.recursive,
		ignoredDirs: ['.fcpbundle/']
	})

	if (!files.length)
		throw new Error('No matching files found.')

	play(files)
}

function play(files) {
	const mpv = spawn('mpv', ['--playlist=-'], {
		detached: true,
		stdio: ['pipe', 'ignore', 'ignore']
	})
	mpv.stdin.end(files.join('\n'))
	mpv.unref()

	mpv.on('error', function (err) {
		if (err.code === 'ENOENT')
			console.error('Error: MPV is not installed')
		else
			console.log(err)
	})
}

main().catch(err => {
	console.error(err.message)
	process.exit(1)
})
