import { Config, Key as k, Mod as mod } from 'karabiner-ts-config'


const co = new Config()
co.global.show_in_menu_bar = true

const hyp = co.ruleBaseBy(k.caps_lock)
	.desc('🌟 Hyper')

const sW = hyp.layer(k.w).desc('Window Management').separate()

const sWY = sW.layer(k.y).desc('Window resize y').separate()

// IMPORTANT: This configuration does not work
// because pressing `s+w+y` along with `-` or `=` exceeds the key rollover limitations of your keyboard.
// As a result, the keyboard’s hardware matrix does not register the `-` or `=` keys in this combination,
// and Karabiner-Elements never sees those keys being pressed.

sWY.map(k.hyphen).to(`open -g 'rectangle://execute-action?name=smaller-height'`).desc('Smaller Height')
sWY.map(k.equal_sign).to(`open -g 'rectangle://execute-action?name=larger-height'`).desc('Larger Height')


// 這邊可以正常工作, 因為在我的鍵盤下, 這些鍵位並不衝突
const sWX = sW.layer(k.x).desc('Window resize x').separate()
sWX.map(k.j).to(`open -g 'rectangle://execute-action?name=smaller-width'`).desc('Smaller Width')
sWX.map(k.k).to(`open -g 'rectangle://execute-action?name=larger-width'`).desc('Larger Width')


export default () => co
