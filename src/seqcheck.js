import { readdirSync } from 'node:fs'
import { parseOptions } from './utils/parseOptions.js'


const LEFT_DELIM = '_'
const RIGHT_DELIM = '.'

const HELP = `
SYNOPSIS
  mediasnacks seqcheck [options] [folder]

DESCRIPTION
  Find missing numbered files in a sequence.

OPTIONS
  -ld, --left-delimiter <str>   Delimiter before the number (default: "${LEFT_DELIM}")
  -rd, --right-delimiter <str>  Delimiter after the number (default: "${RIGHT_DELIM}")
`

export default async function main() {
	const { values, positionals } = await parseOptions(HELP, {
		'left-delimiter': { type: 'string', default: LEFT_DELIM },
		'right-delimiter': { type: 'string', default: RIGHT_DELIM },
	})

	const dir = positionals[0] || process.cwd()
	const missing = seqcheck(dir, values['left-delimiter'], values['right-delimiter'])
	if (missing.length)
		console.log('Missing:', missing)
}

export function seqcheck(dir, leftDelim = LEFT_DELIM, rightDelim = RIGHT_DELIM) {
	const seq = extractSeqNums(readdirSync(dir), leftDelim, rightDelim)
	return findMissingNumbers(seq)
}

export function extractSeqNums(names, leftDelim, rightDelim) {
	const pattern = new RegExp(escapeRegex(leftDelim) + '(\\d+)' + escapeRegex(rightDelim))
	const seq = []
	for (const name of names) {
		const match = name.match(pattern)
		if (match)
			seq.push(Number(match[1]))
	}
	return seq.sort()
}

export function findMissingNumbers(seq) {
	if (seq.length < 2)
		return []
	const missing = []
	for (let i = seq[0]; i <= seq[seq.length - 1]; i++)
		if (!seq.includes(i))
			missing.push(i)
	return missing
}

function escapeRegex(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
