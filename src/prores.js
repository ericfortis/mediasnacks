#!/usr/bin/env node
import { resolve, parse, join } from 'node:path'
import { parseOptions } from './utils/parseOptions.js'
import { assertUserHasFFmpeg, run } from './utils/subprocess.js'

export const ProresProfiles = new class {
  // https://github.com/oyvindln/vhs-decode/wiki/ProRes-The-Definitive-FFmpeg-Guide#profiles-can-be-the-following
	profiles = {
		// 10-bit
		0: 'proxy',
		1: 'lt',
		2: 'standard',
		3: 'hq',

		// 12-bit
		4: '4444',
		5: '4444xq'
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
  Converts a video to ProRes

OPTIONS
  -p, --profile <n>    Default: 3 (422 HQ 10-bit)
  -s, --start <time>   Start time (e.g. 5.0). Default: beginning.
  -e, --end <time>     End time (e.g. 0:10.0). Default: end of video.
  -h, --help

PROFILES
${ProresProfiles.table().map(([num, name]) =>
	`  ${num}: ${name}`).join('\n')}

EXAMPLES
  mediasnacks prores video.mov
  mediasnacks prores -p2 *.mov

  Both output a file named: video.prores.mov
`.trim()


async function main() {
	await assertUserHasFFmpeg()

	const { values, files } = await parseOptions({
		profile: { short: 'p', type: 'string', default: String(ProresProfiles.default) },
		start: { short: 's', type: 'string', default: '' },
		end: { short: 'e', type: 'string', default: '' },
		help: { short: 'h', type: 'boolean' },
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
