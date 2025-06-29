import { Config, Key as k, Mod as mod } from 'karabiner-ts-config'
// import { Config, Key as k, Mod as mod } from '../src'

const co = new Config()
co.global.show_in_menu_bar = true

// sofle keyboard
co.device({product_id:24926,vendor_id:7504})

co.map(k.caps_lock).to(k.f16)
// let dvcAir = co.device({ product_id:641, vendor_id:1452 })
//
// // for apple standard keyboard
// dvcAir.map(k.caps_lock).to(k.f16)
//
// let hr = dvcAir.rule('Home Rows')
// hr.setOnHold({ delayedActionMs:138, thresholdMs:180 })
// hr.map(k.a).onHold(k.lshift)
// hr.map(k.s).onHold(k.lctrl)
// hr.map(k.d).onHold(k.lcmd)
// hr.map(k.k).onHold(k.lalt)
// hr.map(k.l).onHold(k.rctrl)
// hr.map(k.semicolon).onHold(k.rshift)




const mdAny = [mod.any]
const mdLSC = [k.lshift, k.lctrl]
const mdRSC = [k.rshift, k.rctrl]

// use zmk to setup f18 key
const f18 = co.ruleBaseBy(k.f18).desc('f18').ifAlone(k.none)
f18.map(k.spacebar,mdAny).to(k.delete_forward)
f18.map(k.enter).to(k.delete_or_backspace)


f18.map(k.k,mdAny).to(k.up_arrow).desc('Up')
f18.map(k.j,mdAny).to(k.down_arrow).desc('Down')
f18.map(k.h,mdAny).to(k.left_arrow).desc('Left')
f18.map(k.l,mdAny).to(k.right_arrow).desc('Right')

f18.map(k.k,mdLSC).to(k.page_up).desc('Up')
f18.map(k.j,mdLSC).to(k.page_down).desc('Down')
f18.map(k.h,mdLSC).to(k.home).desc('Left')
f18.map(k.l,mdLSC).to(k.end).desc('Right')

// make left hand can input all numbers
f18.map(k.q,mdAny).to(k.n6).desc('6')
f18.map(k.w,mdAny).to(k.n7).desc('7')
f18.map(k.e,mdAny).to(k.n8).desc('8')
f18.map(k.r,mdAny).to(k.n9).desc('9')
f18.map(k.t,mdAny).to(k.n0).desc('0')


// left and rigth trigger fn key
const kin = [ k.n1, k.n2, k.n3, k.n4, k.n5, k.n6, k.n7, k.n8, k.n9, k.n0,  k.y,   k.u ]
const kou = [ k.f1, k.f2, k.f3, k.f4, k.f5, k.f6, k.f7, k.f8, k.f9, k.f10, k.f11, k.f12 ]
for (let i = 0; i < kin.length; i++) {
	const inp = kin[i];
	const out = kou[i];
	const dsc = `${inp} -> ${out}`

	f18.map(inp, mdLSC).to(out).desc(dsc)
	f18.map(inp, mdRSC).to(out).desc(dsc)
}

f18.map(k.u, mdAny).to(k.hyphen).desc('-')
f18.map(k.i, mdAny).to(k.equal_sign).desc('=')
f18.map(k.o, mdAny).to(k.open_bracket).desc('[')
f18.map(k.p, mdAny).to(k.close_bracket).desc(']')
f18.map(k.backslash, mdAny).to(k.backslash, [k.lshift]).desc('|')
f18.map(k.semicolon, mdAny).to(k.semicolon, [k.lshift]).desc(':')
f18.map(k.quote, mdAny).to(k.quote, [k.lshift]).desc('"')
f18.map(k.comma, mdAny).to(k.comma, [k.lshift]).desc('<')
f18.map(k.period, mdAny).to(k.period, [k.lshift]).desc('>')
f18.map(k.slash, mdAny).to(k.slash, [k.lshift]).desc('?')

f18.map(k.n9, mdAny).to(k.n9,[k.lshift]).desc('(')
f18.map(k.n0, mdAny).to(k.n0,[k.lshift]).desc(')')

// const lc = co.rule('Left Alt')
// let modLA = [k.lalt,mod.any]
// lc.map(k.u, modLA).to(k.hyphen).desc('-')
// lc.map(k.i, modLA).to(k.equal_sign).desc('=')
// lc.map(k.o, modLA).to(k.open_bracket).desc('[')
// lc.map(k.p, modLA).to(k.close_bracket).desc(']')
// lc.map(k.backslash, modLA).to(k.backslash, [k.lshift]).desc('|')
// lc.map(k.semicolon, modLA).to(k.semicolon, [k.lshift]).desc(':')
// lc.map(k.quote, modLA).to(k.quote, [k.lshift]).desc('"')
// lc.map(k.comma, modLA).to(k.comma, [k.lshift]).desc('<')
// lc.map(k.period, modLA).to(k.period, [k.lshift]).desc('>')
// lc.map(k.slash, modLA).to(k.slash, [k.lshift]).desc('?')
//
// lc.map(k.n9, modLA).to(k.n9,[k.lshift]).desc('(')
// lc.map(k.n0, modLA).to(k.n0,[k.lshift]).desc(')')

//------------------------------------------------------------------------
// hyper key
//------------------------------------------------------------------------
const bse = co.ruleBaseBy(k.f16) .desc('🌟 Hyper')
	.ifAlone(k.escape)

bse.map(k.f).to(`open -a 'Finder'`).desc('Finder').separate()
bse.map(k.t).to(`open -a ghostty`).desc('ghostty').separate()
bse.map(k.b).to(`open -a Firefox`).desc('Firefox').separate()

// vim type motion
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

// system
const ls = bse.layer(k.s).desc('System Control').separate()
ls.map(k.i).to(k.volume_increment).desc('Volume Up')
ls.map(k.u).to(k.volume_decrement).desc('Volume Down')
ls.map(k.spacebar).to(k.play_or_pause).desc('Play/Paused')
ls.map(k.period).to(k.fastforward).desc('Next Track')
ls.map(k.comma).to(k.rewind).desc('Previous Track')

// supported on macOS 13 & above (need to have set up 'Background Music' in Accessibility > Audio first to use it).
ls.map(k.b).to(`CURRENT_STATE=$(defaults read com.apple.ComfortSounds "comfortSoundsEnabled" 2>/dev/null || echo "0"); NEW_STATE_BOOL=$( [ "$CURRENT_STATE" = "1" ] && echo "false" || echo "true" ); defaults write com.apple.ComfortSounds "comfortSoundsEnabled" -bool "$NEW_STATE_BOOL"; launchctl kickstart -k gui/$(id -u)/com.apple.accessibility.heard`).desc('Background Music')



// raycast
const lr = bse.layer(k.r).desc('Raycast Extensions').separate()
lr.map(k.n).to(`open raycast://extensions/raycast/raycast-notes/raycast-notes`).desc('Notes')
lr.map(k.e).to(`open raycast://extensions/raycast/emoji-symbols/search-emoji-symbols`).desc('Emoji Search')
lr.map(k.h).to(`open raycast://extensions/raycast/clipboard-history/clipboard-history`).desc('Clipboard History')



export default () => co
