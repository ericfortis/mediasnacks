#!/usr/bin/env node

import { parseOptions } from './utils/parseOptions.js'
import { ffmpeg, assertUserHasFFmpeg, videoAttrs } from './utils/ffmpeg.js'


const USAGE = `
Usage: mediasnacks detectdups [options] <video>

Detects sequentially duplicate frames in a video and prints their frame numbers.

Options:
  -s, --seek <sec>      Video start time for detection
  -d, --duration <sec>  Analyze this many seconds of video
  -v, --verbose
  -h, --help
`.trim()


async function main() {
	await assertUserHasFFmpeg()

	const { values, files } = await parseOptions({
		seek: { short: 's', type: 'string', },
		duration: { short: 'd', type: 'string' },
		help: { short: 'h', type: 'boolean' }
	})

	if (values.help) {
		console.log(USAGE)
		process.exit(0)
	}

	if (files.length !== 1)
		throw new Error('One video file must be specified. See mediasnacks detectdups --help')

	const v = await videoAttrs(files[0])

	if (v.codec_type !== 'video')
		throw new Error('Input file must be a video.')

	const vDur = Number(v.duration)
	const seek = Number(values.seek) || (vDur > 60 ? 20 : 0)
	const duration = Number(values.duration) || (vDur > 60 ? 20 : vDur)

	if (isNaN(seek) || seek < 0)
		throw new Error(`Invalid --seek value: ${values.seek}`)

	if (isNaN(duration) || duration < 1)
		throw new Error(`Invalid --duration value: ${values.duration}`)

	if ((seek + duration) > vDur)
		throw new Error(`Invalid analysis range. Exceeds video duration: ${vDur}`)


	const dupFrames = await detectDuplicateFramesNums(files[0], seek, duration)
	analyze(dupFrames, seek, duration)
}

async function detectDuplicateFramesNums(video, seek, duration) {
	const { stderr } = await ffmpeg([
		'-v', 'info',
		'-stats',
		'-ss', seek,
		'-t', duration,
		'-i', video,
		'-vf', [
			'scale=320:-1',
			'tblend=all_mode=difference',
			'format=gray',
			'showinfo',
		].join(','),
		'-f', 'null', '-',
	])

	const reBlackFramesNum = /n:\s*(\d+).*?mean:\[0]/
	const dupFrames = []
	for (const line of stderr.split('\n')) {
		const match = line.match(reBlackFramesNum)
		if (match)
			dupFrames.push(Number(match[1]))
	}
	return dupFrames
}

function analyze(dup_frames, seek, duration) {
	const dup_distance = []
	const histogram = {}
	for (let i = 1; i < dup_frames.length; i++) {
		const diff = dup_frames[i] - dup_frames[i - 1]
		dup_distance.push(diff)
		histogram[diff] = (histogram[diff] || 0) + 1
	}
	console.log({
		analyzed_region: {
			start: seek + 's',
			end: (seek + duration) + 's',
		},
		dup_frames,
		dup_distance,
		histogram
	})
}

main().catch(err => {
	console.error(err.message || err)
	process.exit(1)
})
