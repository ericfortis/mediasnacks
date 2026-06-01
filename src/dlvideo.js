import { parseOptions } from './utils/parseOptions.js'
import { run } from './utils/subprocess.js'


const HELP = `
SYNOPSIS
  mediasnacks dlvideo <url>

DESCRIPTION
  yt-dlp best mp4
`.trim()

export default async function main() {
	const { values, positionals } = await parseOptions(HELP)

	if (!positionals[0])
		throw 'Missing URL'

	await dlvideo(positionals[0])
}

export async function dlvideo(url) {
	await run('yt-dlp', [
		'-o', '%(title)s.%(ext)s',
		'-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4',
		url
	])
}
