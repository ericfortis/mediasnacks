import { join } from 'node:path'
import { test } from 'node:test'
import { equal, partialDeepStrictEqual } from 'node:assert/strict'
import { cli } from './utils/test-utils.js'

const VIDEO = join(import.meta.dirname, 'fixtures/60fps.mp4')

test('prints width, height, fps, duration, codec, and name', () => {
	const { stdout } = cli('info', VIDEO)
	equal(stdout.toString(), `1920\t1080\t   60fps\t     30s\th264\t${VIDEO}\n`)
})

test('--all prints video attrs as JSON', () => {
	const { stdout } = cli('info', '--all', VIDEO)
	const attrs = JSON.parse(stdout.toString())
	partialDeepStrictEqual(attrs, {
		width: 1920,
		height: 1080,
		r_frame_rate: '60/1',
		codec_name: 'h264',
		has_b_frames: 2,
		duration: '30.000000'
	})
})
