import { parseOptions } from './utils/parseOptions.js'
import { run } from './utils/subprocess.js'


const HELP = `
SYNOPSIS
  mediasnacks png <img1> [img2 ...]

DESCRIPTION
  Losslessly optimizes PNG images with oxipng at max level.

EXAMPLE
  mediasnacks png *.png
`.trim()

export default async function main() {
	const { values, positionals } = await parseOptions(HELP)

	if (!positionals[0])
		throw 'Missing input image(s)'

	await png(...positionals)
}

export async function png(...images) {
	await run('oxipng', [
		'--opt', 'max',
		...images
	])
}
