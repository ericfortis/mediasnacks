import { basename, extname, join, parse } from 'node:path'

import { mkDir } from './utils/fs-utils.js'
import { parseOptions } from './utils/parseOptions.js'
import { ffmpeg } from './utils/subprocess.js'
import { countframes } from './countframes.js'


const HELP = `
SYNOPSIS
  mediasnacks frameseq [options] <files>

DESCRIPTION
  Converts a video into a sequence of PNGs.

OPTIONS
  -f, --fps <num>          Frames per second (default: same as video)
  -s, --start <timecode>   Start time in seconds (default: 0)
  -e, --end <timecode>     End time in seconds (default: end of video)

EXAMPLES
  Start and End
  mediasnacks frameseq --start=1:30.16 --end=60 video.mov
  
  Custom framerate, all video duration
  mediasnacks frameseq --fps=12 video.mov
`


export default async function main() {
	const { values, files } = await parseOptions(HELP, {
		fps: { short: 'f', type: 'string' },
		start: { short: 's', type: 'string' },
		end: { short: 'e', type: 'string' },
		outdir: { type: 'string' },
	})

	const { fps, start, end, outdir } = values
	const video = files[0]
	if (!video) throw 'No video files specified'
	if (fps && isNaN(parseFloat(fps))) throw 'Invalid --fps'
	if (start && isNaN(parseFloat(start))) throw 'Invalid --start'
	if (end && isNaN(parseFloat(end))) throw 'Invalid --end'

	const nFrames = await countframes({ video, fps, start, end })
	const pad = String(nFrames).length
	await frameseq({ video, fps, start, end, pad, outdir })
}

export async function frameseq({ video, fps, start, end, pad, outdir }) {
	const name = basename(video, extname(video))
	const outDir = outdir || join(parse(video).dir, name)
	await mkDir(outDir)
	await ffmpeg([
		start ? ['-ss', start] : [],
		end ? ['-to', end] : [],
		'-i', video,
		fps ? ['-vf', `fps=${fps}`] : [],
		join(outDir, `${name}_%0${pad}d.png`)
	].flat())
}
