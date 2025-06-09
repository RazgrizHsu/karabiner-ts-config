#!/usr/bin/env node

import { resolve, dirname } from 'path'
import { existsSync, writeFileSync, mkdirSync } from 'fs'
import { homedir } from 'os'
import { createInterface } from 'readline'

let argPathCfg: string | undefined = undefined
let argPathOut: string | undefined = undefined
let modeY: boolean = false

for (let i = 2; i < process.argv.length; i++) {
	const arg = process.argv[i]

	if (arg === '-y' || arg === 'y' || arg === 'true') modeY = true
	else {
		if (!argPathCfg) argPathCfg = arg
		else if (!argPathOut) argPathOut = arg
		else console.warn(`Warning: Unrecognized argument: ${arg}. Ignoring.`)
	}
}

if (!argPathCfg) {
	console.error('Usage: karabiner-ts-config <config-file> [output-file]')
	console.error('Example: karabiner-ts-config my-config.ts ~/.config/karabiner/karabiner.json')
	console.error('Example: karabiner-ts-config my-config.ts (outputs to ~/.config/karabiner/karabiner.json)')
	process.exit(1)
}

const pathKaraJson = resolve(homedir(), '.config', 'karabiner', 'karabiner.json')

const path = resolve(argPathCfg)
const pathTo = argPathOut ? resolve(argPathOut) : pathKaraJson

if (!existsSync(path)) {
	console.error(`Error: File not found ${path}`)
	process.exit(1)
}

async function askUserConfirmation(question: string): Promise<boolean> {
	const rl = createInterface({
		input: process.stdin,
		output: process.stdout
	})

	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			rl.close()
			resolve(answer.toLowerCase().startsWith('y'))
		})
	})
}

async function main() {
	try {
		const uMod = require(path)

		let rst
		if (typeof uMod.default == 'function') rst = uMod.default()
		else if (typeof uMod == 'function') rst = uMod()
		else {
			console.error('Error: Configuration file must export a function that returns the config')
			console.error('Example: export default () => config')
			process.exit(1)
		}

		let obj
		if (rst && typeof rst.toJSON == 'function') obj = rst.toJSON()
		else if (typeof rst == 'string') {
			try { obj = JSON.parse(rst) }
			catch (parseErr) {
				console.error('Error: Returned string is not valid JSON')
				console.error('Details:', parseErr instanceof Error ? parseErr.message : String(parseErr))
				process.exit(1)
			}
		}
		else if (rst && typeof rst == 'object') obj = rst
		else {
			console.error('Error: Configuration function must return a Config object, config object, or JSON string')
			process.exit(1)
		}

		if (!obj || typeof obj !== 'object') {
			console.error('Error: Invalid configuration object')
			process.exit(1)
		}

		if (!obj.profiles || !Array.isArray(obj.profiles)) throw new Error('Missing or invalid "profiles" array')
		if (obj.profiles.length == 0) throw new Error('At least one profile is required')

		const pf = obj.profiles[0]
		if (!pf.name) throw new Error('Profile must have a "name" field')

		if (existsSync(pathTo) && !modeY) {
			const ans = await askUserConfirmation(`⚠️  File ${pathTo} already exists. Overwrite? (y/N): `)
			if (!ans) {
				console.log('❌ Operation cancelled')
				process.exit(0)
			}
		}

		const outDir = dirname(pathTo)
		if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

		writeFileSync(pathTo, rst.toString())
		console.log(`✅ Configuration written to ${pathTo}`)

	} catch (err) {
		console.error('Error: Failed to generate configuration')
		console.error(err instanceof Error ? err.message : String(err))
		process.exit(1)
	}
}

main()
