#!/usr/bin/env node

import { parseOptions } from './utils/parseOptions.js'
import { ffmpeg, assertUserHasFFmpeg, videoAttrs } from './utils/subprocess.js'

const STDEV_THRESHOLD = 0.2

const HELP = `
SYNOPSIS
  mediasnacks detectdups [options] <video>

DESCRIPTION
  Detects sequentially duplicate frames in a video and prints a histogram of their distance.

EXAMPLES
  Peak at N=2, means that every other frame is repeated, such as in a 
  video that was converted from 30 to 60fps without interpolation.

  Peak at N=6, means that the 6th frame in a sequence is repeated.
  For instance, a video converted from 25 to 30fps, or 50 to 60fps.

OPTIONS
  -s, --seek <sec>      Video start time for detection
  -d, --duration <sec>  Analyze this many seconds of video
  -v, --verbose
  -h, --help
  
SEE ALSO
  mediasnacks framediff
`.trim()


async function main() {
	await assertUserHasFFmpeg()

	const { values, files } = await parseOptions({
		seek: { short: 's', type: 'string', },
		duration: { short: 'd', type: 'string' },
		help: { short: 'h', type: 'boolean' }
	})

	if (values.help) {
		console.log(HELP)
		process.exit(0)
	}

	if (files.length !== 1)
		throw new Error('Invalid input file. One video file must be specified. See mediasnacks detectdups --help')

	const v = await videoAttrs(files[0])

	if (v.codec_type !== 'video')
		throw new Error('Invalid input file. Must be a video.')

	const vDur = Number(v.duration)

	const seek = values.seek
		? Number(values.seek)
		: vDur > 60 ? 20 : 0

	const duration = values.duration
		? Number(values.duration)
		: vDur > 60 ? 20 : vDur

	if (isNaN(seek) || seek < 0)
		throw new Error(`Invalid --seek value: ${values.seek}`)

	if (isNaN(duration) || duration < 1)
		throw new Error(`Invalid --duration value: ${values.duration}`)

	if ((seek + duration) > vDur)
		throw new Error(`Invalid analysis range. Exceeds video duration: ${vDur}`)


	const dups = await detectDuplicateFramesNums(files[0], seek, duration)
	const h = deltaHistogram(dups)
	const report = {
		n: maxFreqKey(h),
		histogram: h,
		analyzed_region: {
			start_sec: seek,
			end_sec: seek + duration
		},
	}
	console.log(JSON.stringify(report, null, 2))
}

export async function detectDuplicateFramesNums(video, seek, duration) {
	const { stderr } = await ffmpeg([
		'-v', 'info',
		'-stats',
		'-ss', seek,
		'-t', duration,
		'-i', video,
		'-vf', [
			'tblend=all_mode=difference',
			'format=gray',
			'showinfo',
		].join(','),
		'-f', 'null', '-',
	])

	const reNearBlackFrames = /n:\s*(\d+).*?mean:\[0].*?stdev:\[([0-9.]+)]/
	const dupFrames = []
	for (const line of stderr.split('\n')) {
		const match = line.match(reNearBlackFrames)
		if (match) {
			const stdev = parseFloat(match[2])
			if (stdev <= STDEV_THRESHOLD) {
				const frameNum = parseInt(match[1], 10)
				dupFrames.push(frameNum)
			}
		}
	}
	return dupFrames
}

// This is only good for when there's one repeated frame in a cycle.
// i.e. it's the wrong approach for e.g. 25 to 60, in which N=2 and N=3
function deltaHistogram(dups) {
	const histogram = {}
	for (let i = 1; i < dups.length; i++) {
		const diff = dups[i] - dups[i - 1]
		histogram[diff] = (histogram[diff] || 0) + 1
	}
	return histogram
}

function maxFreqKey(histogram) {
	let maxKey = null
	let maxVal = -1
	for (const [k, v] of Object.entries(histogram))
		if (v > maxVal) {
			maxVal = v
			maxKey = k
		}
	return maxKey !== null
		? Number(maxKey)
		: null
}


if (import.meta.main)
	main().catch(err => {
		console.error(err.message || err)
		process.exit(1)
	})
