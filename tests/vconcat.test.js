import { join } from 'node:path'
import { test } from 'node:test'
import { ok } from 'node:assert/strict'
import { tmpdir } from 'node:os'
import { execSync } from 'node:child_process'
import { mkdtempSync, cpSync } from 'node:fs'
import { videoAttrs } from '../src/utils/ffmpeg.js'

test('vconcat concatenates videos with single quotes in filenames', async () => {
	const tmp = mkdtempSync(join(tmpdir(), 'vconcat-test-'))

	const file1 = join(tmp, `video'1.mp4`)
	const file2 = join(tmp, `video'2.mp4`)
	cpSync('tests/fixtures/60fps.mp4', file1)
	cpSync('tests/fixtures/60fps.mp4', file2)

	execSync(`src/cli.js vconcat "${file1}" "${file2}"`)

	const { duration } = await videoAttrs(join(tmp, `video'1.concat.mp4`))
	ok(parseFloat(duration) === 60, `Duration should be 60s, got ${duration}s`)
})
