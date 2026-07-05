import { equal } from 'node:assert/strict'
import { join } from 'node:path'
import { test, describe } from 'node:test'
import { mimeFor } from './mimeFor.js'


const rel = f => join(import.meta.dirname, f)

describe('mimeFor', () => {
	test('PNG', async () =>
		equal(await mimeFor(rel('../fixtures/lenna.png')), 'image/png'))

	test('AVIF', async () =>
		equal(await mimeFor(rel('../fixtures/lenna.avif')), 'image/avif'))
})
