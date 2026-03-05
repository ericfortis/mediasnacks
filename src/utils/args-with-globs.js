import { promisify } from 'node:util'
import { parseArgs } from 'node:util'
import { glob as _glob } from 'node:fs'


const glob = promisify(_glob)

export async function parseArgsWithGlobs(config) {
	const { values, positionals, tokens } = parseArgs({
		allowPositionals: true,
		...config,
		tokens: true
	})

	const files = await globAll(positionals, tokens)

	return { values, positionals, tokens, files }
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
