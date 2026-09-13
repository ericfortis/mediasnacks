import { equal } from 'node:assert/strict'
import { after, beforeEach, describe, mock, test } from 'node:test'
import { printProgress, HIDE_CURSOR, SHOW_CURSOR, ERASE_TO_END } from './printProgress.js'

describe('printProgress', () => {
	let out
	const spy = mock.method(process.stdout, 'write', c => out += String(c))
	after(() => spy.mock.restore())
	beforeEach(() => out = '')

	test('100% shows cursor and newline', () => {
		printProgress(1)
		equal(out, `${HIDE_CURSOR}\r███████████████████████████████████████████  100%${ERASE_TO_END}\n${SHOW_CURSOR}`)
	})

	test('appends elapsed and ETA', () => {
		printProgress(0.25, 33_000, 449_000)
		equal(out, `${HIDE_CURSOR}\r██████████▊───────────────────────────────── 25.0% • ETA 7m29s • 33s${ERASE_TO_END}`)
	})

	test('elapsed and ETA omitted when falsy', () => {
		printProgress(0.25, 0, NaN)
		equal(out, `${HIDE_CURSOR}\r██████████▊───────────────────────────────── 25.0%${ERASE_TO_END}`)
	})

	for (const [p, expected] of Object.entries({
		0: ' ───────────────────────────────────────────',
		0.05: '██▏─────────────────────────────────────────',
		0.1: '████▎───────────────────────────────────────',
		0.15: '██████▍─────────────────────────────────────',
		0.2: '████████▌───────────────────────────────────',
		0.25: '██████████▊─────────────────────────────────',
		0.3: '████████████▉───────────────────────────────',
		0.35: '███████████████ ────────────────────────────',
		0.55: '███████████████████████▋────────────────────',
	}))
		test(`partial char ${p}`, () => {
			printProgress(Number(p))
			equal(out, `${HIDE_CURSOR}\r${expected} ${(Number(p) * 100).toFixed(1)}%${ERASE_TO_END}`)
		})
})