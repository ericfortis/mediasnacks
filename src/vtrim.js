#!/usr/bin/env node

import { resolve, parse } from 'node:path'
import { parseOptions } from './utils/parseOptions.js'
import { ffmpeg, assertUserHasFFmpeg } from './utils/ffmpeg.js'


const MAN = `
SYNOPSIS
  mediasnacks vtrim [--start <time>] [--end <time>] <video>

DESCRIPTION
  Trims a video without re-encoding (fast, but approximate cuts).

OPTIONS
  -s, --start <time>   Start time (e.g. 10, 00:00:10, 1:23.5). Default: beginning.
  -e, --end <time>     End time (e.g. 30, 00:00:30, 2:45.0). Default: end of video.
  -h, --help
`.trim()


async function main() {
	await assertUserHasFFmpeg()

	const { values, files } = await parseOptions({
		start: { short: 's', type: 'string', default: '' },
		end: { short: 'e', type: 'string', default: '' },
		help: { short: 'h', type: 'boolean' }
	})

	if (values.help) {
		console.log(MAN)
		process.exit(0)
	}

	if (!files.length)
		throw new Error('No video specified. See mediasnacks vtrim --help')

	for (const file of files)
		await trim(resolve(file), values.start, values.end)
}

async function trim(video, start, end) {
	const { dir, name, ext } = parse(video)
	await ffmpeg([
		'-v', 'error',
		'-y',
		start ? ['-ss', start] : [],
		end ? ['-to', end] : [],
		'-i', video,
		'-c', 'copy',
		resolve(dir, `${name}.trim${ext}`)
	].flat())
}

main().catch(err => {
	console.error(err.message || err)
	process.exit(1)
})
