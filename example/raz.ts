import { Config, IConfigDevice, Key as k, Mod as mod } from 'karabiner-ts-config'

const mdAny = [mod.any]
const mdLSC = [k.lshift, k.lctrl]
const mdRSC = [k.rshift, k.rctrl]


const co = new Config()
co.global.show_in_menu_bar = true


let sofle = co.device({product_id:24926,vendor_id:7504}) //sofle keyboard
let dvAir = co.device({ product_id:641, vendor_id:1452 })     //macbook air
let dvApMgKbV1 = co.device({ product_id:569, vendor_id:1452 }) //magickeyboard v1


// fro apple air
setHomeRowMods(dvAir)
setHyperFJ( dvAir, k.f, k.f, 'hyper:apple.L' )
setHyperFJ( dvAir, k.j, k.j, 'hyper:apple.R' )
setHyperLv( dvAir, k.caps_lock, '🌟hyper caps')

// apple standard keyboard need use ruleBaseBy to sim f18
setHomeRowMods(dvApMgKbV1)
setHyperFJ( dvApMgKbV1, k.f, k.f, 'hyper:apple.L' )
setHyperFJ( dvApMgKbV1, k.j, k.j, 'hyper:apple.R' )
setHyperLv( dvApMgKbV1, k.caps_lock, '🌟hyper caps')
//
// // because the sofle hold f/j is change in keymap (hardware)
// // homeRowMods also set by zmk
setHyperFJ( sofle, k.f18, k.none, 'hyper fj', false )
setHyperLv( sofle, k.f16, '🌟hyper caps')

//------------------------------------------------------------------------
// HomeRowMods
//------------------------------------------------------------------------
function setHomeRowMods(src:IConfigDevice) {

	// delayedActionMs:
	// 如果你發現你打
	let hr = src.rule('Home Rows')
	hr.setOnHold({ delayedActionMs:120, thresholdMs:250 })
	hr.map(k.caps_lock,mdAny).to(k.escape).onHold(k.f16)
	hr.map(k.a,mdAny).onHold(k.lshift)
	hr.map(k.s,mdAny).onHold(k.lctrl)
	hr.map(k.d,mdAny).onHold(k.lalt)
	hr.map(k.k,mdAny).onHold(k.ralt)
	hr.map(k.l,mdAny).onHold(k.rctrl)
	hr.map(k.semicolon,mdAny).onHold(k.rshift)
}

//------------------------------------------------------------------------
// hyper f / j, original use zmk to map kp or hold
//------------------------------------------------------------------------
function setHyperFJ( src:IConfigDevice, trgK:k, aloneK:k, desc, isAppleKB = true) {

	// use zmk to setup f18 key
	const f18 = src.ruleBaseBy(trgK).desc(desc).ifAlone(aloneK, 130, isAppleKB)

	// 這個設定是因為我的sofle鍵盤的enter鍵在下方，比蠅方便
	if ( !isAppleKB ) {
		f18.map(k.spacebar,mdAny).to(k.delete_forward)
		f18.map(k.enter).to(k.delete_or_backspace)
	}

	f18.map(k.k,mdAny).to(k.up_arrow).desc('Up')
	f18.map(k.j,mdAny).to(k.down_arrow).desc('Down')
	f18.map(k.h,mdAny).to(k.left_arrow).desc('Left')
	f18.map(k.l,mdAny).to(k.right_arrow).desc('Right')

	// f18.map(k.k,mdLSC).to(k.page_up).desc('Up')
	// if( src != k.j ) f18.map(k.j,mdLSC).to(k.page_down).desc('Down')
	// f18.map(k.h,mdLSC).to(k.home).desc('Left')
	// f18.map(k.l,mdLSC).to(k.end).desc('Right')

	// make left hand can input all numbers
	f18.map(k.q,mdAny).to(k.n6).desc('6')
	f18.map(k.w,mdAny).to(k.n7).desc('7')
	f18.map(k.e,mdAny).to(k.n8).desc('8')
	f18.map(k.r,mdAny).to(k.n9).desc('9')
	f18.map(k.t,mdAny).to(k.n0).desc('0')


	// left and rigth trigger fn key
	const knu = [ k.n1, k.n2, k.n3, k.n4, k.n5, k.n6, k.n7, k.n8, k.n9, k.n0]
	const kin = knu.concat([ k.y,   k.u ])
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

	// use f18 key like shift
	for (let i = 0; i < knu.length; i++) {
		let key = knu[i]
		f18.map(key, mdAny).to(key,[k.lshift])
	}
}



//------------------------------------------------------------------------
// hyper key
//------------------------------------------------------------------------
function setHyperLv( src:IConfigDevice, trgK:k, desc ){
	const bse = src.ruleBaseBy(trgK) .desc(desc)
		.ifAlone(k.escape)

	bse.map(k.f).to(`open -a 'Finder'`).desc('Finder')
	bse.map(k.t).to(`open -a ghostty`).desc('ghostty')
	bse.map(k.b).to(`open -a Firefox`).desc('Firefox')
	// vim type motion
	bse.map(k.k,[mod.any]).to(k.up_arrow).desc('Up')
	bse.map(k.j,[mod.any]).to(k.down_arrow).desc('Down')
	bse.map(k.h,[mod.any]).to(k.left_arrow).desc('Left')
	bse.map(k.l,[mod.any]).to(k.right_arrow).desc('Right')

	const la = bse.layer(k.a).desc('sim shift')
	la.map(k.k).to(k.up_arrow,[k.lshift])
	la.map(k.j).to(k.down_arrow,[k.lshift])
	la.map(k.h).to(k.left_arrow,[k.lshift])
	la.map(k.l).to(k.right_arrow,[k.lshift])

	// App Open
	const lo = bse.layer(k.o).desc('Open App')
	lo.map(k.s).to(`open -a spotify`).desc('spotify')
	lo.map(k.m).to(`open -a Obsidian`).desc('Obsidian')
	lo.map(k.l).to(`open -a Line`).desc('Line')
	lo.map(k.j).to(`open '/Volumes/dyn/jd2/JDownloader.jar'`).desc('JD2')

	const lw = bse.layer(k.w).desc('Window Management')
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
	lw.map(k.n).to(k.grave_accent_and_tilde, [k.lctrl, k.lshift, k.lalt, k.lcmd]).desc('Focus Next Window')
	// sub layer for resize
	const lwr = lw.layer(k.r).desc('Window resize')
	lwr.map(k.i).to(`open -g 'rectangle://execute-action?name=smaller'`).desc('Small')
	lwr.map(k.u).to(`open -g 'rectangle://execute-action?name=larger'`).desc('Large')
	lwr.map(k.h).to(`open -g 'rectangle://execute-action?name=smaller-width'`).desc('Smaller Width')
	lwr.map(k.l).to(`open -g 'rectangle://execute-action?name=larger-width'`).desc('Larger Width')
	lwr.map(k.j).to(`open -g 'rectangle://execute-action?name=smaller-height'`).desc('Smaller Height')
	lwr.map(k.k).to(`open -g 'rectangle://execute-action?name=larger-height'`).desc('Larger Height')

	// system
	const ls = bse.layer(k.s).desc('System Control')
	ls.map(k.i).to(k.volume_increment).desc('Volume Up')
	ls.map(k.u).to(k.volume_decrement).desc('Volume Down')
	ls.map(k.spacebar).to(k.play_or_pause).desc('Play/Paused')
	ls.map(k.period).to(k.fastforward).desc('Next Track')
	ls.map(k.comma).to(k.rewind).desc('Previous Track')

	// supported on macOS 13 & above (need to have set up 'Background Music' in Accessibility > Audio first to use it).
	ls.map(k.b).to(`CURRENT_STATE=$(defaults read com.apple.ComfortSounds "comfortSoundsEnabled" 2>/dev/null || echo "0"); NEW_STATE_BOOL=$( [ "$CURRENT_STATE" = "1" ] && echo "false" || echo "true" ); defaults write com.apple.ComfortSounds "comfortSoundsEnabled" -bool "$NEW_STATE_BOOL"; launchctl kickstart -k gui/$(id -u)/com.apple.accessibility.heard`).desc('Background Music')



	// raycast
	const lr = bse.layer(k.r).desc('Raycast Extensions')
	lr.map(k.n).to(`open raycast://extensions/raycast/raycast-notes/raycast-notes`).desc('Notes')
	lr.map(k.e).to(`open raycast://extensions/raycast/emoji-symbols/search-emoji-symbols`).desc('Emoji Search')
	lr.map(k.h).to(`open raycast://extensions/raycast/clipboard-history/clipboard-history`).desc('Clipboard History')

}

//------------------------------------------------------------------------
// export config
//------------------------------------------------------------------------
export default () => co
