import { test } from 'node:test'
import { deepEqual } from 'node:assert/strict'
import { extractSeqNums, findMissingNumbers } from '../src/seqcheck.js'


test('extractSeqNums extracts sequence numbers from filenames', () => {
	const filenames = [
		'video-111_001.mov',
		'video-111_002.mov',
		'video-111_004.mov',
		'bad.mov',
		'bad_too_a39.mov',
	]
	deepEqual(extractSeqNums(filenames, '_', '.'), [1, 2, 4])
})


test('findMissingNumbers ', () => {
	test('finds gaps in a sequence', () =>
		deepEqual(findMissingNumbers([1, 2, 4, 5, 8]), [3, 6, 7]))

	test('returns empty array for empty input', () =>
		deepEqual(findMissingNumbers([]), []))

	test('returns empty array when there are no gaps', () =>
		deepEqual(findMissingNumbers([10, 11, 12]), []))
})
