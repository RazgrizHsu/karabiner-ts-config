import { Config, IConfigDevice, Key as k, Mod as mod } from 'karabiner-ts-config'

const mdAny = [mod.any]


const co = new Config()
co.global.show_in_menu_bar = true


let sofle = co.device({product_id:24926,vendor_id:7504}) //sofle keyboard
let dvAir = co.device({ product_id:641, vendor_id:1452 })     //macbook air
let dvApMgKbV1 = co.device({ product_id:569, vendor_id:1452 }) //magickeyboard v1


// fro apple air
setHomeRowMods(dvAir, k.f) //without f to f18
setHyperLv( dvAir, k.caps_lock, '🌟hyper caps')

// apple standard keyboard need use ruleBaseBy to sim f18
setHomeRowMods(dvApMgKbV1)
setHyperFJ( dvApMgKbV1, k.f, k.f, 'hyper:apple.L' )
setHyperFJ( dvApMgKbV1, k.j, k.j, 'hyper:apple.R' )
setHyperLv( dvApMgKbV1, k.caps_lock, '🌟hyper caps')


// premise: the sofle hold f/j is change in keymap (hardware), homeRowMods also set by zmk
setHyperLv( sofle, k.f16, '🌟hyper caps')
setSpecial( sofle )
// setHyperFJ( sofle, k.f18, k.none, 'hyper fj', false ) //20251213,use zmk for better speed



//------------------------------------------------------------------------
// HomeRowMods
//------------------------------------------------------------------------
function setHomeRowMods(src:IConfigDevice, toF18?:k) {

	// delayedActionMs:
	let hr = src.rule('Home Rows')
	hr.setOnHold({ delayedActionMs:120, thresholdMs:170 })
	hr.map(k.caps_lock,mdAny).to(k.escape).onHold(k.f16)
	hr.map(k.a,mdAny).onHold(k.lshift)
	hr.map(k.s,mdAny).onHold(k.lctrl)
	hr.map(k.d,mdAny).onHold(k.lalt)

	if (toF18) hr.map(toF18,mdAny).onHold(k.caps_lock)
}

//------------------------------------------------------------------------
// Special Keys
//------------------------------------------------------------------------
function setSpecial(src:IConfigDevice) {

	let hr = src.rule('special')
	hr.map(k.enter,[k.lcmd]).to(k.enter, [k.lshift])
}

//------------------------------------------------------------------------
// hyper f / j, original use zmk to map kp or hold
//------------------------------------------------------------------------
function setHyperFJ( src:IConfigDevice, trgK:k, aloneK:k, desc, isAppleKB = true) {

	// use zmk to setup f18 key
	const f18 = src.ruleBaseBy(trgK).desc(desc).ifAlone(aloneK, 130, isAppleKB)

	// 這個設定是因為我的sofle鍵盤的enter鍵在下方，比較方便
	if ( !isAppleKB ) {
		f18.map(k.m,mdAny).to(k.delete_forward)
		f18.map(k.n,mdAny).to(k.delete_or_backspace)
		f18.map(k.enter,mdAny).to(k.enter,[k.lshift])
	}

	// movement
	f18.map(k.k,mdAny).to(k.up_arrow).desc('Up')
	f18.map(k.j,mdAny).to(k.down_arrow).desc('Down')
	f18.map(k.h,mdAny).to(k.left_arrow).desc('Left')
	f18.map(k.l,mdAny).to(k.right_arrow).desc('Right')


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
	const knu = [ k.n1, k.n2, k.n3, k.n4, k.n5, k.n6, k.n7, k.n8, k.n9, k.n0]
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

	bse.map(k.f).toActivate('Finder', true).desc('Finder')
	bse.map(k.t).toOpen('Ghostty', true).desc('ghostty')
	bse.map(k.b).toOpen('Firefox').desc('Firefox')
	bse.map(k.c).toActivate('CocosCreator').desc('cocos')
	bse.map(k.s).toOpen('Spine').desc('Spine')




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

	la.map(k.i).to(k.volume_increment).desc('Volume Up')
	la.map(k.u).to(k.volume_decrement).desc('Volume Down')
	la.map(k.spacebar).to(k.play_or_pause).desc('Play/Paused')
	la.map(k.period).to(k.fastforward).desc('Next Track')
	la.map(k.comma).to(k.rewind).desc('Previous Track')

	// supported on macOS 13 & above (need to have set up 'Background Music' in Accessibility > Audio first to use it).
	la.map(k.b).to(`CURRENT_STATE=$(defaults read com.apple.ComfortSounds "comfortSoundsEnabled" 2>/dev/null || echo "0"); NEW_STATE_BOOL=$( [ "$CURRENT_STATE" = "1" ] && echo "false" || echo "true" ); defaults write com.apple.ComfortSounds "comfortSoundsEnabled" -bool "$NEW_STATE_BOOL"; launchctl kickstart -k gui/$(id -u)/com.apple.accessibility.heard`).desc('Background Music')


	// App Open
	const lo = bse.layer(k.o).desc('Open App')
	lo.map(k.s).toOpen('spotify').desc('spotify')
	lo.map(k.m).toOpen('Obsidian').desc('Obsidian')
	lo.map(k.l).toOpen('Line').desc('Line')
	lo.map(k.p).toOpen('Elmedia Player').desc('Elmedia')
	lo.map(k.j).to(`/Volumes/dyn/jd2/JDownloader.jar`).desc('JD2')
	lo.map(k.k).toOpen('Krita').desc('krita')
	lo.map(k.t).toOpen('TexturePacker')



	const lw = bse.layer(k.w).desc('Window Management')
	lw.map(k.d).toUrl('rectangle://execute-action?name=next-display', true).desc('Next Display')
	lw.map(k.k).toUrl('rectangle://execute-action?name=top-half', true).desc('Top Half')
	lw.map(k.j).toUrl('rectangle://execute-action?name=bottom-half', true).desc('Bottom Half')
	lw.map(k.h).toUrl('rectangle://execute-action?name=left-half', true).desc('Left Half')
	lw.map(k.l).toUrl('rectangle://execute-action?name=right-half', true).desc('Right Half')
	lw.map(k.spacebar).toUrl('rectangle://execute-action?name=restore', true).desc('Restore')
	lw.map(k.return_or_enter).toUrl('rectangle://execute-action?name=maximize', true).desc('Maximize')
	lw.map(k.y).toUrl('rectangle://execute-action?name=top-left-sixth', true).desc('Top Left Six')
	lw.map(k.period).toUrl('rectangle://execute-action?name=bottom-right-sixth', true).desc('Bottom Right Six')
	lw.map(k.u).toUrl('rectangle://execute-action?name=smaller', true).desc('Small')
	lw.map(k.i).toUrl('rectangle://execute-action?name=larger', true).desc('Large')

	// macOS next window
	lw.map(k.n).to(k.grave_accent_and_tilde, [k.lctrl, k.lshift, k.lalt, k.lcmd]).desc('Focus Next Window')
	// sub layer for resize
	const lwr = lw.layer(k.r).desc('Window resize')
	lwr.map(k.u).toUrl('rectangle://execute-action?name=smaller', true).desc('Small')
	lwr.map(k.i).toUrl('rectangle://execute-action?name=larger', true).desc('Large')
	lwr.map(k.h).toUrl('rectangle://execute-action?name=smaller-width', true).desc('Smaller Width')
	lwr.map(k.l).toUrl('rectangle://execute-action?name=larger-width', true).desc('Larger Width')
	lwr.map(k.j).toUrl('rectangle://execute-action?name=smaller-height', true).desc('Smaller Height')
	lwr.map(k.k).toUrl('rectangle://execute-action?name=larger-height', true).desc('Larger Height')




	// raycast
	const lr = bse.layer(k.r).desc('Raycast Extensions')
	lr.map(k.n).toUrl('raycast://extensions/raycast/raycast-notes/raycast-notes').desc('Notes')
	lr.map(k.e).toUrl('raycast://extensions/raycast/emoji-symbols/search-emoji-symbols').desc('Emoji Search')
	lr.map(k.h).toUrl('raycast://extensions/raycast/clipboard-history/clipboard-history').desc('Clipboard History')

}

//------------------------------------------------------------------------
// export config
//------------------------------------------------------------------------
export default () => co
