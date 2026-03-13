import { join } from 'node:path'
import { test } from 'node:test'
import { ok } from 'node:assert/strict'
import { tmpdir } from 'node:os'
import { execSync } from 'node:child_process'
import { mkdtempSync, cpSync } from 'node:fs'
import { videoAttrs } from '../src/utils/ffmpeg.js'

test('vtrim trims video from start to end time', async () => {
	const tmp = mkdtempSync(join(tmpdir(), 'vtrim-test-'))

	const inputFile = join(tmp, '60fps.mp4')
	cpSync('tests/fixtures/60fps.mp4', inputFile)

	execSync(`src/cli.js vtrim 5 10 ${inputFile}`)

	const { duration } = await videoAttrs(join(tmp, '60fps.trim.mp4'))
	const EPSILON = 0.05
	ok(Math.abs(parseFloat(duration) - 5) < EPSILON, `Duration should be 5s, got ${duration}s`)
})
