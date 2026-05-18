import { test } from 'node:test'
import { join } from 'node:path'
import { equal } from 'node:assert/strict'
import { cli } from './utils/test-utils.js'

const rel = f => join(import.meta.dirname, f)

function detect(video) {
	const { stdout } = cli('detectdups', rel(video), 0, 7)
	return JSON.parse(stdout).n
}


test('no dups', () =>
	equal(detect('fixtures/big-buck-bunny/bbb_24fps_no_dups.mp4'), null))


// These fixtures are badly retimed (non-interpolated, just duplicating a frame)

test('24 to 48 (has dup at n=2)', () =>
	equal(detect('fixtures/big-buck-bunny/bbb_24_to_48fps_dup.mp4'), 2))

test('25 to 50 (has dup at n=2)', () =>
	equal(detect('fixtures/big-buck-bunny/bbb_25_to_50fps_dup.mp4'), 2))


test('24 to 30 (has dup at n=5)', () =>
	equal(detect('fixtures/big-buck-bunny/bbb_24_to_30fps_dup.mp4'), 5))

test('25 to 30 (has dup at n=6)', () =>
	equal(detect('fixtures/big-buck-bunny/bbb_25_to_30fps_dup.mp4'), 6))


test('24 to 25 (has dup at n=25)', () =>
	equal(detect('fixtures/big-buck-bunny/bbb_24_to_25fps_dup.mp4'), 25))

