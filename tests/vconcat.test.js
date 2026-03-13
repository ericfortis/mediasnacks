import { join } from 'node:path'
import { test } from 'node:test'
import { equal } from 'node:assert/strict'
import { tmpdir } from 'node:os'
import { execSync } from 'node:child_process'
import { mkdtempSync, cpSync } from 'node:fs'
import { sha1, videoAttr } from './utils.js'

test('vconcat concatenates split videos', () => {
	const tmp = mkdtempSync(join(tmpdir(), 'vconcat-test-'))

	// Copy original with single quote in filename to test escaping
	const inputFile = join(tmp, `60'fps.mp4`)
	cpSync('tests/fixtures/60fps.mp4', inputFile)

	// Split the video
	execSync(`src/cli.js vsplit 5 10 15 20 25 "${inputFile}"`)

	// Concatenate the split files back together
	execSync(`src/cli.js vconcat ${tmp}/60\\'fps_*.mp4`, { cwd: process.cwd(), shell: '/bin/sh' })

	// Verify the concatenated file duration matches the original
	const concatenatedFile = join(tmp, `60'fps_1.concat.mp4`)
	const concatenatedDuration = videoAttr(concatenatedFile, 'duration')
	const originalDuration = videoAttr(inputFile, 'duration')

	equal(concatenatedDuration, originalDuration, 'concatenated video duration should match original')
})
