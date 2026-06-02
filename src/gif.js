import { parse, format } from 'node:path'
import { parseOptions } from './utils/parseOptions.js'
import { run } from './utils/subprocess.js'


const FPS = 12
const WIDTH = 600

const HELP = `
SYNOPSIS
  mediasnacks gif [-f | --fps <number>] [-w | --width <pixels>] <file>

DESCRIPTION
  Converts video to GIF

OPTIONS
  -f, --fps    Default: ${FPS}
  -w, --width  Default: ${WIDTH}
`

export default async function main() {
	const { values, files } = await parseOptions(HELP, {
		fps: { short: 'f', type: 'string', default: String(FPS) },
		width: { short: 'w', type: 'string', default: String(WIDTH) },
	})

	if (!files.length)
		throw 'Missing input file'

	await gif(files[0], values.fps, values.width)
}

export async function gif(file, fps, width) {
	const { dir, name } = parse(file)
	const outName = format({ dir, name, ext: '.gif' })

	await run('ffmpeg', [
		'-v', 'error',
		'-i', file,
		'-vf', `fps=${fps},scale=${width}:-1`,
		outName,
	])
}
