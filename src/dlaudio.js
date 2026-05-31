import { parseOptions } from './utils/parseOptions.js'
import { run } from './utils/subprocess.js'


const HELP = `
SYNOPSIS
  mediasnacks dlaudio <url>

DESCRIPTION
  yt-dlp best m4a
`.trim()

export default async function main() {
	const { values, positionals } = await parseOptions({
		help: { short: 'h', type: 'boolean' }
	})

	if (values.help || !positionals[0]) {
		console.log(HELP)
		return
	}

	await dlaudio(positionals[0])
}

export async function dlaudio(url) {
	await run('yt-dlp', [
		'-o', '%(title)s.%(ext)s',
		'-f', 'bestaudio[ext=m4a]/bestaudio',
		url
	])
}
