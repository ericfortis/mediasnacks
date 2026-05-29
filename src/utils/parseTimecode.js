export function parseTimecode(time) {
	if (Number.isFinite(time))
		return time

	const parts = time.split(':').map(Number)
	if (parts.some(isNaN) || parts.length > 3)
		throw new Error(`Invalid time: ${time}`)

	// HH:MM:SS or HH:MM:SS.mmm
	if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]

	// MM:SS or MM:SS.mmm
	if (parts.length === 2) return parts[0] * 60 + parts[1]

	return parts[0]
}
