import { Config, Key as k, Mod as mod } from 'karabiner-ts-config'
// import { Config, Key as k, Mod as mod } from '../src'

const co = new Config()
co.global.show_in_menu_bar = true

// sofle keyboard
co.device({product_id:24926,vendor_id:7504})

// for apple standard keyboard
co.map(k.caps_lock).to(k.f16)


let ho = co.rule('hold keys: HomeRow')
ho.setOnHold({ delayedActionMs:110, thresholdMs:150 })
ho.map(k.a,[mod.any]).onHold(k.lshift).desc('lshift')
ho.map(k.s,[mod.any]).onHold(k.lctrl).desc('lctrl')
ho.map(k.d,[mod.any]).onHold(k.lalt).desc('lalt')
ho.map(k.semicolon,[mod.any]).onHold(k.rshift).desc('rshift')
ho.map(k.l,[mod.any]).onHold(k.rctrl).desc('rctrl')
ho.map(k.k,[mod.any]).onHold(k.ralt).desc('ralt')
// ho.map(k.z).onHold(k.lctrl).desc('z -> LCTRL')
// ho.map(k.x).onHold(k.lalt).desc('x -> LALT')
// ho.map(k.slash).onHold(k.rctrl).desc('/ -> RALT')
// ho.map(k.period).onHold(k.ralt).desc('. -> RALT')


// for fast
// co.map(k.rcmd,[k.lalt]).to(k.escape)
// co.map(k.spacebar,[k.lalt]).to(k.delete_or_backspace)
// co.map(k.return_or_enter,[k.lalt]).to(k.delete_forward)
co.map(k.return_or_enter,[k.lcmd]).to(k.delete_or_backspace)
co.map(k.return_or_enter,[k.lcmd,k.lshift]).to(k.delete_forward)
// co.map(k.delete_or_backspace,[k.lshift]).to(k.delete_forward) //mac default



const lc = co.rule('Left Alt')
lc.map(k.u, [k.lalt]).to(k.hyphen).desc('-')
lc.map(k.i, [k.lalt]).to(k.equal_sign).desc('=')
lc.map(k.u, [k.lalt, k.lshift]).to(k.hyphen, [k.lshift]).desc('_')
lc.map(k.i, [k.lalt, k.lshift]).to(k.equal_sign, [k.lshift]).desc('+')
lc.map(k.o, [k.lalt]).to(k.open_bracket).desc('[')
lc.map(k.p, [k.lalt]).to(k.close_bracket).desc(']')
lc.map(k.o, [k.lalt, k.lshift]).to(k.open_bracket, [k.lshift]).desc('{')
lc.map(k.p, [k.lalt, k.lshift]).to(k.close_bracket, [k.lshift]).desc('}')
lc.map(k.backslash, [k.lalt]).to(k.backslash, [k.lshift]).desc('|')
lc.map(k.semicolon, [k.lalt]).to(k.semicolon, [k.lshift]).desc(':')
lc.map(k.quote, [k.lalt]).to(k.quote, [k.lshift]).desc('"')
lc.map(k.comma, [k.lalt]).to(k.comma, [k.lshift]).desc('<')
lc.map(k.period, [k.lalt]).to(k.period, [k.lshift]).desc('>')
lc.map(k.slash, [k.lalt]).to(k.slash, [k.lshift]).desc('?')

lc.map(k.n9, [k.lalt]).to(k.n9,[k.lshift]).desc('(')
lc.map(k.n0, [k.lalt]).to(k.n0,[k.lshift]).desc(')')

//------------------------------------------------------------------------
// hyper key
//------------------------------------------------------------------------
const bse = co.ruleBaseBy(k.f16) .desc('🌟 Hyper')
	.ifAlone(k.escape)

bse.map(k.f).to(`open -a 'Finder'`).desc('Finder').separate()
bse.map(k.t).to(`open -a ghostty`).desc('ghostty').separate()
bse.map(k.b).to(`open -a Firefox`).desc('Firefox').separate()

// vim type motion
// bse.map(k.k,[mod.any]).to(k.up_arrow,[mod.any]).desc('Up')
// bse.map(k.j,[mod.any]).to(k.down_arrow,[mod.any]).desc('Down')
// bse.map(k.h,[mod.any]).to(k.left_arrow,[mod.any]).desc('Left')
// bse.map(k.l,[mod.any]).to(k.right_arrow,[mod.any]).desc('Right')
bse.map(k.k,[mod.any]).to(k.up_arrow).desc('Up')
bse.map(k.j,[mod.any]).to(k.down_arrow).desc('Down')
bse.map(k.h,[mod.any]).to(k.left_arrow).desc('Left')
bse.map(k.l,[mod.any]).to(k.right_arrow).desc('Right')

const la = bse.layer(k.a).desc('sim shift').separate()
la.map(k.k).to(k.up_arrow,[k.lshift])
la.map(k.j).to(k.down_arrow,[k.lshift])
la.map(k.h).to(k.left_arrow,[k.lshift])
la.map(k.l).to(k.right_arrow,[k.lshift])

// App Open
const lo = bse.layer(k.o).desc('Open App').separate()
lo.map(k.s).to(`open -a spotify`).desc('spotify').separate()
lo.map(k.m).to(`open -a Obsidian`).desc('Obsidian').separate()
lo.map(k.l).to(`open -a Line`).desc('Line').separate()
lo.map(k.j).to(`open '/Volumes/dyn/jd2/JDownloader.jar'`).desc('JD2').separate()


const lw = bse.layer(k.w).desc('Window Management').separate()
lw.map(k.d).to(`open -g 'rectangle://execute-action?name=next-display'`).desc('Next Display')
lw.map(k.k).to(`open -g 'rectangle://execute-action?name=top-half'`).desc('Top Half')
lw.map(k.j).to(`open -g 'rectangle://execute-action?name=bottom-half'`).desc('Bottom Half')
lw.map(k.h).to(`open -g 'rectangle://execute-action?name=left-half'`).desc('Left Half')
lw.map(k.l).to(`open -g 'rectangle://execute-action?name=right-half'`).desc('Right Half')
lw.map(k.spacebar).to(`open -g 'rectangle://execute-action?name=restore'`).desc('Restore')
lw.map(k.return_or_enter).to(`open -g 'rectangle://execute-action?name=maximize'`).desc('Maximize')
lw.map(k.y).to(`open -g 'rectangle://execute-action?name=top-left-sixth'`).desc('Top Left Six')
lw.map(k.period).to(`open -g 'rectangle://execute-action?name=bottom-right-sixth'`).desc('Bottom Right Six')
lw.map(k.u).to(`open -g 'rectangle://execute-action?name=smaller'`).desc('Small')
lw.map(k.i).to(`open -g 'rectangle://execute-action?name=larger'`).desc('Large')

// macOS next window
lw.map(k.n).to(k.grave_accent_and_tilde, [k.lctrl, k.lshift, k.lalt, k.lcmd]).desc('Focus Next Window').separate()

// sub layer for resize
const lwr = lw.layer(k.r).desc('Window resize').separate()
lwr.map(k.i).to(`open -g 'rectangle://execute-action?name=smaller'`).desc('Small')
lwr.map(k.u).to(`open -g 'rectangle://execute-action?name=larger'`).desc('Large')
lwr.map(k.h).to(`open -g 'rectangle://execute-action?name=smaller-width'`).desc('Smaller Width')
lwr.map(k.l).to(`open -g 'rectangle://execute-action?name=larger-width'`).desc('Larger Width')
lwr.map(k.j).to(`open -g 'rectangle://execute-action?name=smaller-height'`).desc('Smaller Height')
lwr.map(k.k).to(`open -g 'rectangle://execute-action?name=larger-height'`).desc('Larger Height')

// if you prefer raycast
// sW.map(k.o).toOsaOpen('Raycast', 'raycast://extensions/raycast/window-management/next-desktop').desc('Next Desktop')
// sW.map(k.k).toOsaOpen('Raycast', 'raycast://extensions/raycast/window-management/top-half').desc('Top Half')
// sW.map(k.j).toOsaOpen('Raycast', 'raycast://extensions/raycast/window-management/bottom-half').desc('Bottom Half')
// sW.map(k.h).toOsaOpen('Raycast', 'raycast://extensions/raycast/window-management/left-half').desc('Left Half')
// sW.map(k.l).toOsaOpen('Raycast', 'raycast://extensions/raycast/window-management/right-half').desc('Right Half')
// sW.map(k.return_or_enter).toOsaOpen('Raycast', 'raycast://extensions/raycast/window-management/maximize').desc('Maximize')
// sW.map(k.hyphen).toOsaOpen('Raycast', 'raycast://extensions/raycast/window-management/make-smaller').desc('Small')
// sW.map(k.equal_sign).toOsaOpen('Raycast', 'raycast://extensions/raycast/window-management/make-larger').desc('Large')
// sW.map(k.u).toOsaOpen('Raycast', 'raycast://extensions/raycast/window-management/top-left-sixth').desc('Top Left Six')

// system
const ls = bse.layer(k.s).desc('System Control').separate()
ls.map(k.u).to(k.volume_increment).desc('Volume Up')
ls.map(k.j).to(k.volume_decrement).desc('Volume Down')
ls.map(k.spacebar).to(k.play_or_pause).desc('Play/Paused')
ls.map(k.n).to(k.fastforward).desc('Next Track')
ls.map(k.h).to(k.rewind).desc('Previous Track')

// supported on macOS 13 & above (need to have set up 'Background Music' in Accessibility > Audio first to use it).
ls.map(k.b).to(`CURRENT_STATE=$(defaults read com.apple.ComfortSounds "comfortSoundsEnabled" 2>/dev/null || echo "0"); NEW_STATE_BOOL=$( [ "$CURRENT_STATE" = "1" ] && echo "false" || echo "true" ); defaults write com.apple.ComfortSounds "comfortSoundsEnabled" -bool "$NEW_STATE_BOOL"; launchctl kickstart -k gui/$(id -u)/com.apple.accessibility.heard`).desc('Background Music')



// raycast
const lr = bse.layer(k.r).desc('Raycast Extensions').separate()
lr.map(k.n).to(`open raycast://extensions/raycast/raycast-notes/raycast-notes`).desc('Notes')
lr.map(k.e).to(`open raycast://extensions/raycast/emoji-symbols/search-emoji-symbols`).desc('Emoji Search')
lr.map(k.h).to(`open raycast://extensions/raycast/clipboard-history/clipboard-history`).desc('Clipboard History')



export default () => co
