import { resolve, parse, format } from 'node:path'
import { parseOptions } from './utils/parseOptions.js'
import { ffmpeg, assertUserHasFFmpeg, run } from './utils/subprocess.js'
import { ProresProfiles } from './prores.js'


const PROFILE = ProresProfiles.default

const HELP = `
SYNOPSIS
  mediasnacks dropdups [-n <dup-frame-num>] <video>

DESCRIPTION
  Removes sequentially duplicate frames and outputs ProRes 422 HQ.

OPTIONS
  -n, --dup-frame-num <n>  Known frame interval to drop.
		                       Default: n=0, which auto-detects repeated frames (slower)

EXAMPLES
  Use n=2 when every other frame is repeated:
  mediasnacks dropdups -n2 vid.mov
  
	Use n=6 if e.g., a 25 fps got upped to 30 fps without interpolation.
  mediasnacks dropdups -n6 vid.mov
`.trim()


export default async function main() {
	await assertUserHasFFmpeg()

	const { values, files } = await parseOptions(HELP, {
		'dup-frame-num': { short: 'n', type: 'string' },
	})

	if (!files.length) throw 'No video specified.'

	let dupFrameNum = values['dup-frame-num']
	if (dupFrameNum && !Number.isInteger(+dupFrameNum))
		throw 'Invalid -n. It must be a positive integer.'

	for (const file of files)
		await dropdups(resolve(file), dupFrameNum)
}

export async function dropdups(video, dupFrameNum) {
	await run('ffmpeg', [
		'-v', 'error',
		'-stats',
		'-an',
		'-i', video,
		'-vf', dupFrameNum
			? `decimate=cycle=${dupFrameNum}`
			: 'mpdecimate,setpts=N/FRAME_RATE/TB',
		'-fps_mode', 'cfr',
		'-c:v', 'prores_ks', '-profile:v', PROFILE,
		makeOutputPath(video)
	])
}

function makeOutputPath(video) {
	const abs = resolve(video)
	const { dir, name, ext } = parse(abs)
	return ext.toLowerCase() === '.mov'
		? format({ dir, name: `${name}.dedup`, ext: '.mov' })
		: format({ dir, name, ext: '.mov' })
}
