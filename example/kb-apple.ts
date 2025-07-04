import { Config, Key as k, Mod as mod } from 'karabiner-ts-config'

const co = new Config()
co.global.show_in_menu_bar = true

//------------------------------------------------------------------------
// hyper key
//------------------------------------------------------------------------
const bse = co.ruleBaseBy(k.caps_lock)
	.desc('🌟 Hyper')
	// optional
	.mapTo(mod.left_shift, [mod.left_control, mod.left_option, mod.left_command])
	// optional, if you don't call this method, the key will output escape when pressed alone
	.ifAlone(k.caps_lock)

bse.map(k.f).to(`open -a 'Finder'`).desc('Finder')
bse.map(k.t).to(`open -a WezTerm`).desc('WezTerm')
bse.map(k.b).to(`open -a Firefox`).desc('Firefox')
// vim type motion
bse.map(k.k).to(k.up_arrow).desc('Up')
bse.map(k.j).to(k.down_arrow).desc('Down')
bse.map(k.h).to(k.left_arrow).desc('Left')
bse.map(k.l).to(k.right_arrow).desc('Right')

// App Open
const la = bse.layer(k.a).desc('Application')
la.map(k.s).to(`open -a spotify`).desc('spotify')
la.map(k.o).to(`open -a Obsidian`).desc('Obsidian')
la.map(k.j).to(`open '/Volumes/dyn/jd2/JDownloader.jar'`).desc('JD2')

const lw = bse.layer(k.w).desc('Window Management')
// if you use rectangle
lw.map(k.d).to(`open -g 'rectangle://execute-action?name=next-display'`).desc('Next Display')
lw.map(k.k).to(`open -g 'rectangle://execute-action?name=top-half'`).desc('Top Half')
lw.map(k.j).to(`open -g 'rectangle://execute-action?name=bottom-half'`).desc('Bottom Half')
lw.map(k.h).to(`open -g 'rectangle://execute-action?name=left-half'`).desc('Left Half')
lw.map(k.l).to(`open -g 'rectangle://execute-action?name=right-half'`).desc('Right Half')
lw.map(k.delete_or_backspace).to(`open -g 'rectangle://execute-action?name=restore'`).desc('Restore')
lw.map(k.return_or_enter).to(`open -g 'rectangle://execute-action?name=maximize'`).desc('Maximize')
lw.map(k.u).to(`open -g 'rectangle://execute-action?name=top-left-sixth'`).desc('Top Left Six')
lw.map(k.period).to(`open -g 'rectangle://execute-action?name=bottom-right-sixth'`).desc('Bottom Right Six')
lw.map(k.hyphen).to(`open -g 'rectangle://execute-action?name=smaller'`).desc('Small')
lw.map(k.equal_sign).to(`open -g 'rectangle://execute-action?name=larger'`).desc('Large')

// Next Window: you need to set the same shortcut in macOS Settings > Keyboard > Shortcuts, under 'Move focus to next window'.
lw.map(k.n).to(k.grave_accent_and_tilde, [mod.left_control, mod.left_shift, mod.left_option, mod.left_command]).desc('Focus Next Window')
// sub layer for resize
const lwr = lw.layer(k.r).desc('Window resize')
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
const ls = bse.layer(k.s).desc('System Control')
ls.map(k.u).to(k.volume_increment).desc('Volume Up')
ls.map(k.d).to(k.volume_decrement).desc('Volume Down')

// supported on macOS 13 & above (need to have set up 'Background Music' in Accessibility > Audio first to use it).
ls.map(k.b).to(`CURRENT_STATE=$(defaults read com.apple.ComfortSounds "comfortSoundsEnabled" 2>/dev/null || echo "0"); NEW_STATE_BOOL=$( [ "$CURRENT_STATE" = "1" ] && echo "false" || echo "true" ); defaults write com.apple.ComfortSounds "comfortSoundsEnabled" -bool "$NEW_STATE_BOOL"; launchctl kickstart -k gui/$(id -u)/com.apple.accessibility.heard`).desc('Background Music')


// media control
const lm = bse.layer(k.m).desc('Media Control')
lm.map(k.p).to(k.play_or_pause).desc('Play/Pause')
lm.map(k.n).to(k.fastforward).desc('Next Track')
lm.map(k.b).to(k.rewind).desc('Previous Track')


// configure your Mac keyboard's Fn + arrow keys to be page/home series shortcuts for quick navigation.
const fn = co.rule('Fn Navigation')
fn.map(k.up_arrow, [mod.fn]).to(k.page_up).desc('Page Up')
fn.map(k.down_arrow, [mod.fn]).to(k.page_down).desc('Page Down')
fn.map(k.left_arrow, [mod.fn]).to(k.home).desc('Home')
fn.map(k.right_arrow, [mod.fn]).to(k.end).desc('End')


export default () => co
