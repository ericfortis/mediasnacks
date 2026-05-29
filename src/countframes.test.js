import { equal } from 'node:assert/strict'
import { join } from 'node:path'
import { describe, test } from 'node:test'
import { cli } from './utils/test-utils.js'


const rel = f => join(import.meta.dirname, f)

describe('countframes', () => {
	const V = rel('fixtures/60fps.mp4') // 30s
	const V_FPS = 60
	const V_SEC = 30

	const count = (...opts) => Number(
		cli('countframes', ...opts, V).stdout.toString())

	test('custom fps, start, end', () => equal(
		count('--fps', 12, '--start', 1, '--end', 3),
		12 * 2))

	test('0 when start equals end', () => equal(
		count('--start', 1, '--end', 1),
		0))

	test(`defaults to all range (${V_SEC}s long)`, () => equal(
		count(),
		V_SEC * V_FPS))

	test('uses video fps when fps is empty', () => equal(
		count('--end', 2),
		2 * V_FPS))
})
