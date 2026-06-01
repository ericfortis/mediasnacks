import { resolve, parse } from 'node:path'
import { parseOptions } from './utils/parseOptions.js'
import { ffmpeg } from './utils/subprocess.js'


const HELP = `
SYNOPSIS
  mediasnacks vtrim [--start <time>] [--end <time>] <videos>

DESCRIPTION
  Trims a video without re-encoding (fast, but approximate cuts).

OPTIONS
  -s, --start <time>   Start time (e.g. 10, 00:00:10, 1:23.5). Default: beginning.
  -e, --end <time>     End time (e.g. 30, 00:00:30, 2:45.0). Default: end of video.
  
SEE ALSO
	mediasnacks vsplit
`


export default async function main() {
	const { values, files } = await parseOptions(HELP, {
		start: { short: 's', type: 'string' },
		end: { short: 'e', type: 'string' },
	})

	if (!files.length)
		throw 'No video specified.'

	for (const file of files)
		await vtrim({
			video: resolve(file),
			start: values.start,
			end: values.end
		})
}

export async function vtrim({ video, start, end }) {
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
