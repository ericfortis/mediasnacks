import { rename } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, basename, join } from 'node:path'
import { parseOptions } from './utils/parseOptions.js'
import { findFiles } from './utils/fs-utils.js'


const HELP = `
SYNOPSIS
  mediasnacks unemoji [-r | --recursive] <dir>

DESCRIPTION
  Removes emoji from filenames in the current directory.
  Does not overwrite files.
`

const EMOJI_RE = new RegExp(
	'[' +
	'\u{1F600}-\u{1F64F}' +   // Emoticons
	'\u{1F300}-\u{1F5FF}' +   // Misc Symbols and Pictographs
	'\u{1F680}-\u{1F6FF}' +   // Transport and Map
	'\u{2600}-\u{26FF}' +     // Misc symbols
	'\u{2700}-\u{27BF}' +     // Dingbats
	'\u{1F900}-\u{1F9FF}' +   // Supplemental Symbols and Pictographs
	'\u{1FA70}-\u{1FAFF}' +   // Symbols and Pictographs Extended-A
	'\u{1F1E6}-\u{1F1FF}' +   // Regional Indicator Symbols
	']',
	'gu'
)

export default async function main() {
	const { values, positionals, usage } = await parseOptions(HELP, {
		recursive: { short: 'r', type: 'boolean' }
	})

	if (positionals.length !== 1)
		throw usage('Must pass only one dir')

	const files = findFiles({
		dir: positionals[0],
		regex: EMOJI_RE,
		recursive: values.recursive,
	})

	for (const file of files) {
		const newpath = await unemoji(file)
		if (newpath)
			console.log(`Renaming: ${file} -> ${newpath}`)
	}
}

export async function unemoji(file) {
	const dir = dirname(file)
	const base = basename(file)
	const newbase = base.replace(EMOJI_RE, '')
		.normalize('NFKC')
		.replace(/\s+/g, ' ')
		.replace(/\s+\./g, '.')
		.trim()
	if (base === newbase)
		return null

	const newpath = join(dir, newbase)
	if (existsSync(newpath))
		throw `Skipping (exists): ${file} -> ${newpath}`

	await rename(file, newpath)
	return newpath
}
