export interface IKaraCfgGlobal {

    show_in_menu_bar: boolean
}

export interface IDeviceIdentifiers {
	is_keyboard?: boolean
	is_pointing_device?: boolean
	product_id?: number
	vendor_id?: number
}

export interface IDevice {
	identifiers: IDeviceIdentifiers
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
	manipulators: IManipulator[]
}

export interface IAlone {
	//"to_if_alone": [{ "key_code": "caps_lock", "hold_down_milliseconds": 100 }]
	key_code: string
	hold_down_milliseconds?: number
	halt?:boolean
}

export interface IManipulator {
	description?: string
	type: 'basic'
	from: IFromEvent
	to?: IToEvent[]
	to_after_key_up?: IToEvent[]
	to_if_alone?: IAlone[]
	conditions?: ICondition[]

}

//             "to_if_held_down": [{ "key_code": "left_shift" }],
//             "to_delayed_action": {
//                 "to_if_canceled": [{ "key_code": "f" }]
//             },
//             "parameters": {
//                 "basic.to_delayed_action_delay_milliseconds": 500,
//                 "basic.to_if_held_down_threshold_milliseconds": 500
//             }
export type IManipulatorHeld = IManipulator & {
	to_if_held_down: {key_code:string}[]
	to_delayed_action?: { to_if_canceled: {key_code:string}[] }

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
}

export interface ICondition {
	type: 'variable_if'
	name: string
	value: number
}

export interface ISimple {
  from: {
    key_code: string
    modifiers?: {
      mandatory?: string[]
      optional?: string[]
    }
  }
  to: {
    key_code: string
    modifiers?: string[]
  }
}
