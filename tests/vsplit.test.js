import { join } from 'node:path'
import { test } from 'node:test'
import { equal } from 'node:assert/strict'
import { tmpdir } from 'node:os'
import { execSync } from 'node:child_process'
import { mkdtempSync, cpSync } from 'node:fs'
import { sha1 } from './utils.js'

test('vsplit splits video at multiple time points', () => {
	const tmp = mkdtempSync(join(tmpdir(), 'vsplit-test-'))

	const inputFile = join(tmp, '60fps.mp4')
	cpSync('tests/fixtures/60fps.mp4', inputFile)

	execSync(`src/cli.js vsplit 5 10 15 20 25 ${inputFile}`)

	for (let i = 1; i <= 6; i++) {
		const generatedFile = join(tmp, `60fps_${i}.mp4`)
		const expectedFile = `tests/fixtures/60fps_${i}.mp4`
		equal(sha1(generatedFile), sha1(expectedFile), `60fps_${i}.mp4 hash should match expected`)
	}
})
