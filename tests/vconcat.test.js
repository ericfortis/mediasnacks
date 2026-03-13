import { join } from 'node:path'
import { test } from 'node:test'
import { ok } from 'node:assert/strict'
import { tmpdir } from 'node:os'
import { execSync } from 'node:child_process'
import { mkdtempSync, cpSync, existsSync } from 'node:fs'
import { videoAttrs } from '../src/utils/ffmpeg.js'

test('vconcat concatenates videos with single quotes in filenames', async () => {
	const tmp = mkdtempSync(join(tmpdir(), 'vconcat-test-'))

	// Copy test files with single quotes in filenames to test escaping
	const file1 = join(tmp, `video'1.mp4`)
	const file2 = join(tmp, `video'2.mp4`)
	cpSync('tests/fixtures/60fps.mp4', file1)
	cpSync('tests/fixtures/60fps.mp4', file2)

	// Concatenate the files (needs proper quoting in shell)
	execSync(`src/cli.js vconcat "${file1}" "${file2}"`, { cwd: process.cwd(), shell: '/bin/sh' })

	// Verify the concatenated file was created successfully
	const concatenatedFile = join(tmp, `video'1.concat.mp4`)
	ok(existsSync(concatenatedFile), 'Concatenated file should be created')

	const concatenatedAttrs = await videoAttrs(concatenatedFile)
	const duration = parseFloat(concatenatedAttrs.duration)

	// Should be approximately 60 seconds (30 + 30)
	ok(duration > 55 && duration < 65, `Duration should be ~60s, got ${duration}s`)
})
