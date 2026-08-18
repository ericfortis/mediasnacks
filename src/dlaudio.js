import { parseOptions } from './utils/parseOptions.js'
import { run } from './utils/subprocess.js'


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

	await dlaudio(positionals[0])
}

export async function dlaudio(url) {
	await run('yt-dlp', [
		'--no-simulate',
		'-o', '%(title)s.%(ext)s',
		'-f', 'bestaudio[ext=m4a]/bestaudio',
		url
	])
}
