import { readFileSync } from 'node:fs'
import { resolve, parse, join } from 'node:path'

import { parseOptions } from './utils/parseOptions.js'
import { run } from './utils/subprocess.js'


// TODO looks like it's missing a frame (perhaps becaue of -c copy)

const HELP = `
SYNOPSIS
  mediasnacks vsplit <csv> <video>

DESCRIPTION
  Splits a video into multiple clips from CSV timestamps.

ARGUMENTS
  <csv>    CSV file with start,end columns (in seconds)
  <video>  Video file to split

EXAMPLE
  mediasnacks vsplit clips.csv video.mov

  Given clips.csv:
    start,end
    0,5
    5,10
    10,15

  Outputs: video_1.mov, video_2.mov, video_3.mov
 
SEE ALSO
	mediasnacks vtrim
`


export default async function main() {
	const { values, files } = await parseOptions(HELP)

	if (files.length !== 2)
		throw 'Expected 2 arguments: CSV file and video file.'

	const [csvPath, videoPath] = files.map(f => resolve(f))

	const clips = parseCSV(csvPath)
	if (!clips.length)
		throw 'CSV file contains no clips'

	console.log(`Splitting video into ${clips.length} clip${clips.length === 1 ? '' : 's'}…`)
	await vsplit(videoPath, clips)
}

function parseCSV(csvPath) {
	const content = readFileSync(csvPath, 'utf8')
	const lines = content.split('\n').filter(line => line.trim())

	if (!lines.length)
		throw 'CSV file is empty'

	const clips = []
	for (let i = 1; i < lines.length; i++) { // unconditionally skips header 
		const parts = lines[i].split(',').map(s => s.trim())

		if (parts.length !== 2)
			throw `Invalid CSV format at line ${i + 1}: expected 2 columns, got ${parts.length}`

		clips.push(parts)
	}
	return clips
}

export async function vsplit(videoPath, clips) {
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
