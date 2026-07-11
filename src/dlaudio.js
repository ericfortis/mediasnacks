import { parseOptions } from './utils/parseOptions.js'
import { runSilently } from './utils/subprocess.js'
import { unemoji } from './unemoji.js'


const HELP = `
SYNOPSIS
  mediasnacks dlaudio <url>

DESCRIPTION
  yt-dlp best m4a
`

export default async function main() {
	const { values, positionals, usage } = await parseOptions(HELP)

	if (!positionals[0])
		throw usage('Missing URL')

	const f = await dlaudio(positionals[0])
	console.log(f)
}

export async function dlaudio(url) {
	const f = (await runSilently('yt-dlp', [
		'--print', 'filename',
		'--no-simulate',
		'-o', '%(title)s.%(ext)s',
		'-f', 'bestaudio[ext=m4a]/bestaudio',
		url
	])).stdout.trim()

	return await unemoji(f) || f
}
