#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { resolve, parse, join } from 'node:path'

import { parseOptions } from './utils/parseOptions.js'
import { assertUserHasFFmpeg, run } from './utils/ffmpeg.js'


// TODO looks like it's missing a frame (perhaps becaue of -c copy)

const USAGE = `
Usage: npx mediasnacks vsplit <csv> <video>

Splits a video into multiple clips from CSV timestamps.

Arguments:
  <csv>    CSV file with start,end columns (in seconds)
  <video>  Video file to split

Example:
  npx mediasnacks vsplit clips.csv video.mov

  Given clips.csv:
    start,end
    0,5
    5,10
    10,15

  Outputs: video_1.mov, video_2.mov, video_3.mov
`.trim()


async function main() {
	await assertUserHasFFmpeg()

	const { values, files } = await parseOptions({
		help: { short: 'h', type: 'boolean' },
	})

	if (values.help) {
		console.log(USAGE)
		process.exit(0)
	}

	if (files.length !== 2)
		throw new Error('Expected 2 arguments: CSV file and video file. See npx mediasnacks vsplit --help')

	const [csvPath, videoPath] = files.map(f => resolve(f))

	const clips = parseCSV(csvPath)
	if (!clips.length)
		throw new Error('CSV file contains no clips')

	console.log(`Splitting video into ${clips.length} clip${clips.length === 1 ? '' : 's'}…`)
	await splitVideo(videoPath, clips)
}

function parseCSV(csvPath) {
	const content = readFileSync(csvPath, 'utf8')
	const lines = content.split('\n').filter(line => line.trim())

	if (!lines.length)
		throw new Error('CSV file is empty')

	const clips = []
	for (let i = 1; i < lines.length; i++) { // skip header
		const parts = lines[i].split(',').map(s => s.trim())

		if (parts.length !== 2)
			throw new Error(`Invalid CSV format at line ${i + 2}: expected 2 columns, got ${parts.length}`)

		clips.push(parts)
	}
	return clips
}

async function splitVideo(videoPath, clips) {
	const { dir, name, ext } = parse(videoPath)
	const seqLen = String(clips.length).length

	for (let i = 0; i < clips.length; i++) {
		const [start, end] = clips[i]
		const seq = String(i + 1).padStart(seqLen, '0')
		await run('ffmpeg', [
			'-v', 'error',
			'-ss', start,
			'-to', end,
			'-i', videoPath,
			'-c', 'copy',
			'-y',
			join(dir, `${name}_${seq}${ext}`)
		])
	}
}

main().catch(err => {
	console.error(err.message || err)
	process.exit(1)
})
