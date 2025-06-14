import { Config, Key as k, Mod as mod } from 'karabiner-ts-config'

const co = new Config()
co.global.show_in_menu_bar = true

// hyper key
const bse = co.ruleBaseBy(k.caps_lock)
	.desc('🌟 Hyper')
	// optional
	.mapTo(mod.left_shift, [mod.left_control, mod.left_option, mod.left_command])
	// optional, if you don't call this method, the key will output escape when pressed alone
	.ifAlone(k.caps_lock)

// if you don't call the separate() method, those rules will merged into hyp
bse.map(k.f).to(`open -a 'Finder'`).desc('Finder').separate()
bse.map(k.t).to(`open -a WezTerm`).desc('WezTerm').separate()
bse.map(k.b).to(`open -a Firefox`).desc('Firefox').separate()

// vim type motion
bse.map(k.k).to(k.up_arrow).desc('Up')
bse.map(k.j).to(k.down_arrow).desc('Down')
bse.map(k.h).to(k.left_arrow).desc('Left')
bse.map(k.l).to(k.right_arrow).desc('Right')
bse.map(k.g).to(k.home).desc('Home')
bse.map(k.semicolon).to(k.end).desc('End')
bse.map(k.u).to(k.page_up).desc('PageUp')
bse.map(k.n).to(k.page_down).desc('PageDown')
bse.map(k.spacebar).to(k.escape).desc('Esc')


// App Open
const la = bse.layer(k.a).desc('Window Management').separate()
la.map(k.o).to(`open -a Obsidian`).desc('Obsidian').separate()
la.map(k.l).to(`open -a Line`).desc('Line').separate()
la.map(k.j).to(`open '/Volumes/dyn/jd2/JDownloader.jar'`).desc('JD2').separate()


const lw = bse.layer(k.w).desc('Window Management').separate()

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

// sub layer for resize
const lwr = lw.layer(k.r).desc('Window resize').separate()
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

// Next Window: you need to set the same shortcut in macOS Settings > Keyboard > Shortcuts, under 'Move focus to next window'.
lwr.map(k.n).to(k.grave_accent_and_tilde, [mod.left_control, mod.left_shift, mod.left_option, mod.left_command]).desc('Focus Next Window').separate()

// system
const ls = bse.layer(k.s).desc('System Control').separate()
ls.map(k.u).to(k.volume_increment).desc('Volume Up')
ls.map(k.d).to(k.volume_decrement).desc('Volume Down')

// supported on macOS 13 & above (need to have set up 'Background Music' in Accessibility > Audio first to use it).
ls.map(k.b).to(`CURRENT_STATE=$(defaults read com.apple.ComfortSounds "comfortSoundsEnabled" 2>/dev/null || echo "0"); NEW_STATE_BOOL=$( [ "$CURRENT_STATE" = "1" ] && echo "false" || echo "true" ); defaults write com.apple.ComfortSounds "comfortSoundsEnabled" -bool "$NEW_STATE_BOOL"; launchctl kickstart -k gui/$(id -u)/com.apple.accessibility.heard`).desc('Background Music')


// media control
const lm = bse.layer(k.m).desc('Media Control').separate()
lm.map(k.p).to(k.play_or_pause).desc('Play/Pause')
lm.map(k.n).to(k.fastforward).desc('Next Track')
lm.map(k.b).to(k.rewind).desc('Previous Track')


// raycast
const lr = bse.layer(k.r).desc('Raycast Extensions').separate()
lr.map(k.c).to(`open raycast://extensions/thomas/color-picker/pick-color`).desc('Color Picker')
lr.map(k.n).to(`open raycast://extensions/raycast/raycast-notes/raycast-notes`).desc('Notes')
lr.map(k.e).to(`open raycast://extensions/raycast/emoji-symbols/search-emoji-symbols`).desc('Emoji Search')
lr.map(k.h).to(`open raycast://extensions/raycast/clipboard-history/clipboard-history`).desc('Clipboard History')


// configure your Mac keyboard's Fn + arrow keys to be page/home series shortcuts for quick navigation.
const fn = co.rule('Fn Navigation')
fn.map(k.up_arrow, [mod.fn]).to(k.page_up).desc('Page Up')
fn.map(k.down_arrow, [mod.fn]).to(k.page_down).desc('Page Down')
fn.map(k.left_arrow, [mod.fn]).to(k.home).desc('Home')
fn.map(k.right_arrow, [mod.fn]).to(k.end).desc('End')

// vim stylet
const lv = bse.layer(k.v).desc('Vi Navigation').separate()
lv.map(k.k).to(k.up_arrow).desc('Up')
lv.map(k.j).to(k.down_arrow).desc('Down')
lv.map(k.h).to(k.left_arrow).desc('Left')
lv.map(k.l).to(k.right_arrow).desc('Right')
lv.map(k.u).to(k.page_up).desc('Page Up')
lv.map(k.d).to(k.page_down).desc('Page Down')


export default () => co
