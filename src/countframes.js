#!/usr/bin/env node

import { parseOptions } from './utils/parseOptions.js'
import { assertUserHasFFmpeg } from './utils/subprocess.js'
import { videoAttrs } from './utils/videoAttrs.js'
import { parseTimecode } from './utils/parseTimecode.js'


const HELP = `
SYNOPSIS
  mediasnacks countframes [options] <file>

DESCRIPTION
  Counts the number of frames in a video between optional start and end bounds.

OPTIONS
  -f, --fps <num>          Frames per second (default: same as video)
  -s, --start <timecode>   Start time in seconds (default: 0)
  -e, --end <timecode>     End time in seconds (default: end of video)

EXAMPLES
  mediasnacks countframes --start=1:30.16 --end=60 video.mov
  mediasnacks countframes --fps=12 video.mov
`.trim()


async function main() {
	await assertUserHasFFmpeg()

	const { values, files } = await parseOptions({
		fps: { type: 'string', default: '' },
		start: { short: 's', type: 'string', default: '' },
		end: { short: 'e', type: 'string', default: '' },
		help: { short: 'h', type: 'boolean' }
	})

	if (values.help) {
		console.log(HELP)
		return
	}

	const { fps, start, end } = values
	const file = files[0]
	if (!file) throw new Error('No video file specified')

	const n = await countframes(file, fps, start, end)
	console.log(String(n))
}


export async function countframes(file, fps, start, end) {
	const v = await videoAttrs(file)
	const videoDuration = parseFloat(v.duration || 0)
	const startSecs = start ? parseTimecode(start) : 0
	const endSecs = end ? parseTimecode(end) : videoDuration
	const durationLimit = Math.max(0, endSecs - startSecs)
	const actualFps = fps ? Number(fps) : eval(v.r_frame_rate)
	return Math.ceil(durationLimit * actualFps)
}


if (import.meta.main)
	main().catch(err => {
		console.error(err.message)
		process.exit(1)
	})
