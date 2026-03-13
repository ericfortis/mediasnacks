import { join } from 'node:path'
import { test } from 'node:test'
import { equal } from 'node:assert/strict'
import { tmpdir } from 'node:os'
import { execSync } from 'node:child_process'
import { mkdtempSync, cpSync } from 'node:fs'
import { videoAttrs } from '../src/utils/ffmpeg.js'

test('vconcat concatenates split videos', async () => {
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
	const concatenatedAttrs = await videoAttrs(concatenatedFile)
	const originalAttrs = await videoAttrs(inputFile)

	equal(concatenatedAttrs.duration, originalAttrs.duration, 'concatenated video duration should match original')
})
