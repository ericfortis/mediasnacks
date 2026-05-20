import { join } from 'node:path'
import { execSync } from 'node:child_process'
import { writeFileSync, accessSync, constants } from 'node:fs'
import { COMMANDS } from './src/cli.js'

let fpathDirs
try {
	const output = execSync('zsh -c "print -l \\$fpath"', {
		encoding: 'utf-8',
		stdio: ['ignore', 'pipe', 'ignore']
	})
	fpathDirs = output.split('\n').map(dir => dir.trim()).filter(Boolean)
}
catch {
	process.exit(0) // Exit on systems without ZSH
}

const completionScript = `#compdef mediasnacks

_mediasnacks_commands=(
${(Object.entries(COMMANDS).map(([cmd, [, desc]]) =>
	`  '${cmd}:${desc.trim().replace(/:/g, '\\:')}'`).join('\n'))}
)

if (( CURRENT == 2 )); then
	_describe -t commands 'mediasnacks commands' _mediasnacks_commands
	return
fi

local cmd="$words[2]"
case "$cmd" in
	qdir)
		_files -/
		;;
	*)
		_files
		;;
esac
`

for (const dir of fpathDirs)
	try {
		accessSync(dir, constants.W_OK)
		writeFileSync(join(dir, '_mediasnacks'), completionScript, { mode: 0o755 })
		break
	}
	catch {
		// Directory not writable or other error, try next
	}

