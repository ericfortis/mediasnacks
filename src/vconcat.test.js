import { ok } from 'node:assert/strict'
import { join } from 'node:path'
import { test } from 'node:test'
import { tmpdir } from 'node:os'
import { execSync } from 'node:child_process'
import { mkdtempSync, cpSync } from 'node:fs'

import { videoAttrs } from './utils/ffmpeg.js'

const rel = f => join(import.meta.dirname, f)

test('vconcat concatenates videos with single quotes in filenames', async () => {
	const tmp = mkdtempSync(join(tmpdir(), 'vconcat-test-'))

	const file1 = join(tmp, `video'1.mp4`)
	const file2 = join(tmp, `video'2.mp4`)
	cpSync(rel('fixtures/60fps.mp4'), file1)
	cpSync(rel('fixtures/60fps.mp4'), file2)

	execSync(`${rel('cli.js')} vconcat "${file1}" "${file2}"`)

	const { duration } = await videoAttrs(join(tmp, `video'1.concat.mp4`))
	ok(parseFloat(duration) === 60, `Duration should be 60s, got ${duration}s`)
})
