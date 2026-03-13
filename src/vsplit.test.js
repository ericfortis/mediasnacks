import { ok } from 'node:assert/strict'
import { join } from 'node:path'
import { describe, test } from 'node:test'
import { cpSync, readdirSync } from 'node:fs'

import { videoAttrs } from './utils/ffmpeg.js'
import { mkTempDir, cli } from './utils/test-utils.js'


const rel = f => join(import.meta.dirname, f)

describe('vsplit splits video into multiple clips from CSV', () => {
	const tmp = mkTempDir('vsplit')

	const csvFile = join(tmp, '60fps.csv')
	const inputFile = join(tmp, '60fps.mp4')

	cpSync(rel('fixtures/60fps.csv'), csvFile)
	cpSync(rel('fixtures/60fps.mp4'), inputFile)
	cli('vsplit', csvFile, inputFile)

	test('all 6 clips were created', () => {
		const files = readdirSync(tmp).filter(f => f.startsWith('60fps_'))
		ok(files.length === 6, `Expected 6 clips, got ${files.length}`)
	})

	test('first clip has correct duration (5 seconds)', async () => {
		const { duration } = await videoAttrs(join(tmp, '60fps_1.mp4'))
		const EPSILON = 0.05
		ok(Math.abs(parseFloat(duration) - 5) < EPSILON, `Duration should be 5s, got ${duration}s`)
	})
})
