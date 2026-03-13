import { ok } from 'node:assert/strict'
import { join } from 'node:path'
import { test } from 'node:test'
import { tmpdir } from 'node:os'
import { execSync } from 'node:child_process'
import { mkdtempSync, cpSync } from 'node:fs'

import { videoAttrs } from './utils/ffmpeg.js'

const rel = f => join(import.meta.dirname, f)


test('vtrim trims video from start to end time', async () => {
	const tmp = mkdtempSync(join(tmpdir(), 'vtrim-test-'))

	const inputFile = join(tmp, '60fps.mp4')
	cpSync(rel('fixtures/60fps.mp4'), inputFile)

	execSync(`${rel('cli.js')} vtrim 5 10 ${inputFile}`)

	const { duration } = await videoAttrs(join(tmp, '60fps.trim.mp4'))
	const EPSILON = 0.05
	ok(Math.abs(parseFloat(duration) - 5) < EPSILON, `Duration should be 5s, got ${duration}s`)
})
