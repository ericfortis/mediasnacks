import { join } from 'node:path'
import { test } from 'node:test'
import { equal } from 'node:assert/strict'
import { cli } from './utils/test-utils.js'

const rel = f => join(import.meta.dirname, f)

test('base64', () => {
	const input = rel('fixtures/lenna-blur.avif')
	const expected = 'AAAAHGZ0eXBhdmlmAAAAAG1pZjFhdmlmbWlhZgAAAOptZXRhAAAAAAAAACFoZGxyAAAAAAAAAABwaWN0AAAAAAAAAAAAAAAAAAAAAA5waXRtAAAAAAABAAAAImlsb2MAAAAAREAAAQABAAAAAAEOAAEAAAAAAAAArgAAACNpaW5mAAAAAAABAAAAFWluZmUCAAAAAAEAAGF2MDEAAAAAamlwcnAAAABLaXBjbwAAAAxhdjFDgSACAAAAABNjb2xybmNseAABAA0AAIAAAAAUaXNwZQAAAAAAAABgAAAAYAAAABBwaXhpAAAAAAMICAgAAAAXaXBtYQAAAAAAAAABAAEEgQIDBAAAALZtZGF0EgAKCTgZr99lAQ0AIDKeARNwB99d8RnA0XqbqAvQxny4scYrJFXhEw4mPZYqoEEiFZNj4pMe8BB3eKqYOgl0GwDUMYnOwcZFHVjIc/ndU5WcaHrMKVW775XwV6SqGbE96kMWhKaKVL5jH1p8hguPSon8LerFHzdQipZ+/DEKH7R1aGkLPue/x+URlDA/V8TjRjH7aoEE5P8eOASv6u6uDg5Hz4xsWya44N+7FHUg'

	test('css', () => {
		const { stdout } = cli('base64', '--css', input)
		equal(stdout.toString().trim(), `background-image: url(data:image/avif;base64,${expected});`)
	})

	test('img', () => {
		const { stdout } = cli('base64', '--img', input)
		equal(stdout.toString().trim(), `<img src="data:image/avif;base64,${expected}" />`)
	})

	test('plain', () => {
		const { stdout } = cli('base64', input)
		equal(stdout.toString().trim(), expected)
	})
})
