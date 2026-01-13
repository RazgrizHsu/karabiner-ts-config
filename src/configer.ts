import { IAlone, IKaraCfg, IKaraCfgGlobal, IKaraRule, IManipulator, IManipulatorHeld } from './types'
import { IToEvent } from './types'
import { IDevice, IDeviceIds, IDeviceCondType, ICondDevice } from './types'
import { ISimple } from './types'
import { IKey, IMods, Key, Mouse, Mod } from './types'
import { IKeyDefine, IKeyDefines } from './types'

import { icon } from './icon'

export type IConfigDevice = Device | Config

export const DEBUG = false

enum DvcType {
    If = 'device_if',
    Unless = 'device_unless',
    ExistsIf = 'device_exists_if',
    ExistsUnless = 'device_exists_unless'
}

type IOnAlone = { key?:Key, holdMs?:number, apple?:boolean }

namespace util {
	// open -a "app", unmin=true to restore minimized windows
	export function mkCmd_Open(app: string, unmin = false): string {
		let cmd = `open -a "${app}"`
		if (unmin) cmd += `; osascript -e 'tell application "System Events" to tell process "${app}" to set value of attribute "AXMinimized" of every window to false'`
		return cmd
	}

	// osascript activate, withOpen=true to also run open -a
	export function mkCmd_Activate(app: string, withOpen = false): string {
		let cmd = `osascript -e 'tell application "${app}" to activate'`
		if (withOpen) cmd = `open -a "${app}"; ${cmd}`
		return cmd
	}

	// open url: opt=true for background, opt=string for specific app
	export function mkCmd_OpenUrl(url: string, opt?: boolean | string): string {
		if (typeof opt === 'string') return `osascript -e 'tell application "${opt}" to open location "${url}"'`
		return opt ? `open -g '${url}'` : `open '${url}'`
	}
}

namespace cfg {

	const deviceToCondition = (device: Device): ICondDevice => {
		return {
			type: device.type,
			identifiers: [device.ids]
		}
	}

	const mkFrom = (key: IKey, mods: IMods) => {

		const from: any = { key_code: key as string }

		const modMay: string[] = []
		let hasAny = false

		mods.forEach(mod => {
			if (mod.toString() === 'any') {
				hasAny = true
			} else {
				modMay.push(mod.toString())
			}
		})

		if (hasAny || modMay.length > 0) {
			from.modifiers = {}

			if (hasAny) from.modifiers.optional = ['any']
			if (modMay.length > 0) from.modifiers.mandatory = modMay
		}

		return from;
	};

	const mkMr = (desc: string, keyC: Key, mods: IMods, toEvent: IToEvent, conds?: any[]) => ({
		description: desc,
		type: 'basic' as const,
		from: mkFrom(keyC, mods ),
		to: [toEvent],
		...(conds && { conditions: conds })
	})

	const fmtDest = (dst: IKey, dstMods?: IMods): IToEvent => {
		if (dst === Mouse.left || dst === Mouse.right || dst === Mouse.middle) return { pointing_button: dst as Mouse }
		if (typeof dst === 'string' && !Object.values(Key).includes(dst as Key)) return { shell_command: dst }

		const evt: IToEvent = { key_code: dst as Key }
		if (dstMods?.length) evt.modifiers = dstMods.map(m => m.toString())
		return evt
	}

	const formatDeviceInfo = (device?: Device): string => {
		if (!device) return ''
		return `[VID:${device.ids.vendor_id},PID:${device.ids.product_id}] `
	}

	const formatKeyMappingSummary = (maps: Array<{key: Key, desc: string}>): string => {
		if (maps.length === 0) return ''
		const keyList = maps.slice(0, 3).map(m => icon(m.key)).join('')
		const moreCount = maps.length > 3 ? `+${maps.length - 3}` : ''
		return ` - key[ ${keyList}${moreCount} ]`
	}

	const formatLayerDetails = (layers: Layer[], allLayers: Layer[], indent = ''): string => {
		if (layers.length === 0) return ''

		let result = ''
		for (const layer of layers) {
			const layerTitle = `${indent}------ + [ ${icon(layer.key)} ] : ${layer.dsc || 'Layer'} --------`
			result += `\n${layerTitle}\n`

			for (const map of layer.maps) {
				const srcK = icon(map.key)
				const dstK = map.keys.length > 0 ? icon(map.keys[0].key) : '??'
				const desc = map.dsc ? ` (${map.dsc})` : ''
				result += `${indent}  + [ ${srcK} ] = ${dstK}${desc}\n`
			}

			const subLayers = allLayers.filter(l => l.parent === layer)
			if (subLayers.length > 0) {
				result += formatLayerDetails(subLayers, allLayers, indent + '  ')
			}
		}

		return result
	}

	const mkConds = (baseVnm?: string, layVnms: string[] = [], excLays: string[] = [], deviceConds: ICondDevice[] = []) => {
		const conds: any[] = []
		if (baseVnm) conds.push({ type: 'variable_if', name: baseVnm, value: 1 })
		layVnms.forEach(layVnm => conds.push({ type: 'variable_if', name: layVnm, value: 1 }))
		excLays.forEach(layer => conds.push({ type: 'variable_if', name: layer, value: 0 }))
		deviceConds.forEach(deviceCond => conds.push(deviceCond))
		return conds
	}

	const getLayConds = (layer: Layer): string[] => {
		const layVnms: string[] = []
		let current: Layer | undefined = layer
		while (current) {
			layVnms.unshift(current.vName)
			current = current.parent
		}
		return layVnms
	}

	const procKeyMaps = (maps: Array<{ key: Key, mods: IMods, keys: IKeyDefines, desc: string, layer?: Layer }>, baseVnm?: string, excLays: string[] = [], defaultDeviceConds: ICondDevice[] = []) => {
		const mrs: IManipulator[] = []
		for (const map of maps) {
			for (const mapk of map.keys) {
				const dsts = Array.isArray(mapk.key) ? mapk.key : [mapk.key]
				for (const dst of dsts) {
					const toEvent = fmtDest(dst, mapk.mods)
					const layVnms = map.layer ? getLayConds(map.layer) : []
					const deviceConds = defaultDeviceConds
					const conds = mkConds(baseVnm, layVnms, excLays, deviceConds)
					mrs.push(mkMr(map.desc, map.key, map.mods, toEvent, conds.length > 0 ? conds : undefined))
				}
			}
		}
		return mrs
	}

	const procHeldDownMr = (km: RuleKeyMap, defaultDeviceConds: ICondDevice[] = []): IManipulatorHeld|null => {
		const hi = km.holdInfo!
		if( !hi.key && !hi.shell ) {
			return null
		}

		const mr: Partial<IManipulatorHeld> = {
			description: km.dscFul,
			type: 'basic',
			from:mkFrom(km.key, km.mods)
		}

		if (km.keys.length > 0) mr.to = km.keys.map(k => fmtDest(k.key, k.mods))
		if (hi.shell) {
			mr.to_if_held_down = [{ shell_command: hi.shell }]
			if (Object.keys(hi.args).length > 0) {
				if (!mr.parameters) mr.parameters = {}
				if (hi.args.delayedActionMs !== undefined) mr.parameters['basic.to_delayed_action_delay_milliseconds'] = hi.args.delayedActionMs
			}
		}
		if (hi.key) {
			const hevt = fmtDest(hi.key, hi.mods)
			mr.to_if_held_down = [hevt]

			mr.to_if_alone = [{ key_code:km.key}]
			// mr.to_if_alone = [{ key_code:km.key, halt:true}]
			mr.to_delayed_action = { to_if_canceled:[{ key_code:km.key }] }

			let ruha = km.rule.holdArgs
			let kmha = hi.args

			mr.parameters = {}
			let msth = ruha?.thresholdMs || kmha.thresholdMs || 150
			let msda = ruha?.delayedActionMs || kmha.delayedActionMs || 150
			// let msal = ruha?.aloneTimeoutMs || kmha.aloneTimeoutMs || 250
			if ( msth ) mr.parameters['basic.to_if_held_down_threshold_milliseconds'] = msth
			if ( msth ) mr.parameters['basic.to_delayed_action_delay_milliseconds'] = msda
			// if ( msal ) mr.parameters['basic.to_if_alone_timeout_milliseconds'] = msal

		}

		if (defaultDeviceConds.length > 0) mr.conditions = defaultDeviceConds

		if (DEBUG) console.info(`hold: ${JSON.stringify(mr)}`)

		return mr as IManipulatorHeld
	}

	const procTrigMrs = (ru: RuleBased, deviceConds: ICondDevice[] = []): IManipulator[] => {
		const mrs: IManipulator[] = []
		const exclLays = ru.layers.map(sl => sl.vName)


		let onAlone:IAlone = { key_code: Key.escape }
		if ( ru.onAlone && ru.onAlone.key ) {
			onAlone = { key_code: ru.onAlone.key }
		}

		if (ru.comboMode && ru.comboTarget) {

			mrs.push({
				description: `${ru.baseKey} T:1 -> Set ${ru.baseVar} variable`,
				type: 'basic',
				from: {
					key_code: ru.baseKey,
					modifiers: ru.baseMods.length > 0 ? { mandatory: ru.baseMods.map(m => m.toString()) } : { optional: [Mod.any] }
				},
				to: [{ set_variable: { name: ru.baseVar, value: 1 } }],
				to_after_key_up: [{ set_variable: { name: ru.baseVar, value: 0 } }],
				to_if_alone: [onAlone],
				...((exclLays.length > 0 || deviceConds.length > 0) && { conditions: mkConds(undefined, undefined, exclLays, deviceConds) })
			})

			mrs.push({
				description: `${ru.baseKey} T:2 -> ${ru.comboTarget.key} + mods`,
				type: 'basic',
				from: {
					key_code: ru.baseKey,
					modifiers: ru.baseMods.length > 0 ? { mandatory: ru.baseMods.map(m => m.toString()) } : { optional: [Mod.any] }
				},
				to: [
					{ set_variable: { name: ru.baseVar, value: 1 } },
					{
						key_code: ru.comboTarget.key,
						modifiers: ru.comboTarget.mods.map(m => m.toString())
					}
				],
				to_if_alone: [onAlone],
				to_after_key_up: [{ set_variable: { name: ru.baseVar, value: 0 } }],
				...((exclLays.length > 0 || deviceConds.length > 0) && { conditions: mkConds(undefined, undefined, exclLays, deviceConds) })
			})
		} else {
			// hold to change variable, press to get key

			if(!ru.onAlone.apple){

				if ( ru.onAlone.holdMs ) onAlone.hold_down_milliseconds = ru.onAlone.holdMs
				mrs.push({
					description: `${ru.baseKey} T:31 -> Set ${ru.baseVar} variable`,
					type: 'basic',
					from: {
						key_code: ru.baseKey,
						modifiers: ru.baseMods.length > 0 ? { mandatory: ru.baseMods.map(m => m.toString()) } : { optional: [Mod.any] }
					},
					to: [{ set_variable: { name: ru.baseVar, value: 1 } }],
					to_if_alone: [onAlone],
					to_after_key_up: [{ set_variable: { name: ru.baseVar, value: 0 } }],
					...((exclLays.length > 0 || deviceConds.length > 0) && { conditions: mkConds(undefined, undefined, exclLays, deviceConds) })
				})
			}
			else {
				// slow
				// mrs.push({
				// 	description: `${ru.baseKey} T:32 -> Set ${ru.baseVar} variable`,
				// 	type: 'basic',
				// 	from: {
				// 		key_code: ru.baseKey,
				// 		modifiers: ru.baseMods.length > 0 ? { mandatory: ru.baseMods.map(m => m.toString()) } : { optional: [Mod.any] }
				// 	},
				// 	// to: [{ set_variable: { name: ru.baseVar, value: 1 } }],
				// 	to_if_alone: [onAlone],
				// 	to_if_held_down: [{ set_variable: { name: ru.baseVar, value: 1 } }],
				// 	to_after_key_up: [{ set_variable: { name: ru.baseVar, value: 0 } }],
				// 	parameters: { "basic.to_if_held_down_threshold_milliseconds": ru.onAlone.holdMs ?? 200 },
				// 	...((exclLays.length > 0 || deviceConds.length > 0) && { conditions: mkConds(undefined, undefined, exclLays, deviceConds) })
				// })

				// This version allows fast typing, but the downside is that when pressing combo keys, there's no protection and the original key will also be output
				// mrs.push({
				// 	description: `${ru.baseKey} T:32 -> Set ${ru.baseVar} variable`,
				// 	type: 'basic',
				// 	from: { key_code: ru.baseKey, modifiers: ru.baseMods.length > 0 ? { mandatory: ru.baseMods.map(m => m.toString()) } : { optional: [Mod.any] } },
				// 	to: [{ set_variable: { name: ru.baseVar, value: 1 } }],
				// 	to_after_key_up: [{ set_variable: { name: ru.baseVar, value: 0 } }],
				// 	to_delayed_action:{
				// 		to_if_invoked: [{ key_code: ru.baseKey }],
				// 		to_if_canceled: [{ key_code: ru.baseKey }]
				// 	},
				// 	parameters: { "basic.to_delayed_action_delay_milliseconds": ru.onAlone.holdMs ?? 100 },
				// 	...((exclLays.length > 0 || deviceConds.length > 0) && { conditions: mkConds(undefined, undefined, exclLays, deviceConds) })
				// })


				// This is currently the best version I've tested so far, please let me know if you have better suggestions

				// onAlone.halt = true
				let holdMs = ru.onAlone.holdMs ?? 150
				mrs.push({
					description: `${ru.baseKey} T:32 -> Set ${ru.baseVar} variable`,
					type: 'basic',
					from: { key_code: ru.baseKey, modifiers: ru.baseMods.length > 0 ? { mandatory: ru.baseMods.map(m => m.toString()) } : { optional: [Mod.any] } },
					to_if_alone: [onAlone],
					to_if_held_down: [{ set_variable: { name: ru.baseVar, value: 1 } }],
					to_after_key_up: [{ set_variable: { name: ru.baseVar, value: 0 } }],
					to_delayed_action:{
						to_if_canceled: [{ key_code: ru.baseKey }]
					},
					parameters: {
						"basic.to_if_alone_timeout_milliseconds": holdMs,
						"basic.to_if_held_down_threshold_milliseconds": holdMs,
						"basic.to_delayed_action_delay_milliseconds": holdMs,
					},
					...((exclLays.length > 0 || deviceConds.length > 0) && { conditions: mkConds(undefined, undefined, exclLays, deviceConds) })
				})
			}
		}

		return mrs
	}

	const procLayerMr = (lay: Layer, deviceConds: ICondDevice[] = []): IManipulator[] => {
		const mrs: IManipulator[] = []

		const parentConds = lay.parent ? getLayConds(lay.parent) : []
		const conds = mkConds(lay.baseVar, parentConds, [], deviceConds)

		mrs.push({
			description: `Toggle layer ${lay.key}`,
			type: 'basic',
			from: { key_code: lay.key, modifiers: { optional: [Mod.any] } },
			to: [{ set_variable: { name: lay.vName, value: 1 } }],
			to_after_key_up: [{ set_variable: { name: lay.vName, value: 0 } }],
			...(conds.length > 0 && { conditions: conds })
		})

		const layKeyMaps = lay.maps.map(m => ({
			key: m.key,
			mods: m.mods,
			keys: m.keys,
			desc: m.dscFul,
			layer: lay
		}))
		const lays = lay.rule.bu.ruleBsds.flatMap(rb => rb.layers).map(l => l.vName)
		const layConsNow = getLayConds(lay)
		const exclLays = lays.filter(ln => !layConsNow.includes(ln))
		mrs.push(...procKeyMaps(layKeyMaps, lay.baseVar, exclLays, deviceConds))

		return mrs
	}



	const procSimpleMods = (simpleMaps: SimpleKeyMap[]): ISimple[] => {
		const smods: ISimple[] = []
		for (const sm of simpleMaps) {
			if (!sm.dst) continue

			let from = mkFrom( sm.key, sm.mods )
			let to: { key_code: string; modifiers?: string[] }
			if (!Object.values(Key).includes(sm.dst.key as Key)) throw new Error(`the key[${sm.dst.key}] is wrong`)

			to = {
				key_code: sm.dst.key as Key,
				...(sm.dst.mods?.length && { modifiers: sm.dst.mods.map(m => m.toString()) })
			}

			smods.push({ from, to })
		}
		return smods
	}

	export function toConfig(bu: Config) {
		bu.keyMap.clear()

		// Unified duplicate detection logic
		const keyRegistry = new Map<string, Array<{
			key: string,
			mods: string,
			source: string,
			deviceConds: ICondDevice[]
		}>>()

		const addKeyMapping = (key: Key, mods: IMods, source: string, deviceConds: ICondDevice[] = []) => {
			const keyStr = `${key}+${mods.join(',')}`

			// Check for conflicts with existing mappings
			for (const [deviceKey, mappings] of keyRegistry) {
				for (const mapping of mappings) {
					if (mapping.key === keyStr) {
						// Check if device conditions would cause conflicts
						const wouldConflict = deviceConditionsConflict(deviceConds, mapping.deviceConds)
						if (wouldConflict) {
							const keyDesc = mods.length > 0 ? `${key}+${mods.join('+')}` : key
							throw new Error(`Duplicate key combination: ${keyDesc} in ${source}`)
						}
					}
				}
			}

			// Use string representation of device conditions as key
			const deviceKey = deviceConds.length > 0
				? `device:${JSON.stringify(deviceConds.map(dc => ({ type: dc.type, identifiers: dc.identifiers })).sort())}`
				: 'global'

			if (!keyRegistry.has(deviceKey)) {
				keyRegistry.set(deviceKey, [])
			}

			keyRegistry.get(deviceKey)!.push({ key: keyStr, mods: mods.join(','), source, deviceConds })
		}

		// Check if two sets of device conditions would conflict
		const deviceConditionsConflict = (conds1: ICondDevice[], conds2: ICondDevice[]): boolean => {
			// If one has no device conditions, no conflict with any device conditions (unless both have none)
			if (conds1.length === 0 && conds2.length === 0) return true
			if (conds1.length === 0 || conds2.length === 0) return false

			// Simplified logic: only conflict if device conditions are exactly the same
			// Actually needs more complex logic to handle device_if vs device_unless etc.
			const conds1Str = JSON.stringify(conds1.map(dc => ({ type: dc.type, identifiers: dc.identifiers })).sort())
			const conds2Str = JSON.stringify(conds2.map(dc => ({ type: dc.type, identifiers: dc.identifiers })).sort())
			return conds1Str === conds2Str
		}

		// Detect Simple Key Mappings
		for (const sm of bu.simples) {
			if (sm.dst) {
				addKeyMapping(sm.key, sm.mods, `Config.map(${sm.key})`, [])
			}
		}

		// Detect RuleBased Base Keys
		for (const rub of bu.ruleBsds) {
			const deviceDesc = rub.dvc
				? `Device.ruleBaseBy(${rub.baseKey})`
				: `Config.ruleBaseBy(${rub.baseKey})`
			const rubDeviceConds = rub.dvc ? [deviceToCondition(rub.dvc)] : []
			addKeyMapping(rub.baseKey, rub.baseMods, deviceDesc, rubDeviceConds)
		}

		// Detect duplicates within each RuleBased (not cross-rule checking)
		for (const rub of bu.ruleBsds) {
			// Detect key mappings within RuleBased
			const rubRegistry = new Map<string, string>()
			for (const map of rub.maps) {
				const keyStr = `${map.key}+${map.mods.join(',')}`
				if (rubRegistry.has(keyStr)) {
					const mapSource = `${rub.dsc || 'RuleBased'}.map(${map.key})`
					const keyDesc = map.mods.length > 0 ? `${map.key}+${map.mods.join('+')}` : map.key
					throw new Error(`Duplicate key combination: ${keyDesc} in ${mapSource}`)
				}
				rubRegistry.set(keyStr, `${rub.dsc || 'RuleBased'}.map(${map.key})`)
			}

			// Detect key mappings within Layers (each layer checked independently)
			for (const layer of rub.layers) {
				const layerRegistry = new Map<string, string>()
				for (const layerMap of layer.maps) {
					const keyStr = `${layerMap.key}+${layerMap.mods.join(',')}`
					if (layerRegistry.has(keyStr)) {
						const layerSource = `${rub.dsc || 'RuleBased'}.layer(${layer.key}).map(${layerMap.key})`
						const keyDesc = layerMap.mods.length > 0 ? `${layerMap.key}+${layerMap.mods.join('+')}` : layerMap.key
						throw new Error(`Duplicate key combination: ${keyDesc} in ${layerSource}`)
					}
					layerRegistry.set(keyStr, `${rub.dsc || 'RuleBased'}.layer(${layer.key}).map(${layerMap.key})`)
				}
			}
		}

		// Detect key mappings within Rules
		for (const rule of bu.rules) {
			for (const map of rule.maps) {
				const ruleSource = `${rule.dsc || 'Rule'}.map(${map.key})`
				const ruleDeviceConds = rule.dvc ? [deviceToCondition(rule.dvc)] : []
				addKeyMapping(map.key, map.mods, ruleSource, ruleDeviceConds)
			}
		}

		for (const rub of bu.ruleBsds) {
			const mks = new Set(rub.maps.map(m => m.key))
			const layKeys = new Set(rub.layers.map(l => l.key))

			for (const key of mks) {
				if (layKeys.has(key)) throw new Error(`Key conflict in rule "${rub.dscFul}": key "${key}" cannot be both mapped and used as layer trigger`)
			}

			for (const layer of rub.layers) {
				for (const layerMap of layer.maps) {
					if (layerMap.key === layer.key) throw new Error(`Invalid mapping in layer "${layer.dscFul}": cannot map key "${layer.key}" within the same layer that is triggered by this key`)
				}
			}
		}

		const rus: IKaraRule[] = []

		for (const rub of bu.ruleBsds) {
			let desc = rub.dscFul
			if (rub.comboMode && rub.comboTarget) {
				const modsEmoji = icon(rub.comboTarget.key) + rub.comboTarget.mods.map(m => icon(m)).join('')
				desc = `${rub.dsc} [ ${icon(rub.baseKey)} ] → [ ${modsEmoji} ]`
			}

			const dvc = formatDeviceInfo(rub.dvc)
			const base = ` - based[ ${icon(rub.baseKey)} ]`
			const keyMaps = rub.maps.map(m => ({key: m.key, desc: m.dsc, keys:m.keys || []}))

			if (dvc || keyMaps.length > 0 || rub.layers.length > 0) {
				const mapDetails = keyMaps.map(m => {
					let srcK = icon(m.key)
					let dstK = m.keys.length > 0 ? icon(m.keys[0].key) : `??`
					return `  + [ ${srcK} ] = ${dstK} ${m.desc ? `(${m.desc})` : ''}`
				}).join('\n')

				const topLevLays = rub.layers.filter(l => !l.parent)
				const layDetails = formatLayerDetails(topLevLays, rub.layers)

				desc = `${dvc}${desc}${base}`
				if (mapDetails) desc += `\n${mapDetails}`
				if (layDetails) desc += layDetails
			}

			const rubDeviceConds = rub.dvc ? [deviceToCondition(rub.dvc)] : []

			const rule: IKaraRule = {
				description: desc,
				manipulators: procTrigMrs(rub, rubDeviceConds)
			}

			const basedKeyMaps = rub.maps.map(m => ({
				key: m.key,
				mods: m.mods,
				keys: m.keys,
				desc: m.dscFul
			}))
			rule.manipulators.push(...procKeyMaps(basedKeyMaps, rub.baseVar, [], rubDeviceConds))

			for (const lay of rub.layers) rule.manipulators.push(...procLayerMr(lay, rubDeviceConds))

			rus.push(rule)
		}

		for (const ru of bu.rules) {
			const mrs: IManipulator[] = []
			const regularMaps: typeof ru.maps = []
			const heldDownMaps: typeof ru.maps = []

			for (const map of ru.maps) {
				if (map.holdInfo) heldDownMaps.push(map)
				else regularMaps.push(map)
			}

			const ruKeyMaps = regularMaps.map(m => ({
				key: m.key,
				mods: m.mods,
				keys: m.keys,
				desc: m.dscFul
			}))
			const ruDeviceConds = ru.dvc ? [deviceToCondition(ru.dvc)] : []
			mrs.push(...procKeyMaps(ruKeyMaps, undefined, [], ruDeviceConds))

			for (const heldMap of heldDownMaps) {
				let m = procHeldDownMr(heldMap, ruDeviceConds)
				if( m ) mrs.push(m)
			}

			let desc = ru.dscFul
			const dvc = formatDeviceInfo(ru.dvc)

			if (ru.maps.length === 1) {
				desc = ru.maps[0].dscFul
				if (dvc) desc = `${dvc}${desc}`
			} else if (ru.maps.length > 1) {
				const mods = ru.maps.length > 0 ? ru.maps[0].mods.filter(mod => ru.maps.every(m => m.mods.includes(mod))) : []
				const modStr = mods.length > 0 ? mods.map(icon).join('') : ru.maps.length
				const keyMaps = ru.maps.map(m => ({key: m.key, desc: m.dsc || ''}))
				const keySummary = formatKeyMappingSummary(keyMaps)

				desc = `${dvc}${desc} [ ${modStr} ] (${ru.maps.length})${keySummary}\n`
				for (const m of ru.maps) {
					const shortDesc = m.dscFul.replace(ru.dsc + ' + ', '').replace('-> ', '')
					desc += `  + [ ${icon(m.key)} ] : ${shortDesc}\n`
				}
				desc = desc.trimEnd()
			} else if (dvc) {
				desc = `${dvc}${desc}`
			}

			rus.push({ description: desc, manipulators: mrs })
		}

		for (const ru of rus) {
			for (const mr of ru.manipulators) {
				if (mr.conditions) {
					for (const cond of mr.conditions) {
						if (cond.type === 'variable_if' && 'name' in cond && cond.name.startsWith('var_') && cond.value === 1) {
							const baseVar = cond.name
							for (const oru of rus) {
								for (const omr of oru.manipulators) {
									if (omr.to && omr.to[0]?.set_variable?.name?.startsWith(`lay_${baseVar}_`)) {
										const vnm = omr.to[0].set_variable.name
										const excCond = mr.conditions.find(c => c.type === 'variable_if' && 'name' in c && c.name === vnm)
										if (!excCond) mr.conditions.push({ type: 'variable_if', name: vnm, value: 0 })
									}
								}
							}
						}
					}
				}
			}
		}


		const simpleMods = procSimpleMods(bu.simples)

		return {
			global: bu.global,
			profiles: [{
				name: bu.profName,
				...(bu.devices.length > 0 && { devices: bu.devices }),
				...(simpleMods.length > 0 && { simple_modifications: simpleMods }),
				complex_modifications: { rules: rus },
				virtual_hid_keyboard: { keyboard_type_v2: 'ansi' }
			}]
		}
	}

	export function fmtVal(val: any, indent: number, zipNms: string[], key?: string, parentZip: boolean = false): string {
		if (val === undefined) return 'null'

		const spaces = '  '.repeat(indent)
		const needZip = key && zipNms.includes(key)
		const force = parentZip || needZip

		if (Array.isArray(val)) {
			if (force) {
				if (key === 'conditions' && !parentZip) {
					const items = val.map(v => `${spaces}  ${fmtVal(v, 0, zipNms, undefined, true)}`)
					return `[\n${items.join(',\n')}\n${spaces}]`
				} else {
					return `[${val.map(v => fmtVal(v, 0, zipNms, undefined, true)).join(', ')}]`
				}
			}
			if (val.length === 0) return '[]'
			const items = val.map(v => `${spaces}  ${fmtVal(v, indent + 1, zipNms)}`)
			return `[\n${items.join(',\n')}\n${spaces}]`
		}

		if (val && typeof val === 'object') {
			const keys = Object.keys(val).filter(k => val[k] !== undefined)
			if (force || keys.length === 0) {
				const pairs = keys.map(k => `"${k}": ${fmtVal(val[k], 0, zipNms, k, true)}`)
				return `{${pairs.join(', ')}}`
			}
			const pairs = keys.map(k => `${spaces}  "${k}": ${fmtVal(val[k], indent + 1, zipNms, k)}`)
			return `{\n${pairs.join(',\n')}\n${spaces}}`
		}

		return JSON.stringify(val)
	}
}

export class Config {
	profName: string
	rules: Rule[] = []
	ruleBsds: RuleBased[] = []
	simples: SimpleKeyMap[] = []
	devices: IDevice[] = []
	keyMap = new Map<string, Set<string>>()

	public global: IKaraCfgGlobal = { show_in_menu_bar: false }

	constructor(profName = 'Default') {
		this.profName = profName
	}

	rule(desc: string): Rule {
		const ru = new Rule(this, desc)
		this.rules.push(ru)
		return ru
	}

	map(key: Key, mods: IMods = []): SimpleKeyMap {
		const sm = new SimpleKeyMap(this, key, mods)
		this.simples.push(sm)
		return sm
	}

	ruleBaseBy(key: Key, mods: IMods = []): RuleBased {
		const rule = new RuleBased(this, key, mods)
		this.ruleBsds.push(rule)
		return rule
	}

	device(idf: IDeviceIds, ignore = false): Device {
		const ids = {
			...idf,
			...(idf.is_keyboard === undefined && { is_keyboard: true }),
			...(idf.is_pointing_device === undefined && { is_pointing_device: true })
		}
		this.devices.push({ identifiers: ids, ignore })
		return new Device(this, idf)
	}

	chkDupKey(key: Key, mods: IMods = [], conds: string[] = [], ctxDesc?: string): void {
		const sk = `${key}+${mods.join(',')}`
		const sc = conds.join(',')

		if (!this.keyMap.has(sc)) this.keyMap.set(sc, new Set())
		if (this.keyMap.get(sc)!.has(sk)) {
			const keyDesc = mods.length > 0 ? `${key}+${mods.join('+')}` : key
			const ctx = ctxDesc ? ` in ${ctxDesc}` : ''
			throw new Error(`Duplicate key combination: ${keyDesc}${ctx}`)
		}

		this.keyMap.get(sc)!.add(sk)
	}

	toJSON(): IKaraCfg {
		return cfg.toConfig(this)
	}

	toString(): String {
		const config = this.toJSON()
		const zipNms = ['conditions', 'set_variable', 'modifiers', 'to_if_alone', 'to_if_held_down', 'from', 'to', 'to_after_key_up']
		return cfg.fmtVal(config, 0, zipNms)
	}
}


abstract class IDesc {
	dsc?: string

	constructor(desc?: string) {
		this.dsc = desc
	}

	desc(desc: string) {
		this.dsc = desc
		return this
	}

	abstract get dscFul(): string;

}

abstract class DeviceAble extends IDesc {
	dvc?: Device

	deviceIf(device: Device): this {
		device.type = DvcType.If
		this.dvc = device
		return this
	}

	deviceUnless(device: Device): this {
		device.type = DvcType.Unless
		this.dvc = device
		return this
	}

	deviceExistsIf(device: Device): this {
		device.type = DvcType.ExistsIf
		this.dvc = device
		return this
	}

	deviceExistsUnless(device: Device): this {
		device.type = DvcType.ExistsUnless
		this.dvc = device
		return this
	}
}

abstract class IRule extends DeviceAble {
	bu: Config

	constructor(bu: Config, desc?: string) {

		super(desc)
		this.bu = bu
	}
}


export class Rule extends IRule {
	maps: RuleKeyMap[] = []

	constructor(bu: Config, desc?: string) {
		super(bu, desc)
	}

	get dscFul() {
		return this.dsc || `Rule: Non-Desc, Maps[ ${this.maps.length} ]`
	}

	map(key: Key, mods: IMods = []): RuleKeyMap {
		const mp = new RuleKeyMap(this, key, mods)
		this.maps.push(mp)
		return mp
	}

	holdArgs?:IHoldArgs
	setOnHold( ps:IHoldArgsPart ){
		this.holdArgs = Object.assign({}, this.holdArgs, ps)
	}
}

export class RuleBased extends IRule {
	maps: BasedKeyMap[] = []

	baseKey: Key
	baseMods: IMods
	comboMode: boolean = false
	comboTarget?: { key: Key | Mod, mods: IMods }
	layers: Layer[] = []

	//"to_if_alone": [{ "key_code": "caps_lock", "hold_down_milliseconds": 100 }]
	onAlone!: IOnAlone

	constructor(bu: Config, k: Key, trigMods: IMods) {
		super(bu)
		this.baseKey = k
		this.baseMods = trigMods
	}

	get baseVar(): string {
		if (this.baseMods.length === 0) return `var_${this.baseKey}`
		return `var_${this.baseKey}_${this.baseMods.join('_')}`
	}

	get dscFul() {
		return this.dsc ? `${this.dsc}` : `RuleBased: ${this.baseKey}`
	}

	ifAlone(key:Key, holdMs=200, apple=false) {
		this.onAlone = { key, holdMs, apple }
		return this
	}

	map(key: Key, mods: IMods = []): BasedKeyMap {
		const m = new BasedKeyMap(this, key, mods, this.bu)
		this.maps.push(m)
		return m
	}

	layer(key: Key): Layer {
		const l = new Layer(this, key)
		this.layers.push(l)
		return l
	}

	mapTo(key: Key | Mod, mods: IMods): RuleBased {
		this.comboMode = true
		this.comboTarget = { key, mods }
		return this
	}
}

export class Layer extends IDesc {
	key: Key
	mods: IMods = []
	rule: RuleBased
	parent?: Layer
	maps: LayerKeyMap[] = []

	constructor(rule: RuleBased, key: Key, parent?: Layer) {
		super()

		this.key = key
		this.rule = rule
		this.parent = parent
	}

	get dscFul(): string {
		const parentDesc = this.parent ? this.parent.dscFul : this.rule.dscFul
		return `${parentDesc} + [ ${this.key} ] ： ${this.dsc}`
	}


	get vName(): string {
		if (!this.parent) return `lay_${this.rule.baseVar}_${this.key}`
		return `${this.parent.vName}_${this.key}`
	}

	get baseVar(): string {
		return this.rule.baseVar
	}


	layer(key: Key): Layer {
		const subLayer = new Layer(this.rule, key, this)
		this.rule.layers.push(subLayer)
		return subLayer
	}

	map(key: Key, mods: IMods = []): LayerKeyMap {
		const m = new LayerKeyMap(this, key, mods)
		this.maps.push(m)
		return m
	}
}


abstract class IMap extends IDesc {
	protected bu!: Config
	key: Key
	mods: IMods
	keys: IKeyDefines = []

	constructor(k: Key, mods: IMods = [], builder?: Config) {

		super()

		this.key = k
		this.mods = mods
		if (builder) this.bu = builder
	}

	get dscFul() {
		return this.dsc || `IMap: ${this.key}`
	}

	to(dst: IKey, mods?: IMods) {
		this.keys.push({ key: dst, mods: mods })
		return this
	}

	toOpen(app: string, unmin = false) {
		return this.to(util.mkCmd_Open(app, unmin))
	}

	toActivate(app: string, withOpen = false) {
		return this.to(util.mkCmd_Activate(app, withOpen))
	}

	toUrl(url: string, opt?: boolean | string) {
		return this.to(util.mkCmd_OpenUrl(url, opt))
	}
}

export class SimpleKeyMap{
	cfg: Config
	key: Key
	mods: IMods
	dst?: IKeyDefine

	constructor(cfg: Config, key: Key, mods: IMods = []) {
		this.cfg = cfg
		this.key = key
		this.mods = mods
	}

	to(dst: IKey, mods?: IMods): SimpleKeyMap {
		this.dst = { key: dst, mods }
		return this
	}

	toOpen(app: string, unmin = false): SimpleKeyMap {
		return this.to(util.mkCmd_Open(app, unmin))
	}

	toActivate(app: string, withOpen = false): SimpleKeyMap {
		return this.to(util.mkCmd_Activate(app, withOpen))
	}

	toUrl(url: string, opt?: boolean | string): SimpleKeyMap {
		return this.to(util.mkCmd_OpenUrl(url, opt))
	}
}

export class BasedKeyMap extends IMap {
	rule: RuleBased


	constructor(rule: RuleBased, k: Key, mods: IMods = [], bu: Config) {
		super(k, mods, bu)
		this.rule = rule
	}

	get dscFull(): string {
		return `${this.rule.dsc} + [ ${this.key} ] ： ${this.dsc}`
	}

}

export class LayerKeyMap extends IMap {
	layer: Layer

	constructor(layer: Layer, k: Key, mods: IMods) {
		super(k, mods)
		this.layer = layer
	}

}

type IHoldArgs = 	{
	delayedActionMs?:number
	thresholdMs:number
	aloneTimeoutMs:number

	[key:string]:any
}
type IHoldArgsPart = Partial<IHoldArgs>

class HoldInfo{
	public map:IMap
	key?: Key
	mods?: IMods
	shell?: string
	args: IHoldArgsPart = {}

	constructor( map:IMap){
		this.map = map
	}

	setArgs( args:IHoldArgsPart ){
		this.args = Object.assign( {}, this.args, args )
		return this
	}

	setParam( key:string, value:any ): HoldInfo {
		this.args[key] = value
		return this
	}

	desc( desc:string ): HoldInfo {
		this.map.desc( desc )
		return this
	}
}

export class RuleKeyMap extends IMap {
	rule: Rule
	holdInfo?:HoldInfo

	constructor(rule: Rule, k: Key, mods: IMods = []) {
		super(k, mods)
		this.rule = rule
	}


	onHold( k:Key, mods?:IMods ): HoldInfo {
		this.holdInfo = new HoldInfo(this)
		this.holdInfo.key = k
		this.holdInfo.mods = mods
		return this.holdInfo
	}

	onHoldCmd( shell: string ): HoldInfo {
		this.holdInfo = new HoldInfo(this)
		this.holdInfo.shell = shell
		return this.holdInfo
	}

	get dscFul(): string {
		const modStr = this.mods.length > 0 ? this.mods.map(icon).join('') : ''
		const keyIcon = icon(this.key)

		let desc = this.dsc
		if (!desc && this.keys.length > 0) {
			desc = this.keys.map(k => {
				if (typeof k.key == 'string' && !Object.values(Key).includes(k.key as Key)) return 'shell cmd'
				return k.key.toString()
			}).join(', ')
		}
		if (!desc && this.holdInfo) {
			if (this.holdInfo.key) {
				desc = `hold -> ${this.holdInfo.key}`
			} else if (this.holdInfo.shell) {
				desc = 'hold -> shell cmd'
			}
		}
		if (!desc) {
			desc = 'key mapping'
		}

		return `${this.rule.dsc} + [ ${modStr}${keyIcon} ] : ${desc}`
	}

}

export class Device extends IDesc {
	type: DvcType = DvcType.If
	cfg: Config
	ids: IDeviceIds

	constructor(cfg: Config, ids: IDeviceIds) {
		super()
		this.cfg = cfg
		this.ids = ids
	}

	get dscFul(): string {
		const parts: string[] = []
		if (this.ids.vendor_id) parts.push(`VID:${this.ids.vendor_id}`)
		if (this.ids.product_id) parts.push(`PID:${this.ids.product_id}`)
		if (this.ids.is_built_in_keyboard) parts.push('Built-in')
		const idStr = parts.length > 0 ? parts.join(',') : 'Device'
		return this.dsc ? `${this.dsc} (${idStr})` : `Device (${idStr})`
	}

	rule(desc: string): Rule {
		const rule = new Rule(this.cfg, desc)
		this.type = DvcType.If
		rule.dvc = this
		this.cfg.rules.push(rule)
		return rule
	}

	map(key: Key, mods: IMods = []): SimpleKeyMap {
		const sm = new SimpleKeyMap(this.cfg, key, mods)
		this.cfg.simples.push(sm)
		return sm
	}

	ruleBaseBy(key: Key, mods: IMods = []): RuleBased {
		const rule = new RuleBased(this.cfg, key, mods)
		this.type = DvcType.If
		rule.dvc = this
		this.cfg.ruleBsds.push(rule)
		return rule
	}

}

