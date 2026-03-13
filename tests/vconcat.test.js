import { join } from 'node:path'
import { test } from 'node:test'
import { equal } from 'node:assert/strict'
import { tmpdir } from 'node:os'
import { execSync } from 'node:child_process'
import { mkdtempSync, cpSync } from 'node:fs'
import { sha1 } from './utils.js'

test('vconcat concatenates split videos back to original', () => {
	const tmp = mkdtempSync(join(tmpdir(), 'vconcat-test-'))

	// Copy all split files to temp directory
	for (let i = 1; i <= 6; i++) {
		const splitFile = join(tmp, `60fps_${i}.mp4`)
		cpSync(`tests/fixtures/60fps_${i}.mp4`, splitFile)
	}

	// Run vconcat on all split files
	execSync(`src/cli.js vconcat ${tmp}/60fps_*.mp4`, { cwd: process.cwd() })

	// Check that the concatenated result matches the original
	const generatedFile = join(tmp, '60fps_1.concat.mp4')
	const expectedHash = sha1('tests/fixtures/60fps.mp4')
	const actualHash = sha1(generatedFile)

	equal(actualHash, expectedHash, 'concatenated video should match original 60fps.mp4')
})
