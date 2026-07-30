import { equal } from 'node:assert/strict'
import { describe, test } from 'node:test'
import { formatSeconds } from './formatSeconds.js'

describe('formatSeconds', () => {
	const m = 60
	const h = 60 * m

	const tests = {
		'zero (no decimals)': [0, 0, '0s'],
		'rounds seconds (no decimals)': [4.6, 0, '5s'],
		'zero': [0, 2, '0s'],
		'rounds seconds': [1.209, 2, '1.21s'],
		'strips trailing zeroes': [1.2, 2, '1.2s'],
		'seconds': [1, 2, '1s'],
		'minutes': [m, 2, '1m'],
		'hours': [h, 2, '1h'],
		'minutes + seconds': [m + 2, 2, '1m2s'],
		'hours + minutes + seconds': [h + 2 * m + 3, 2, '1h2m3s'],
		'days (shown as hours)': [25 * h, 2, '25h']
	}

	for (const [name, [seconds, decimals, expected]] of Object.entries(tests))
		test(name, () => equal(formatSeconds(seconds, decimals), expected))
})
