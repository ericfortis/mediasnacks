export function parseTimecode(time) {
	if (Number.isFinite(time))
		return time

	const parts = time.split(':').map(Number)
	if (parts.some(isNaN) || parts.length > 3)
		throw new Error(`Invalid time: ${time}`)

	if (parts.length === 3) // HH:MM:SS or HH:MM:SS.mmm
		return (3600 * parts[0]) + (60 * parts[1]) + parts[2]

	if (parts.length === 2) // MM:SS or MM:SS.mmm
		return (60 * parts[0]) + parts[1]

	return parts[0]
}
