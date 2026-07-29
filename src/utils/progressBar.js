export function printProgress(progress) {
	process.stdout.write(`\r${progressBar(progress)} ${(progress * 100).toFixed(1)}%`)
	if (progress === 1)
		process.stdout.write('\n')
}

function progressBar(progress, width = 42) {
	const nFull = (width * progress) | 0
	const fPartial = (width * progress) - nFull
	const nRemaining = width - nFull
	const partials = [' ', '▎', '▍', '▋']
	const partial = partials[Math.min((partials.length * fPartial) | 0, partials.length - 1)]
	return '█'.repeat(nFull) + partial + '⠂'.repeat(nRemaining)
}
