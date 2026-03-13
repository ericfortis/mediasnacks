import { join } from 'node:path'
import { test } from 'node:test'
import { equal } from 'node:assert/strict'
import { tmpdir } from 'node:os'
import { execSync } from 'node:child_process'
import { mkdtempSync, cpSync } from 'node:fs'
import { sha1 } from './utils.js'

test('vconcat concatenates split videos', () => {
	const tmp = mkdtempSync(join(tmpdir(), 'vconcat-test-'))

	// Copy fixture files with single quotes in filenames to test escaping
	for (let i = 1; i <= 6; i++) {
		const splitFile = join(tmp, `60'fps_${i}.mp4`)
		cpSync(`tests/fixtures/60fps_${i}.mp4`, splitFile)
	}

	// Concatenate the split files (needs proper quoting in shell)
	execSync(`src/cli.js vconcat ${tmp}/60\\'fps_*.mp4`, { cwd: process.cwd(), shell: '/bin/sh' })

	// Verify the concatenated file matches what we expect from these splits
	const concatenatedFile = join(tmp, `60'fps_1.concat.mp4`)
	const concatenatedHash = sha1(concatenatedFile)

	// The hash should be consistent for the same input splits
	equal(concatenatedHash, 'a2d93a93865e2c082260a1897985615e6f15d2d6', 'concatenated video hash should be consistent')
})
