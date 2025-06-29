import { Config, Key as k, Mod as mod } from 'karabiner-ts-config'
const co = new Config()
co.global.show_in_menu_bar = true


let hr = co.rule('Home Rows')

// set global args for this rule
// Each person has different typing speed, you may need to adjust these two parameters
// Use karabiner-eventviewer to see what delay works best for you
hr.setOnHold({ delayedActionMs:130, thresholdMs:180 })
// or set args each
// ho.map(k.x).onHold(k.k).setArgs({thresholdMs:125})

// Ctrl & Alt Mapping
hr.map(k.a).onHold(k.lctrl).desc('a -> LCTRL')
hr.map(k.s).onHold(k.lalt).desc('s -> LALT')
hr.map(k.d).onHold(k.lcmd).desc('d -> LCMD')

// 20250625: Currently cannot find a better approach
// For combinations like shift+alt, each key needs to wait 167ms to be recognized as hold
// If the timing is reduced, complex shortcuts trigger faster but typing 'asdffdsa' causes more misfires
// hr.setOnHold({ delayedActionMs:130, thresholdMs:180 })
// hr.map(k.a,[mod.any]).onHold(k.lshift).desc('lshift')
// hr.map(k.s,[mod.any]).onHold(k.lctrl).desc('lctrl')
// hr.map(k.d,[mod.any]).onHold(k.lalt).desc('lalt')
// hr.map(k.semicolon,[mod.any]).onHold(k.rshift).desc('rshift')
// hr.map(k.l,[mod.any]).onHold(k.rctrl).desc('rctrl')
// hr.map(k.k,[mod.any]).onHold(k.ralt).desc('ralt')

export default () => co
