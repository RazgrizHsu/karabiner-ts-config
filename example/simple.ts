import { Config, Key as k, Mod as mod } from 'karabiner-ts-config'

const co = new Config()
co.global.show_in_menu_bar = true

const fnNav = co.rule('Fn Navigation')
fnNav.map(k.up_arrow, [mod.fn]).to(k.page_up).desc('Page Up')
fnNav.map(k.down_arrow, [mod.fn]).to(k.page_down).desc('Page Down')
fnNav.map(k.left_arrow, [mod.fn]).to(k.home).desc('Home')
fnNav.map(k.right_arrow, [mod.fn]).to(k.end).desc('End')

export default () => co
