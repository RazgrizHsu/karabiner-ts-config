#!/usr/bin/env node

import { resolve, dirname } from 'path'
import { existsSync, writeFileSync, mkdirSync } from 'fs'
import { homedir } from 'os'
import { createInterface } from 'readline'

const cfgPath = process.argv[2]
const outPath = process.argv[3]

if (!cfgPath) {
	console.error('Usage: karabiner-ts-config <config-file> [output-file]')
	console.error('Example: karabiner-ts-config my-config.ts ~/.config/karabiner/karabiner.json')
	console.error('Example: karabiner-ts-config my-config.ts (outputs to ~/.config/karabiner/karabiner.json)')
	process.exit(1)
}

const path = resolve(cfgPath)
const defaultKarabinerPath = resolve(homedir(), '.config', 'karabiner', 'karabiner.json')
const outputPath = outPath ? resolve(outPath) : defaultKarabinerPath

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
		if (typeof uMod.default === 'function') rst = uMod.default()
		else if (typeof uMod === 'function') rst = uMod()
		else {
			console.error('Error: Configuration file must export a function that returns the config')
			console.error('Example: export default () => config')
			process.exit(1)
		}

		let cfg
		if (rst && typeof rst.toJSON === 'function') cfg = rst.toJSON()
		else if (typeof rst === 'string') {
			try { cfg = JSON.parse(rst) }
			catch (parseErr) {
				console.error('Error: Returned string is not valid JSON')
				console.error('Details:', parseErr instanceof Error ? parseErr.message : String(parseErr))
				process.exit(1)
			}
		}
		else if (rst && typeof rst === 'object') cfg = rst
		else {
			console.error('Error: Configuration function must return a Config object, config object, or JSON string')
			process.exit(1)
		}

		if (!cfg || typeof cfg !== 'object') {
			console.error('Error: Invalid configuration object')
			process.exit(1)
		}

		// Basic Karabiner format validation
		if (!cfg.profiles || !Array.isArray(cfg.profiles)) throw new Error('Missing or invalid "profiles" array')

		if (cfg.profiles.length === 0) throw new Error('At least one profile is required')

		// Check if first profile has required structure
		const firstProfile = cfg.profiles[0]
		if (!firstProfile.name) throw new Error('Profile must have a "name" field')

		// Check if output file exists and ask for confirmation
		if (existsSync(outputPath)) {
			const shouldOverwrite = await askUserConfirmation(`⚠️  File ${outputPath} already exists. Overwrite? (y/N): `)
			if (!shouldOverwrite) {
				console.log('❌ Operation cancelled')
				process.exit(0)
			}
		}

		// Ensure output directory exists
		const outputDir = dirname(outputPath)
		if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true })

		// Write configuration to file
		writeFileSync(outputPath, JSON.stringify(cfg, null, 2))
		console.log(`✅ Configuration written to ${outputPath}`)

	} catch (err) {
		console.error('Error: Failed to generate configuration')
		console.error(err instanceof Error ? err.message : String(err))
		process.exit(1)
	}
}

main()
