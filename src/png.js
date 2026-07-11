import { parseOptions } from './utils/parseOptions.js'
import { run } from './utils/subprocess.js'


const HELP = `
SYNOPSIS
  mediasnacks png <img1> [img2 ...]

DESCRIPTION
  Losslessly optimizes PNG images with oxipng at max level.

EXAMPLE
  mediasnacks png *.png
`

export default async function main() {
	const { values, files, usage } = await parseOptions(HELP)

	if (!files.length)
		throw usage('Missing input image(s)')

	await png(...files)
}

export async function png(...images) {
	await run('oxipng', [
		'--opt', 'max',
		...images
	])
}
