#!/usr/bin/env node
import { resolve, parse, join } from 'node:path'
import { parseOptions } from './utils/parseOptions.js'
import { assertUserHasFFmpeg, run } from './utils/subprocess.js'

export const ProresProfiles = new class {
  // https://github.com/oyvindln/vhs-decode/wiki/ProRes-The-Definitive-FFmpeg-Guide#profiles-can-be-the-following
	profiles = {
		// 10-bit color depth
		0: '422 Proxy',
		1: '422 LT',
		2: '422 Standard',
		3: '422 High Quality',

		// 12-bit
		4: '4444',
		5: '4444XQ'
	}
	default = 3

	list = () => Object.keys(this.profiles)
	isValid = n => Object.hasOwn(this.profiles, n)
	table = () => Object.entries(this.profiles)
}

const HELP = `
SYNOPSIS
  mediasnacks prores [options] <video>

DESCRIPTION
  Converts a video to Apple ProRes

OPTIONS
  -p, --profile <n>    Default: ${ProresProfiles.default}
  -s, --start <time>   In time. Unset means beginning
  -e, --end <time>     Out time. Unset means end
  -h, --help
  
PROFILES
${ProresProfiles.table().map(([num, name]) =>
	`  ${num}: ${name}`).join('\n')}

TIME FORMAT
  5.1      -- pure seconds
  20:10.0  -- 20m 10s

EXAMPLES
  mediasnacks prores --end=60 video.mov   // outputs video.prores.mov
  mediasnacks prores -p2 *.mov
`.trim()


async function main() {
	await assertUserHasFFmpeg()

	const { values, files } = await parseOptions({
		profile: { short: 'p', type: 'string', default: String(ProresProfiles.default) },
		start: { short: 's', type: 'string', default: '' },
		end: { short: 'e', type: 'string', default: '' },
		help: { short: 'h', type: 'boolean' }
	})

	if (values.help) {
		console.log(HELP)
		return
	}

	if (!ProresProfiles.isValid(Number(values.profile)))
		throw new Error('Invalid profile. Must be one of: ' + ProresProfiles.list().join(','))

	if (files.length !== 1)
		throw new Error('Expected 1 argument: video file. See mediasnacks prores --help')

	const video = resolve(files[0])
	const { name, dir } = parse(video)
	const output = join(dir, `${name}.prores.mov`)

	await prores(video, values.start, values.end, values.profile, output)
}

async function prores(video, start, end, profile, output) {
	await run('ffmpeg', [
		'-v', 'error',
		'-stats',
		start ? ['-ss', start] : [],
		end ? ['-to', end] : [],
		'-i', video,
		'-c:v', 'prores_ks', '-profile:v', profile,
		output
	].flat())
}

if (import.meta.main)
	main().catch(err => {
		console.error(err.message || err)
		process.exit(1)
	})
