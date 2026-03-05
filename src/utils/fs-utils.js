import { promisify } from 'node:util'
import { parseArgs as _parseArgs } from 'node:util'
import { randomUUID } from 'node:crypto'
import { unlink, rename } from 'node:fs/promises'
import { dirname, extname, join } from 'node:path'
import { lstatSync, glob as _glob } from 'node:fs'


const glob = promisify(_glob)

function findTerminatorIndex(tokens) {
	if (!tokens) return -1
	for (const token of tokens) {
		if (token.kind === 'option-terminator') {
			// Find the position in the positionals array
			// The terminator itself is not in positionals, so we count preceding positionals
			let positionalCount = 0
			for (const t of tokens) {
				if (t === token) break
				if (t.kind === 'positional') positionalCount++
			}
			return positionalCount
		}
	}
	return -1
}

export async function globAll(arr, tokens) {
	const terminatorIndex = findTerminatorIndex(tokens)
	const set = new Set()

	if (terminatorIndex >= 0) {
		// Glob arguments before the terminator
		const beforeTerminator = arr.slice(0, terminatorIndex)
		const afterTerminator = arr.slice(terminatorIndex)

		for (const g of beforeTerminator)
			for (const file of await glob(g))
				set.add(file)

		// Add arguments after terminator as literal strings
		for (const literal of afterTerminator)
			set.add(literal)
	} else {
		// No terminator, glob everything (current behavior)
		for (const g of arr)
			for (const file of await glob(g))
				set.add(file)
	}

	return Array.from(set)
}

export const lstat = f => lstatSync(f, { throwIfNoEntry: false })
export const isFile = path => lstat(path)?.isFile()

export const replaceExt = (f, ext) => {
	const parts = f.split('.')
	if (parts.length > 1 && parts[0])
		parts.pop()
	parts.push(ext)
	return parts.join('.')
}

export const uniqueFilenameFor = file => 
	join(dirname(file), randomUUID() + extname(file))


export async function overwrite(src, target) {
	await unlink(target)
	await rename(src, target)
}
