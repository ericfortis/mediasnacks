import { formatSeconds } from './formatSeconds.js'

const HIDE_CURSOR = '\x1b[?25l'
const SHOW_CURSOR = '\x1b[?25h'
const ERASE_TO_END = '\x1b[K'

export const showCursor = () => process.stdout.write(SHOW_CURSOR)

export function printProgress(progress, msElapsed, msETA) {
	const elapsed = msElapsed
		? ` • ${formatSeconds(msElapsed / 1000, 0)}`
		: ''
	const eta = msETA
		? ` • ETA ${formatSeconds(msETA / 1000, 0)}`
		: ''
	const percent = progress === 1
		? '100%'
		: `${(progress * 100).toFixed(1)}%`
	process.stdout.write(HIDE_CURSOR)
	process.stdout.write(`\r${progressBar(progress)} ${percent}${eta}${elapsed}${ERASE_TO_END}`)
	if (progress === 1)
		process.stdout.write('\n' + SHOW_CURSOR)
}

function progressBar(progress, width = 44) {
	width-- // for partial char
	const nFull = (width * progress) | 0
	const fPartial = (width * progress) - nFull
	const nRemaining = width - nFull

	const partials = ' ▏▎▍▌▋▊▉'
	const partial = partials.at(partials.length * fPartial)
	return '█'.repeat(nFull) + partial + '•'.repeat(nRemaining)
}
