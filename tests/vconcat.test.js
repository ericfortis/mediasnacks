import { join } from 'node:path'
import { test } from 'node:test'
import { ok } from 'node:assert/strict'
import { tmpdir } from 'node:os'
import { execSync } from 'node:child_process'
import { mkdtempSync, cpSync } from 'node:fs'
import { videoAttrs } from '../src/utils/ffmpeg.js'

test('vconcat concatenates split videos', async () => {
	const tmp = mkdtempSync(join(tmpdir(), 'vconcat-test-'))

	// Copy split files with single quotes in filenames to test escaping
	for (let i = 1; i <= 6; i++) {
		const splitFile = join(tmp, `60'fps_${i}.mp4`)
		cpSync(`tests/fixtures/60fps_${i}.mp4`, splitFile)
	}

	// Concatenate the split files
	execSync(`src/cli.js vconcat ${tmp}/60\\'fps_*.mp4`, { cwd: process.cwd(), shell: '/bin/sh' })

	// Verify the concatenated file was created successfully
	const concatenatedFile = join(tmp, `60'fps_1.concat.mp4`)
	const concatenatedAttrs = await videoAttrs(concatenatedFile)

	// Should produce a valid video with reasonable duration
	ok(parseFloat(concatenatedAttrs.duration) > 0, `concatenated video should have valid duration, got ${concatenatedAttrs.duration}`)
})
