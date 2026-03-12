import { join } from 'node:path'
import { test } from 'node:test'
import { equal } from 'node:assert/strict'
import { tmpdir } from 'node:os'
import { execSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'

import { videoAttrs } from '../src/utils/ffmpeg.js'


test('PNG to AVIF', async () => {
	const tmp = mkdtempSync(join(tmpdir(), 'avif-test-'))
	execSync(`src/cli.js avif --output-dir ${tmp} tests/fixtures/lenna.png`)

	const generated = await videoAttrs(join(tmp, 'lenna.avif'))
	const fixture = await videoAttrs('tests/fixtures/lenna.avif')

	// Compare image properties instead of binary hash
	equal(generated.codec_name, fixture.codec_name, 'codec should match')
	equal(generated.width, fixture.width, 'width should match')
	equal(generated.height, fixture.height, 'height should match')
	equal(generated.pix_fmt, fixture.pix_fmt, 'pixel format should match')
})
