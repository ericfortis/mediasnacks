/**
 * Removes trailing zeros and a trailing decimal point.
 *
 * Examples:
 *   cleanDecimals(3.1400) -> "3.14"
 *   cleanDecimals(5.0) -> "5"
 */
export const cleanDecimals = Number

/**
 * Converts seconds to a string like "9h9m9s".
 *
 * Examples:
 *   formatSeconds(1.1) -> "1.1s"
 *   formatSeconds(3661, 2) -> "1h1m1s"
 *   formatSeconds(3661.0, 2) -> "1h1m1s"
 *   formatSeconds(3661.25, 2) -> "1h1m1.25s"
 */
export function formatSeconds(seconds, maxDecimals = 2) {
	const intSeconds = seconds | 0
	const partialSeconds = seconds % 60
	const minutes = (intSeconds % 3600) / 60 | 0
	const hours = intSeconds / 3600 | 0

	let result = ''
	if (hours) result += hours + 'h'
	if (minutes) result += minutes + 'm'
	if (partialSeconds || !result) result += cleanDecimals(partialSeconds.toFixed(maxDecimals)) + 's'
	return result
}
