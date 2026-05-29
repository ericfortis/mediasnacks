import { equal } from 'node:assert/strict'
import { describe, test } from 'node:test'
import { parseTimecode } from './parseTimecode.js'


describe('parseTimecode', () => {
	[
		[3.5, 3.5],
		['90', 90],
		['01:30', 90],
		['1:30.5', 90.5],
		['1:01:30', 3690],
		['1:01:30.250', 3690.25],
	].forEach(([input, expected]) =>
		test(input, () => equal(parseTimecode(input), expected)))
})
