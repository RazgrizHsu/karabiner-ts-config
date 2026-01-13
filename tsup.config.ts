import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['src/index.ts', 'src/bin/cli.ts'],
	format: ['cjs'],
	dts: true,
	clean: true,
	outDir: 'dist'
})
