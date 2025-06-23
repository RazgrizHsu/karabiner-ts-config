import { Config, Key as k, Mod as mod } from 'karabiner-ts-config'
const co = new Config()
co.global.show_in_menu_bar = true


let ho = co.rule('Home Rows')

// set global args for this rule
// Each person has different typing speed, you may need to adjust these two parameters
// Use karabiner-eventviewer to see what delay works best for you
ho.setOnHold({ delayedActionMs:120, thresholdMs:160 })
// or set args each
// ho.map(k.x).onHold(k.k).setArgs({thresholdMs:125})

// Ctrl & Alt Mapping
ho.map(k.a).onHold(k.lctrl).desc('a -> LCTRL')
ho.map(k.s).onHold(k.lalt).desc('s -> LALT')
ho.map(k.d).onHold(k.lcmd).desc('d -> LCMD')

export default () => co
