export interface IKaraCfgGlobal {

    show_in_menu_bar: boolean
}

export interface IKaraCfg {
  global: IKaraCfgGlobal
  profiles: IProfile[]
}

export interface IProfile {
  name: string
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

export interface IManipulator {
  description?: string
  type: 'basic'
  from: IFromEvent
  to?: IToEvent[]
  to_after_key_up?: IToEvent[]
  to_if_alone?: IToEvent[]
  conditions?: ICondition[]
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
