import { Key, Mouse, Mod } from './enums'
export { Key, Mouse, Mod }

export interface IKaraCfgGlobal {

    show_in_menu_bar: boolean
}

export interface IDeviceIds {
	is_keyboard?: boolean
	is_pointing_device?: boolean
	is_game_pad?: boolean
	is_consumer?: boolean
	is_touch_bar?: boolean
	is_built_in_keyboard?: boolean
	product_id?: number
	vendor_id?: number
	device_address?: string
	location_id?: number
}

export interface IDevice {
	identifiers: IDeviceIds
	ignore?: boolean
}

export interface IKaraCfg {
	global: IKaraCfgGlobal
	profiles: IProfile[]
}

export interface IProfile {
	name: string
	devices?: IDevice[]
	simple_modifications?: ISimple[]
	complex_modifications: {
		rules: IKaraRule[]
	}
	virtual_hid_keyboard: {
		keyboard_type_v2: string
	}
}

export interface IKaraRule {
	description: string
	manipulators: (IManipulator|IManipulatorHeld)[]
}

export interface IAlone {
	//"to_if_alone": [{ "key_code": "caps_lock", "hold_down_milliseconds": 100 }]
	key_code: string
	hold_down_milliseconds?: number
	halt?:boolean
	repeat?:boolean
}

export interface IManipulator {
	description?: string
	type: 'basic'
	from: IFromEvent
	to?: IToEvent[]
	to_if_held_down?: IToEvent[]
	to_after_key_up?: IToEvent[]
	to_if_alone?: IAlone[]
	conditions?: ICond[]
	parameters?: { [key: string]:any }


	to_delayed_action?: {
		to_if_canceled: IToEvent[],
		to_if_invoked?: IToEvent[]
	}
}

//             "to_if_held_down": [{ "key_code": "left_shift" }],
//             "to_delayed_action": {
//                 "to_if_canceled": [{ "key_code": "f" }]
//             },
//             "parameters": {
//                 "basic.to_delayed_action_delay_milliseconds": 500,
//                 "basic.to_if_held_down_threshold_milliseconds": 500
//             }

type ToIfHeldDownItem = {
  key_code?: string
  shell_command?: string
}

export type IManipulatorHeld = IManipulator & {
	to_if_held_down: ToIfHeldDownItem[]
	to_delayed_action?: {
		to_if_canceled: IToEvent[],
		to_if_invoked?: IToEvent[]
	}

	parameters: { [key: string]:any }
}

export interface IFromEvent {
	key_code: string
	modifiers?: {
		mandatory?: string[]
		optional?: string[]
	}
}

export interface IToEvent {
	key_code?: string
	modifiers?: string[]
	shell_command?: string
	pointing_button?: string
	set_variable?: {
		name: string
		value: number
	}
	halt?:boolean
}

export type IDeviceCondType = 'device_if' | 'device_unless' | 'device_exists_if' | 'device_exists_unless'

export interface ICondVar {
	type: 'variable_if'
	name: string
	value: number
}

export interface ICondDevice {
	type: IDeviceCondType
	identifiers: IDeviceIds[]
	description?: string
}

export type ICond = ICondVar | ICondDevice

export interface ISimple {
  from: IFromEvent
  to: {
    key_code: string
    modifiers?: string[]
  }
}

export type IKey = Key | Mouse | string
export type IKeyDefine = { key: IKey, mods?: IMod[] }
export type IKeyDefines = Array<IKeyDefine>
export type IMod = Key | Mod
export type IMods = IMod[]
