import { equal, deepEqual } from 'node:assert/strict'
import test, { describe } from 'node:test'
import { writeFile, unlink, mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { replaceExt, globAll, parseArgsWithGlobs } from './fs-utils.js'


describe('replaceExt', () => {
	test('replaces a simple extension', () => 
		equal(replaceExt('file.txt', 'md'), 'file.md'))

	test('replaces a multi-part extension', () => 
		equal(replaceExt('archive.tar.gz', 'zip'), 'archive.tar.zip'))

	test('adds extension when none exists', () => 
		equal(replaceExt('README', 'md'), 'README.md'))

	test('handles empty filename', () =>
		equal(replaceExt('', 'ext'), '.ext'))
	
	test('handles dot-files', () =>
		equal(replaceExt('.env', 'txt'), '.env.txt'))
})

describe('globAll with token terminator', () => {
	const testDir = join(process.cwd(), 'test-glob-tmp')
	const testFiles = ['test-file2.png', 'test-file3.png', 'test-file4.png', 'other-file.png']

	test.before(async () => {
		await mkdir(testDir, { recursive: true })
		for (const file of testFiles) {
			await writeFile(join(testDir, file), '')
		}
	})

	test.after(async () => {
		await rm(testDir, { recursive: true, force: true })
	})

	test('globs patterns when no terminator present', async () => {
		const pattern = join(testDir, 'test-file[234].png')
		const result = await globAll([pattern])
		const expected = testFiles.slice(0, 3).map(f => join(testDir, f)).sort()
		deepEqual(result.sort(), expected)
	})

	test('globs patterns before terminator and keeps literals after', async () => {
		const pattern = join(testDir, 'test-file[234].png')
		const literal = 'my-literal-file[234].png'

		// Simulate tokens from parseArgs with terminator
		const tokens = [
			{ kind: 'positional', index: 0, value: pattern },
			{ kind: 'option-terminator', index: 1 },
			{ kind: 'positional', index: 1, value: literal }
		]

		const result = await globAll([pattern, literal], tokens)
		const expected = [
			...testFiles.slice(0, 3).map(f => join(testDir, f)),
			literal
		].sort()
		deepEqual(result.sort(), expected)
	})

	test('keeps all arguments literal when terminator is first', async () => {
		const literal1 = 'literal-file[234].png'
		const literal2 = 'another-file[567].png'

		// Simulate tokens where terminator comes before all positionals
		const tokens = [
			{ kind: 'option-terminator', index: 0 },
			{ kind: 'positional', index: 0, value: literal1 },
			{ kind: 'positional', index: 1, value: literal2 }
		]

		const result = await globAll([literal1, literal2], tokens)
		deepEqual(result.sort(), [literal1, literal2].sort())
	})

	test('handles no terminator with tokens (backwards compat)', async () => {
		const pattern = join(testDir, 'test-file[234].png')

		// Tokens without terminator
		const tokens = [
			{ kind: 'positional', index: 0, value: pattern }
		]

		const result = await globAll([pattern], tokens)
		const expected = testFiles.slice(0, 3).map(f => join(testDir, f)).sort()
		deepEqual(result.sort(), expected)
	})

	test('handles undefined tokens (backwards compat)', async () => {
		const pattern = join(testDir, 'test-file[234].png')
		const result = await globAll([pattern], undefined)
		const expected = testFiles.slice(0, 3).map(f => join(testDir, f)).sort()
		deepEqual(result.sort(), expected)
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
	const testDir = join(process.cwd(), 'test-parse-args-tmp')
	const testFiles = ['file1.png', 'file2.png', 'file3.png']

	test.before(async () => {
		await mkdir(testDir, { recursive: true })
		for (const file of testFiles) {
			await writeFile(join(testDir, file), '')
		}
	})

	test.after(async () => {
		await rm(testDir, { recursive: true, force: true })
	})

	test('parses args and globs files in one call', async () => {
		const pattern = join(testDir, 'file[12].png')
		const { values, files } = await parseArgsWithGlobs({
			args: ['--output-dir', '/tmp', pattern],
			options: {
				'output-dir': { type: 'string' }
			},
			allowPositionals: true
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
		const { files } = await parseArgsWithGlobs({
			args: [pattern, '--', literal],
			allowPositionals: true
		})

		deepEqual(files.sort(), [
			join(testDir, 'file1.png'),
			join(testDir, 'file2.png'),
			literal
		].sort())
	})

	test('returns empty files array when no positionals', async () => {
		const { files, values } = await parseArgsWithGlobs({
			args: ['--flag'],
			options: {
				flag: { type: 'boolean' }
			},
			allowPositionals: true
		})

		equal(values.flag, true)
		deepEqual(files, [])
	})
})
