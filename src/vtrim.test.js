import { ok } from 'node:assert/strict'
import { join } from 'node:path'
import { cpSync } from 'node:fs'
import { describe, test } from 'node:test'

import { videoAttrs } from './utils/ffmpeg.js'
import { mkTempDir, cli } from './utils/test-utils.js'

const rel = f => join(import.meta.dirname, f)


describe('vtrim', () => {
	function almostEqual(actual, expected) {
		const EPSILON = 0.05
		ok(Math.abs(parseFloat(actual) - expected) < EPSILON,
			`Duration should be around ${expected}s, got ${actual}s`)
	}

	const tmp = mkTempDir('vtrim')
	const inputFile = join(tmp, '60fps.mp4')
	cpSync(rel('fixtures/60fps.mp4'), inputFile)

	test('from start to end time', async () => {
		cli('vtrim', '--start', 5, '--end', 11, inputFile)
		const { duration } = await videoAttrs(join(tmp, '60fps.trim.mp4'))
		almostEqual(duration, 6)
	})

	test('start time only', async () => {
		cli('vtrim', '--start', 5, inputFile)
		const { duration } = await videoAttrs(join(tmp, '60fps.trim.mp4'))
		almostEqual(duration, 25)
	})

	test('end time only', async () => {
		cli('vtrim', '--end', 11, inputFile)
		const { duration } = await videoAttrs(join(tmp, '60fps.trim.mp4'))
		almostEqual(duration, 11)
	})
})
