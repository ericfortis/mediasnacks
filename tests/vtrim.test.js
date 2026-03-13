import { join } from 'node:path'
import { test } from 'node:test'
import { equal } from 'node:assert/strict'
import { tmpdir } from 'node:os'
import { execSync } from 'node:child_process'
import { mkdtempSync, cpSync } from 'node:fs'
import { sha1 } from './utils.js'

test('vtrim trims video from start to end time', () => {
	const tmp = mkdtempSync(join(tmpdir(), 'vtrim-test-'))

	const inputFile = join(tmp, '60fps.mp4')
	cpSync('tests/fixtures/60fps.mp4', inputFile)

	execSync(`src/cli.js vtrim 5 10 ${inputFile}`)

	const out = join(tmp, '60fps.trim.mp4')
	const expected = 'tests/fixtures/60fps_2.mp4'
	equal(sha1(out), sha1(expected), 'Trimmed video (5-10s) should match 60fps_2.mp4 (regenerated fixture)')
})
