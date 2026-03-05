import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { equal, deepEqual } from 'node:assert/strict'
import { globAll, parseOptions } from './parseOptions.js'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { test, describe, before, after } from 'node:test'


describe('globAll with token terminator', () => {
	let testDir
	const testFiles = ['test-file2.png', 'test-file3.png', 'test-file4.png', 'other-file.png']

	before(async () => {
		testDir = await mkdtemp(join(tmpdir(), 'glob-test-'))
		for (const file of testFiles)
			await writeFile(join(testDir, file), '')
	})

	after(async () => {
		await rm(testDir, { recursive: true, force: true })
	})

	test('globs patterns when no terminator present', async () => {
		const pattern = join(testDir, 'test-file[234].png')
		const result = await globAll([pattern])
		deepEqual(result.sort(), testFiles.slice(0, 3).map(f => join(testDir, f)).sort())
	})

	test('globs patterns before terminator and keeps literals after', async () => {
		const pattern = join(testDir, 'test-file[234].png')
		const literal = 'my-literal-file[234].png'
		const tokens = [ // Simulate tokens from parseArgs with terminator
			{ kind: 'positional', index: 0, value: pattern },
			{ kind: 'option-terminator', index: 1 },
			{ kind: 'positional', index: 1, value: literal }
		]
		const result = await globAll([pattern, literal], tokens)
		deepEqual(result.sort(), [
			...testFiles.slice(0, 3).map(f => join(testDir, f)),
			literal
		].sort())
	})

	test('keeps all arguments literal when terminator is first', async () => {
		const literal1 = 'literal-file[234].png'
		const literal2 = 'another-file[567].png'
		const tokens = [ // Simulate tokens where the terminator comes before all positionals
			{ kind: 'option-terminator', index: 0 },
			{ kind: 'positional', index: 0, value: literal1 },
			{ kind: 'positional', index: 1, value: literal2 }
		]
		const result = await globAll([literal1, literal2], tokens)
		deepEqual(result.sort(), [literal1, literal2].sort())
	})

	test('handles no terminator with tokens (backwards compat)', async () => {
		const pattern = join(testDir, 'test-file[234].png')
		const tokens = [ // Tokens without terminator
			{ kind: 'positional', index: 0, value: pattern }
		]
		const result = await globAll([pattern], tokens)
		deepEqual(result.sort(), testFiles.slice(0, 3).map(f => join(testDir, f)).sort())
	})

	test('handles undefined tokens (backwards compat)', async () => {
		const pattern = join(testDir, 'test-file[234].png')
		const result = await globAll([pattern], undefined)
		deepEqual(result.sort(), testFiles.slice(0, 3).map(f => join(testDir, f)).sort())
	})

	test('handles empty arrays', async () => {
		const result = await globAll([])
		deepEqual(result, [])
	})

	test('deduplicates results', async () => {
		const pattern = join(testDir, 'test-file2.png')
		const result = await globAll([pattern, pattern])
		deepEqual(result, [join(testDir, 'test-file2.png')])
	})
})


describe('parseArgsWithGlobs', () => {
	let testDir
	const testFiles = ['file1.png', 'file2.png', 'file3.png']

	before(async () => {
		testDir = await mkdtemp(join(tmpdir(), 'parse-args-test-'))
		for (const file of testFiles)
			await writeFile(join(testDir, file), '')
	})

	after(async () => {
		await rm(testDir, { recursive: true, force: true })
	})

	test('parses args and globs files in one call', async () => {
		const pattern = join(testDir, 'file[12].png')
		const { values, files } = await parseOptions({
			'output-dir': { type: 'string' }
		}, {
			args: ['--output-dir', '/tmp', pattern],
		})
		equal(values['output-dir'], '/tmp')
		deepEqual(files.sort(), [
			join(testDir, 'file1.png'),
			join(testDir, 'file2.png')
		].sort())
	})

	test('respects verbatim token in parseArgsWithGlobs', async () => {
		const pattern = join(testDir, 'file[12].png')
		const literal = 'literal-file[99].png'
		const { files } = await parseOptions({}, {
			args: [pattern, '--', literal]
		})
		deepEqual(files.sort(), [
			join(testDir, 'file1.png'),
			join(testDir, 'file2.png'),
			literal
		].sort())
	})

	test('returns empty files array when no positionals', async () => {
		const { files, values } = await parseOptions({
			flag: { type: 'boolean' }
		}, {
			args: ['--flag'],
		})
		equal(values.flag, true)
		deepEqual(files, [])
	})
})
