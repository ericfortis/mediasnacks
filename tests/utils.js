import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

export function sha1(filePath) {
	return createHash('sha1').update(readFileSync(filePath)).digest('hex')
}

export function videoAttr(filePath, attr) {
	const mapping = {
		duration: 'format=duration',
		frames: 'stream=nb_read_frames'
	}
	const entry = mapping[attr] || attr
	const result = execSync(
		`ffprobe -v error -select_streams v:0 -count_frames -show_entries ${entry} -of default=noprint_wrappers=1:nokey=1 "${filePath}"`,
		{ encoding: 'utf8' }
	)
	return parseFloat(result.trim())
}
