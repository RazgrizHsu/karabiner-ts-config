import { IAlone, IKaraCfg, IKaraCfgGlobal, IKaraRule, IManipulator } from './types'
import { IToEvent } from './types'
import { IDevice, IDeviceIdentifiers } from './types'
import { ISimple } from './types'

import { Key, Mouse, Mod } from './enums'
import { icon } from './icon'
import { argv0 } from 'process'

export type IKey = Key | Mouse | string | Array<Key | Mouse | string>
export type IKeyDefine = { key: IKey, mods?: IMod[] }
export type IKeyDefines = Array<IKeyDefine>
export type IMod = Key | Mod

type IOnAlone = { key?:Key, holdMs?:number }

namespace util {
	export function mkCmd_OsaOpen(app: string, url: string): string {
		return `osascript -e 'tell application "${app}" to open location "${url}"'`
	}
}

namespace cfg {

	const mkMr = (desc: string, keyC: Key, mods: IMod[], toEvent: IToEvent, conds?: any[]) => ({
		description: desc,
		type: 'basic' as const,
		from: { key_code: keyC, modifiers: mods.length > 0 ? { mandatory: mods.map(m => m.toString()) } : undefined },
		to: [toEvent],
		...(conds && { conditions: conds })
	})

	const fmtDest = (dst: IKey, dstMods?: IMod[]): IToEvent => {
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

	const getLayConds = (layer: Layer): string[] => {
		const layVnms: string[] = []
		let current: Layer | undefined = layer
		while (current) {
			layVnms.unshift(current.vName)
			current = current.parent
		}
		return layVnms
	}

	const procKeyMaps = (maps: Array<{ key: Key, mods: IMod[], keys: IKeyDefines, desc: string, layer?: Layer }>, baseVnm?: string, excLays: string[] = []) => {
		const mrs: IManipulator[] = []
		for (const map of maps) {
			for (const mapk of map.keys) {
				const dsts = Array.isArray(mapk.key) ? mapk.key : [mapk.key]
				for (const dst of dsts) {
					const toEvent = fmtDest(dst, mapk.mods)
					const layVnms = map.layer ? getLayConds(map.layer) : []
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


		let onAlone:IAlone = { key_code: Key.escape }
		if ( ru.onAlone && ru.onAlone.key ) {
			onAlone = { key_code: ru.onAlone.key }
			if ( ru.onAlone.holdMs ) onAlone.hold_down_milliseconds = ru.onAlone.holdMs
		}

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
				to_if_alone: [onAlone],
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
				to_if_alone: [onAlone],
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
				to_if_alone: [onAlone],
				...(exclLays.length > 0 && { conditions: mkConds(undefined, undefined, exclLays) })
			})
		}

		return mrs
	}

	const procLayerMr = (lay: Layer): IManipulator[] => {
		const mrs: IManipulator[] = []

		const parentConds = lay.parent ? getLayConds(lay.parent) : []
		const conds = mkConds(lay.baseVar, parentConds)

		mrs.push({
			description: `Toggle layer ${lay.key}`,
			type: 'basic',
			from: { key_code: lay.key, modifiers: { optional: [Mod.any] } },
			to: [{ set_variable: { name: lay.vName, value: 1 } }],
			to_after_key_up: [{ set_variable: { name: lay.vName, value: 0 } }],
			conditions: conds
		})

		const layKeyMaps = lay.maps.filter(m => !m.separated).map(m => ({
			key: m.key,
			mods: m.mods,
			keys: m.keys,
			desc: m.dscFul,
			layer: lay
		}))
		const lays = lay.rule.bu.ruleBsds.flatMap(rb => rb.layers).map(l => l.vName)
		const layConsNow = getLayConds(lay)
		const exclLays = lays.filter(ln => !layConsNow.includes(ln))
		mrs.push(...procKeyMaps(layKeyMaps, lay.baseVar, exclLays))

		return mrs
	}

	const proSepMaps = (maps: BasedKeyMap[], vnm: string): IKaraRule[] => {
		const rus: IKaraRule[] = []
		for (const map of maps.filter(m => m.separated)) {
			for (const mk of map.keys) {
				const dsts = Array.isArray(mk.key) ? mk.key : [mk.key]
				for (const dst of dsts) {
					const conds = [{ type: 'variable_if', name: vnm, value: 1 }]
					const toE = fmtDest(dst, mk.mods)
					const mr = mkMr(map.dscFull, map.key, map.mods, toE, conds)
					rus.push({ description: map.dscFull, manipulators: [mr] })
				}
			}
		}
		return rus
	}

	const procSepLayers = (lays: Layer[]): IKaraRule[] => {
		const rus: IKaraRule[] = []
		for (const lay of lays.filter(l => l.separated)) {
			const mrs: IManipulator[] = []

			const parentConds = lay.parent ? getLayConds(lay.parent) : []
			const conds = mkConds(lay.baseVar, parentConds)

			mrs.push({
				description: `Toggle layer ${lay.key}`,
				type: 'basic',
				from: {
					key_code: lay.key,
					modifiers: { optional: [Mod.any] }
				},
				to: [{ set_variable: { name: lay.vName, value: 1 } }],
				to_after_key_up: [{ set_variable: { name: lay.vName, value: 0 } }],
				conditions: conds
			})

			const nonSepMaps = lay.maps.filter(m => !m.separated)
			for (const map of nonSepMaps) {
				const layKeyMaps = [{ key: map.key, mods: map.mods, keys: map.keys, desc: map.dscFul, layer: lay }]
				const allLayers = lay.rule.bu.ruleBsds.flatMap(rb => rb.layers).map(l => l.vName)
				const currentLayerConds = getLayConds(lay)
				const excludeLayers = allLayers.filter(ln => !currentLayerConds.includes(ln))
				mrs.push(...procKeyMaps(layKeyMaps, lay.baseVar, excludeLayers))
			}

			let desc = lay.dscFul
			if (nonSepMaps.length > 0) {
				desc += ` ( ${nonSepMaps.length} )\n`
				for (const km of nonSepMaps) {
					const shortDesc = km.dscFul.replace(lay.dscFul + ' - ', '')
					desc += ` + [ ${icon(km.key)} ] : ${shortDesc}\n`
				}
				desc = desc.trimEnd()
			}

			rus.push({ description: desc, manipulators: mrs })

			for (const map of lay.maps.filter(m => m.separated)) {
				for (const mk of map.keys) {
					const dsts = Array.isArray(mk.key) ? mk.key : [mk.key]
					for (const dst of dsts) {
						const layerConds = getLayConds(lay)
						const allLayers = lay.rule.bu.ruleBsds.flatMap(rb => rb.layers).map(l => l.vName)
						const excludeLayers = allLayers.filter(ln => !layerConds.includes(ln))
						const conds = mkConds(undefined, layerConds, excludeLayers)
						const toEvent = fmtDest(dst, mk.mods)
						const mr = mkMr(map.dscFul, map.key, map.mods, toEvent, conds)
						rus.push({ description: map.dscFul, manipulators: [mr] })
					}
				}
			}
		}
		return rus
	}

	const procSimpleMods = (simpleMaps: SimpleKeyMap[]): ISimple[] => {
		const smods: ISimple[] = []
		for (const sm of simpleMaps) {
			if (!sm.dst) continue

			const from = {
				key_code: sm.key,
				...(sm.mods.length > 0 && { modifiers: { mandatory: sm.mods.map(m => m.toString()) } })
			}

			let to: { key_code: string; modifiers?: string[] }
			if (typeof sm.dst.key === 'string' && !Object.values(Key).includes(sm.dst.key as Key)) {
				continue
			}

			to = {
				key_code: sm.dst.key as Key,
				...(sm.dst.mods?.length && { modifiers: sm.dst.mods.map(m => m.toString()) })
			}

			smods.push({ from, to })
		}
		return smods
	}

	export function toConfig(bu: Config) {

		for (const sm of bu.simples) {
			if (sm.dst) {
				const ctxDesc = `Config.map(${sm.key})`
				bu.chkDupKey(sm.key, sm.mods, [], ctxDesc)
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
		const ruleBuilder = new Rule(this, desc)
		this.rules.push(ruleBuilder)
		return ruleBuilder
	}

	map(key: Key, mods: IMod[] = []): SimpleKeyMap {
		const sm = new SimpleKeyMap(this, key, mods)
		this.simples.push(sm)
		return sm
	}

	ruleBaseBy(key: Key, mods: IMod[] = []): RuleBased {
		const baseKeyId = `${key}+${mods.join(',')}`

		for (const [_, ks] of this.keyMap) {
			if (ks.has(baseKeyId)) throw new Error(`Duplicate key combination: ${key}${mods.length > 0 ? '+' + mods.join('+') : ''}`)
		}
		const rule = new RuleBased(this, key, mods)
		this.ruleBsds.push(rule)
		return rule
	}

	device(idf: IDeviceIdentifiers, ignore = false): Config {
		idf.is_keyboard=true
		idf.is_pointing_device=true
		this.devices.push({ identifiers: idf, ignore })
		return this
	}

	chkDupKey(key: Key, mods: IMod[] = [], conds: string[] = [], ctxDesc?: string): void {
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

	map(key: Key, mods: IMod[] = []): RuleKeyMap {
		const mp = new RuleKeyMap(this, key, mods)
		this.maps.push(mp)
		return mp
	}

}

export class RuleBased extends IRule {
	maps: BasedKeyMap[] = []

	baseKey: Key
	baseMods: IMod[]
	comboMode: boolean = false
	comboTarget?: { key: Key | Mod, mods: IMod[] }
	layers: Layer[] = []

	//"to_if_alone": [{ "key_code": "caps_lock", "hold_down_milliseconds": 100 }]
	onAlone: IOnAlone = {}

	constructor(bu: Config, k: Key, trigMods: IMod[]) {
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

	ifAlone(key:Key, holdMs=100) {
		this.onAlone = { key, holdMs }
		return this
	}

	map(key: Key, mods: IMod[] = []): BasedKeyMap {
		const m = new BasedKeyMap(this, key, mods, this.bu)
		this.maps.push(m)
		return m
	}

	layer(key: Key): Layer {
		const l = new Layer(this, key)
		this.layers.push(l)
		return l
	}

	mapTo(key: Key | Mod, mods: IMod[]): RuleBased {
		this.comboMode = true
		this.comboTarget = { key, mods }
		return this
	}
}

export class Layer extends IDesc {
	key: Key
	mods: IMod[] = []
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

	map(key: Key, mods: IMod[] = []): LayerKeyMap {
		const m = new LayerKeyMap(this, key, mods)
		this.maps.push(m)
		return m
	}
}


abstract class IMap extends IDesc {
	protected bu!: Config
	key: Key
	mods: IMod[]
	keys: IKeyDefines = []

	constructor(k: Key, mods: IMod[] = [], builder?: Config) {

		super()

		this.key = k
		this.mods = mods
		if (builder) this.bu = builder
	}

	get dscFul() {
		return this.dsc || `IMap: ${this.key}`
	}

	to(dst: IKey, mods?: IMod[]) {
		this.keys.push({ key: dst, mods: mods })
		return this
	}

	toOsaOpen(app: string, url: string) {
		return this.to(util.mkCmd_OsaOpen(app, url))
	}
}

export class SimpleKeyMap{
	cfg: Config
	key: Key
	mods: IMod[]
	dst?: IKeyDefine

	constructor(cfg: Config, key: Key, mods: IMod[] = []) {
		this.cfg = cfg
		this.key = key
		this.mods = mods
	}

	to(dst: IKey, mods?: IMod[]): SimpleKeyMap {
		this.dst = { key: dst, mods }
		return this
	}

	toOsaOpen(app: string, url: string): SimpleKeyMap {
		return this.to(util.mkCmd_OsaOpen(app, url))
	}
}

export class BasedKeyMap extends IMap {
	rule: RuleBased
	separated: boolean = false

	constructor(rule: RuleBased, k: Key, mods: IMod[] = [], bu: Config) {
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

	constructor(layer: Layer, k: Key, mods: IMod[]) {
		super(k, mods)
		this.layer = layer
	}

	separate(): LayerKeyMap {
		this.separated = true
		return this
	}
}

type IParams = 	{
	delayedActionMs?:number
	thresholdMs?:number
}

class RuleKeyMapHoldInfo{
	private map:IMap
	key: Key

	params: IParams = {}
	constructor( map:IMap, k:Key){
		this.map = map
		this.key = k
	}

	setParam( key:keyof IParams, value:any ){
		this.params[key] = value
	}

	desc( desc:string ){
		this.map.desc( desc )
	}
}

export class RuleKeyMap extends IMap {
	rule: Rule

	holdInfo?:RuleKeyMapHoldInfo

	constructor(rule: Rule, k: Key, mods: IMod[] = []) {
		super(k, mods)
		this.rule = rule
	}

	onHold( k:Key ){
		this.holdInfo = new RuleKeyMapHoldInfo(this,k)
		return this.holdInfo
	}
}

