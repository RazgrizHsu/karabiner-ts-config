import { IKaraCfg, IKaraCfgGlobal, IKaraRule, IManipulator, IToEvent } from './types'
import { Key, Mouse, Mod } from './enums'
import { icon } from './icon'

export type IKey = Key | Mouse | string | Array<Key | Mouse | string>
export type IKeys = Array<{ key: IKey, mods?: Mod[] }>

namespace util {
	export function mkCmd_OsaOpen(app: string, url: string): string {
		return `osascript -e 'tell application "${app}" to open location "${url}"'`
	}
}

namespace cfg {

	const mkMr = (desc: string, keyC: Key, mods: Mod[], toEvent: IToEvent, conds?: any[]) => ({
		description: desc,
		type: 'basic' as const,
		from: { key_code: keyC, modifiers: mods.length > 0 ? { mandatory: mods.map(m => m.toString()) } : undefined },
		to: [toEvent],
		...(conds && { conditions: conds })
	})

	const fmtDest = (dst: IKey, dstMods?: Mod[]): IToEvent => {
		if (dst === Mouse.left || dst === Mouse.right || dst === Mouse.middle) return { pointing_button: dst as Mouse }
		if (typeof dst === 'string' && !Object.values(Key).includes(dst as Key)) return { shell_command: dst }

		const evt: IToEvent = { key_code: dst as Key }
		if (dstMods?.length) evt.modifiers = dstMods.map(m => m.toString())
		return evt
	}

	const mkConds = (baseVnm?: string, layVnms: string[] = [], excLays: string[] = []) => {
		const conds: any[] = []
		if (baseVnm) conds.push({ type: 'variable_if', name: baseVnm, value: 1 })
		layVnms.forEach(layVnm => conds.push({ type: 'variable_if', name: layVnm, value: 1 }))
		excLays.forEach(layer => conds.push({ type: 'variable_if', name: layer, value: 0 }))
		return conds
	}

	const getLayerConditions = (layer: Layer): string[] => {
		const layVnms: string[] = []
		let current: Layer | undefined = layer
		while (current) {
			layVnms.unshift(current.vName)
			current = current.parent
		}
		return layVnms
	}

	const procKeyMaps = (maps: Array<{ key: Key, mods: Mod[], keys: IKeys, desc: string, layer?: Layer }>, baseVnm?: string, excLays: string[] = []) => {
		const mrs: IManipulator[] = []
		for (const map of maps) {
			for (const mapk of map.keys) {
				const dsts = Array.isArray(mapk.key) ? mapk.key : [mapk.key]
				for (const dst of dsts) {
					const toEvent = fmtDest(dst, mapk.mods)
					const layVnms = map.layer ? getLayerConditions(map.layer) : []
					const conds = mkConds(baseVnm, layVnms, excLays)
					mrs.push(mkMr(map.desc, map.key, map.mods, toEvent, conds.length > 0 ? conds : undefined))
				}
			}
		}
		return mrs
	}

	const procTrigMrs = (ru: RuleBased): IManipulator[] => {
		const mrs: IManipulator[] = []
		const exclLays = ru.layers.map(sl => sl.vName)

		if (ru.comboMode && ru.comboTarget) {
			mrs.push({
				description: `${ru.baseKey} -> Set ${ru.baseVar} variable`,
				type: 'basic',
				from: {
					key_code: ru.baseKey,
					modifiers: ru.baseMods.length > 0 ? { mandatory: ru.baseMods.map(m => m.toString()) } : { optional: [Mod.any] }
				},
				to: [{ set_variable: { name: ru.baseVar, value: 1 } }],
				to_after_key_up: [{ set_variable: { name: ru.baseVar, value: 0 } }],
				to_if_alone: [{ key_code: Key.escape }],
				...(exclLays.length > 0 && { conditions: mkConds(undefined, undefined, exclLays) })
			})

			mrs.push({
				description: `${ru.baseKey} -> ${ru.comboTarget.key} + mods`,
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
				to_after_key_up: [{ set_variable: { name: ru.baseVar, value: 0 } }],
				to_if_alone: [{ key_code: Key.escape }],
				...(exclLays.length > 0 && { conditions: mkConds(undefined, undefined, exclLays) })
			})
		} else {
			mrs.push({
				description: `${ru.baseKey} -> Set ${ru.baseVar} variable`,
				type: 'basic',
				from: {
					key_code: ru.baseKey,
					modifiers: ru.baseMods.length > 0 ? { mandatory: ru.baseMods.map(m => m.toString()) } : { optional: [Mod.any] }
				},
				to: [{ set_variable: { name: ru.baseVar, value: 1 } }],
				to_after_key_up: [{ set_variable: { name: ru.baseVar, value: 0 } }],
				to_if_alone: [{ key_code: Key.escape }],
				...(exclLays.length > 0 && { conditions: mkConds(undefined, undefined, exclLays) })
			})
		}

		return mrs
	}

	const procLayerMr = (lay: Layer): IManipulator[] => {
		const mrs: IManipulator[] = []

		const parentConditions = lay.parent ? getLayerConditions(lay.parent) : []
		const parentConds = mkConds(lay.baseVar, parentConditions)

		mrs.push({
			description: `Toggle layer ${lay.key}`,
			type: 'basic',
			from: {
				key_code: lay.key,
				modifiers: { optional: [Mod.any] }
			},
			to: [{ set_variable: { name: lay.vName, value: 1 } }],
			to_after_key_up: [{ set_variable: { name: lay.vName, value: 0 } }],
			conditions: parentConds
		})

		const layerKeyMaps = lay.maps.filter(m => !m.separated).map(m => ({
			key: m.key,
			mods: m.mods,
			keys: m.keys,
			desc: m.dscFul,
			layer: lay
		}))
		const allLayers = lay.rule.bu.ruleBsds.flatMap(rb => rb.layers).map(l => l.vName)
		const currentLayerConds = getLayerConditions(lay)
		const excludeLayers = allLayers.filter(ln => !currentLayerConds.includes(ln))
		mrs.push(...procKeyMaps(layerKeyMaps, lay.baseVar, excludeLayers))

		return mrs
	}

	const proSepMaps = (maps: BasedKeyMap[], vnm: string): IKaraRule[] => {
		const rules: IKaraRule[] = []
		for (const map of maps.filter(m => m.separated)) {
			for (const mapping of map.keys) {
				const dsts = Array.isArray(mapping.key) ? mapping.key : [mapping.key]
				for (const dst of dsts) {
					const conditions = [{ type: 'variable_if', name: vnm, value: 1 }]
					const toEvent = fmtDest(dst, mapping.mods)
					const manipulator = mkMr(map.dscFull, map.key, map.mods, toEvent, conditions)
					rules.push({ description: map.dscFull, manipulators: [manipulator] })
				}
			}
		}
		return rules
	}

	const procSepLayers = (lays: Layer[]): IKaraRule[] => {
		const rules: IKaraRule[] = []
		for (const layer of lays.filter(l => l.separated)) {
			const mrs: IManipulator[] = []

			const parentConditions = layer.parent ? getLayerConditions(layer.parent) : []
			const parentConds = mkConds(layer.baseVar, parentConditions)

			mrs.push({
				description: `Toggle layer ${layer.key}`,
				type: 'basic',
				from: {
					key_code: layer.key,
					modifiers: { optional: [Mod.any] }
				},
				to: [{ set_variable: { name: layer.vName, value: 1 } }],
				to_after_key_up: [{ set_variable: { name: layer.vName, value: 0 } }],
				conditions: parentConds
			})

			const nonSepMaps = layer.maps.filter(m => !m.separated)
			for (const map of nonSepMaps) {
				const layKeyMaps = [{ key: map.key, mods: map.mods, keys: map.keys, desc: map.dscFul, layer: layer }]
				const allLayers = layer.rule.bu.ruleBsds.flatMap(rb => rb.layers).map(l => l.vName)
				const currentLayerConds = getLayerConditions(layer)
				const excludeLayers = allLayers.filter(ln => !currentLayerConds.includes(ln))
				mrs.push(...procKeyMaps(layKeyMaps, layer.baseVar, excludeLayers))
			}

			let desc = layer.dscFul
			if (nonSepMaps.length > 0) {
				desc += ` ( ${nonSepMaps.length} )\n`
				for (const km of nonSepMaps) {
					const shortDesc = km.dscFul.replace(layer.dscFul + ' - ', '')
					desc += ` + [ ${icon(km.key)} ] : ${shortDesc}\n`
				}
				desc = desc.trimEnd()
			}

			rules.push({ description: desc, manipulators: mrs })

			for (const map of layer.maps.filter(m => m.separated)) {
				for (const mapping of map.keys) {
					const dsts = Array.isArray(mapping.key) ? mapping.key : [mapping.key]
					for (const dst of dsts) {
						const layerConds = getLayerConditions(layer)
						const allLayers = layer.rule.bu.ruleBsds.flatMap(rb => rb.layers).map(l => l.vName)
						const excludeLayers = allLayers.filter(ln => !layerConds.includes(ln))
						const conds = mkConds(undefined, layerConds, excludeLayers)
						const toEvent = fmtDest(dst, mapping.mods)
						const mr = mkMr(map.dscFul, map.key, map.mods, toEvent, conds)
						rules.push({ description: map.dscFul, manipulators: [mr] })
					}
				}
			}
		}
		return rules
	}

	export function toConfig(bu: Config) {

		const rus: IKaraRule[] = []

		for (const rub of bu.ruleBsds) {
			let desc = rub.dscFul
			if (rub.comboMode && rub.comboTarget) {
				const modsEmoji = icon(rub.comboTarget.key) + rub.comboTarget.mods.map(m => icon(m)).join('')
				desc = `${rub.dsc} [ ${icon(rub.baseKey)} ] → [ ${modsEmoji} ]`
			}

			const rule: IKaraRule = {
				description: desc,
				manipulators: procTrigMrs(rub)
			}

			const basedKeyMaps = rub.maps.filter(m => !m.separated).map(m => ({
				key: m.key,
				mods: m.mods,
				keys: m.keys,
				desc: m.dscFul
			}))
			rule.manipulators.push(...procKeyMaps(basedKeyMaps, rub.baseVar))

			for (const lay of rub.layers.filter(l => !l.separated)) rule.manipulators.push(...procLayerMr(lay))

			rus.push(rule)
			rus.push(...proSepMaps(rub.maps, rub.baseVar))
			rus.push(...procSepLayers(rub.layers))
		}

		for (const ru of bu.rules) {
			const mrs: IManipulator[] = []
			const ruKeyMaps = ru.maps.map(m => ({
				key: m.key,
				mods: m.mods,
				keys: m.keys,
				desc: m.dscFul
			}))
			mrs.push(...procKeyMaps(ruKeyMaps))

			let desc = ru.dscFul
			if (ru.maps.length > 1) {
				const mods = ru.maps.length > 0 ? ru.maps[0].mods.filter(mod => ru.maps.every(m => m.mods.includes(mod))) : []

				const modStr = mods.length > 0 ? mods.map(icon).join('') : ru.maps.length
				desc += ` [ ${modStr} ] (${ru.maps.length})\n`
				for (const m of ru.maps) {
					const shortDesc = m.dscFul.replace(ru.dsc + ' - ', '').replace('-> ', '')
					desc += `  + [ ${icon(m.key)} ] : ${shortDesc}\n`
				}
				desc = desc.trimEnd()
			}

			rus.push({ description: desc, manipulators: mrs })
		}

		for (const ru of rus) {
			for (const mr of ru.manipulators) {
				if (mr.conditions) {
					for (const cond of mr.conditions) {
						if (cond.type === 'variable_if' && cond.name.startsWith('var_') && cond.value === 1) {
							const baseVar = cond.name
							for (const oru of rus) {
								for (const omr of oru.manipulators) {
									if (omr.to && omr.to[0]?.set_variable?.name?.startsWith(`lay_${baseVar}_`)) {
										const vnm = omr.to[0].set_variable.name
										const excCond = mr.conditions.find(c => c.name === vnm)
										if (!excCond) mr.conditions.push({ type: 'variable_if', name: vnm, value: 0 })
									}
								}
							}
						}
					}
				}
			}
		}

		return {
			global: bu.global,
			profiles: [{
				name: bu.profName,
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
	keyMap = new Map<string, Set<string>>()

	public global: IKaraCfgGlobal = { show_in_menu_bar: false }

	constructor(profName = 'Default') {
		this.profName = profName
	}

	rule(desc: string): Rule {
		const ruleBuilder = new Rule(this, desc)
		this.rules.push(ruleBuilder)
		return ruleBuilder
	}

	ruleBaseBy(key: Key, mods: Mod[] = []): RuleBased {
		const baseKeyId = `${key}+${mods.join(',')}`

		for (const [_, ks] of this.keyMap) {
			if (ks.has(baseKeyId)) throw new Error(`Duplicate key combination: ${key}${mods.length > 0 ? '+' + mods.join('+') : ''}`)
		}
		const rule = new RuleBased(this, key, mods)
		this.ruleBsds.push(rule)
		return rule
	}

	chkDupKey(key: Key, mods: Mod[] = [], conds: string[] = [], ctxDesc?: string): void {
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
		const zipNms = ['conditions', 'set_variable', 'modifiers', 'to_if_alone', 'from', 'to']
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

abstract class IRule extends IDesc {
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

	map(key: Key, mods: Mod[] = []): RuleKeyMap {
		const mp = new RuleKeyMap(this, key, mods)
		this.maps.push(mp)
		return mp
	}

}

export class RuleBased extends IRule {
	maps: BasedKeyMap[] = []

	baseKey: Key
	baseMods: Mod[]
	comboMode: boolean = false
	comboTarget?: { key: Key | Mod, mods: Mod[] }
	layers: Layer[] = []

	constructor(bu: Config, k: Key, trigMods: Mod[]) {
		super(bu)
		this.baseKey = k
		this.baseMods = trigMods
		this.bu.chkDupKey(k, trigMods, [], 'ruleBaseBy')
	}

	get baseVar(): string {
		if (this.baseMods.length === 0) return `var_${this.baseKey}`
		return `var_${this.baseKey}_${this.baseMods.join('_')}`
	}

	get dscFul() {
		return this.dsc ? `${this.dsc}` : `RuleBased: ${this.baseKey}`
	}

	map(key: Key, mods: Mod[] = []): BasedKeyMap {
		const m = new BasedKeyMap(this, key, mods, this.bu)
		this.maps.push(m)
		return m
	}

	layer(key: Key): Layer {
		const l = new Layer(this, key)
		this.layers.push(l)
		return l
	}

	mapTo(key: Key | Mod, mods: Mod[]): RuleBased {
		this.comboMode = true
		this.comboTarget = { key, mods }
		return this
	}
}

export class Layer extends IDesc {
	key: Key
	mods: Mod[] = []
	rule: RuleBased
	parent?: Layer
	separated: boolean = false
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

	separate(): Layer {
		this.separated = true
		return this
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

	map(key: Key, mods: Mod[] = []): LayerKeyMap {
		const m = new LayerKeyMap(this, key, mods)
		this.maps.push(m)
		return m
	}
}


abstract class IMap extends IDesc {
	protected bu!: Config
	key: Key
	mods: Mod[]
	keys: IKeys = []

	constructor(k: Key, mods: Mod[] = [], builder?: Config) {

		super()

		this.key = k
		this.mods = mods
		if (builder) this.bu = builder
	}

	get dscFul() {
		return this.dsc || `IMap: ${this.key}`
	}

	to(dst: IKey, mods?: Mod[]) {
		this.keys.push({ key: dst, mods: mods })
		return this
	}

	toOsaOpen(app: string, url: string) {
		return this.to(util.mkCmd_OsaOpen(app, url))
	}
}

export class RuleKeyMap extends IMap {
	rule: Rule

	constructor(rule: Rule, k: Key, mods: Mod[] = []) {
		super(k, mods)
		this.rule = rule
	}

}

export class BasedKeyMap extends IMap {
	rule: RuleBased
	separated: boolean = false

	constructor(rule: RuleBased, k: Key, mods: Mod[] = [], bu: Config) {
		super(k, mods, bu)
		this.rule = rule
		const ctxDesc = `${rule.dsc || 'RuleBased'}.map(${k})`
		bu.chkDupKey(k, mods, [rule.baseVar], ctxDesc)
	}

	get dscFull(): string {
		return `${this.rule.dsc} + [ ${this.key} ] ： ${this.dsc}`
	}

	separate(): BasedKeyMap {
		this.separated = true
		return this
	}
}

export class LayerKeyMap extends IMap {
	layer: Layer
	separated: boolean = false

	constructor(layer: Layer, k: Key, mods: Mod[]) {
		super(k, mods)
		this.layer = layer
	}

	separate(): LayerKeyMap {
		this.separated = true
		return this
	}
}
