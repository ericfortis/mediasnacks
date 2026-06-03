#!/usr/bin/env node

import { join } from 'node:path'
import { execSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { commandsSummary } from './src/cli.js'

let zshFuncDefsDirs
try {
	zshFuncDefsDirs = execSync('zsh -c "print -l \\$fpath"', { encoding: 'utf-8' })
}
catch {
	process.exit(0) // Exit on systems without ZSH
}

for (const dir of zshFuncDefsDirs.split('\n'))
	try {
		writeFileSync(join(dir, '_mediasnacks'), makeScript(), { mode: 0o755 })
		break
	}
	catch {}


function makeScript() {
	return `#compdef mediasnacks

_mediasnacks_commands=(
${commandsSummary().map(([cmd, desc]) => `'${cmd}:${desc.trim()}'`).join('\n')}
)

if (( CURRENT == 2 )); then
	_describe -t commands 'mediasnacks commands' _mediasnacks_commands
	return
fi

local cmd="$words[2]"
case "$cmd" in
	qdir|openrand)
		_path_files -/
		;;
	*)
		_files
		;;
esac
`
}


