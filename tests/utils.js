import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

export function sha1(filePath) {
	return createHash('sha1').update(readFileSync(filePath)).digest('hex')
}
