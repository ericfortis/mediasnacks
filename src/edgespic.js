import { basename, extname, join, parse } from 'node:path'

import { mkDir } from './utils/fs-utils.js'
import { videoAttrs } from './utils/videoAttrs.js'
import { parseOptions } from './utils/parseOptions.js'
import { ffmpeg } from './utils/subprocess.js'


const WIDTH = 640

const HELP = `
SYNOPSIS
  mediasnacks edgespic [-w | --width=<num>] <files>

DESCRIPTION
  Extracts the first and last frames from each video and saves them to the 'edgepics/' subfolder.
  
OPTIONS
  -w, --width    Default: ${WIDTH} The aspect ratio is preserved.

EXAMPLES
  mediasnacks edgespic -w 800 *.mov
  mediasnacks edgespic -w 600 'videos/**/*.mp4'
`

export default async function main() {
	const { values, files, usage } = await parseOptions(HELP, {
		width: { short: 'w', type: 'string', default: String(WIDTH) }
	})

	const width = Number(values.width)
	if (width <= 0 || !Number.isInteger(width)) throw usage('--width must be a positive number')
	if (!files.length) throw usage('No video files specified')

	const outDir = join(parse(files[0]).dir, 'edgespic')
	await mkDir(outDir)

	for (const file of files)
		await edgespic(file, width, outDir)
}


export async function edgespic(video, width, outDir) {
	const { r_frame_rate } = await videoAttrs(video)
	const name = basename(video, extname(video))

	await ffmpeg([
		'-y',
		'-i', video,
		'-vf', `scale=${width}:-1`,
		'-frames:v', '1',
		join(outDir, `${name}_first.png`)
	])

	await ffmpeg([
		'-y',
		'-sseof', -1 / eval(r_frame_rate),
		'-i', video,
		'-vf', `scale=${width}:-1`,
		'-frames:v', '1',
		join(outDir, `${name}_last.png`)
	])
}
