/**
 * Multi-Device Configuration Example
 *
 * This example demonstrates how to configure different keyboards with
 * device-specific settings while avoiding key conflicts.
 *
 * Key concepts:
 * - Device-specific functions should use the device parameter, not global config
 * - Same keys on different devices don't conflict
 * - Proper device identification and separation
 */

import { Config, Key as k, Mod as mod } from 'karabiner-ts-config'

const co = new Config()
co.global.show_in_menu_bar = true

// Device definitions with clear descriptions
const devices = {
    sofle: co.device({
        product_id: 24926,
        vendor_id: 7504
    }),
    macbookAir: co.device({
        product_id: 641,
        vendor_id: 1452
    }),
    magicKeyboard: co.device({
        product_id: 569,
        vendor_id: 1452
    }),
    mechanicalKb: co.device({
        vendor_id: 1133  // Logitech
    })
}

// ✅ Correct: Device-specific function using device parameter
function setupDeviceSpecificKeys(device, hyperKey = k.f16, escapeKey = k.caps_lock, description = 'Device Config') {

    // IMPORTANT: Use 'device' parameter, not global 'co'
    const hyper = device.ruleBaseBy(hyperKey).desc(description + ' - Hyper')

    // Common shortcuts that work on all devices
    hyper.map(k.f).to(`open -a 'Finder'`).desc('Finder')
    hyper.map(k.t).to(`open -a 'Terminal'`).desc('Terminal')
    hyper.map(k.b).to(`open -a 'Firefox'`).desc('Firefox')

    // Vim-style navigation
    hyper.map(k.h, [mod.any]).to(k.left_arrow).desc('Left')
    hyper.map(k.j, [mod.any]).to(k.down_arrow).desc('Down')
    hyper.map(k.k, [mod.any]).to(k.up_arrow).desc('Up')
    hyper.map(k.l, [mod.any]).to(k.right_arrow).desc('Right')

    // Setup escape key mapping
    if (escapeKey !== hyperKey) {
        device.map(escapeKey).to(k.escape)
    }

    return hyper
}

// Configure each device with appropriate settings
function configureSofleKeyboard() {
    // Sofle has F16/F18 keys available from firmware
    setupDeviceSpecificKeys(devices.sofle, k.f16, k.escape, 'Sofle KB')

    // Sofle-specific: F18 for special functions
    const f18Layer = devices.sofle.ruleBaseBy(k.f18).desc('Sofle F18 Layer')
    f18Layer.map(k.spacebar, [mod.any]).to(k.delete_forward)
    f18Layer.map(k.enter).to(k.delete_or_backspace)

    // Number row mapping for left hand
    f18Layer.map(k.q, [mod.any]).to(k.n6).desc('6')
    f18Layer.map(k.w, [mod.any]).to(k.n7).desc('7')
    f18Layer.map(k.e, [mod.any]).to(k.n8).desc('8')
    f18Layer.map(k.r, [mod.any]).to(k.n9).desc('9')
    f18Layer.map(k.t, [mod.any]).to(k.n0).desc('0')
}

function configureAppleKeyboards() {
    // Both Apple keyboards use caps_lock as escape/hyper

    // Setup homerow mods for Apple keyboards
    function setupHomeRowMods(device, deviceName) {
        const hr = device.rule(`${deviceName} HomeRow Mods`)
        hr.setOnHold({ delayedActionMs: 138, thresholdMs: 160 })

        // caps_lock: tap for escape, hold for f16 (hyper)
        hr.map(k.caps_lock, [mod.any]).to(k.escape).onHold(k.f16)

        // Home row modifiers
        hr.map(k.a, [mod.any]).onHold(k.lshift)
        hr.map(k.s, [mod.any]).onHold(k.lctrl)
        hr.map(k.d, [mod.any]).onHold(k.lalt)
        hr.map(k.f, [mod.any]).onHold(k.lcmd)

        hr.map(k.j, [mod.any]).onHold(k.rcmd)
        hr.map(k.k, [mod.any]).onHold(k.ralt)
        hr.map(k.l, [mod.any]).onHold(k.rctrl)
        hr.map(k.semicolon, [mod.any]).onHold(k.rshift)
    }

    // Configure MacBook Air
    setupHomeRowMods(devices.macbookAir, 'MacBook Air')
    setupDeviceSpecificKeys(devices.macbookAir, k.f16, k.caps_lock, 'MacBook Air')

    // Configure Magic Keyboard
    setupHomeRowMods(devices.magicKeyboard, 'Magic Keyboard')
    setupDeviceSpecificKeys(devices.magicKeyboard, k.f16, k.caps_lock, 'Magic Keyboard')
}

function configureMechanicalKeyboard() {
    // Mechanical keyboard might have different layout preferences
    setupDeviceSpecificKeys(devices.mechanicalKb, k.f15, k.caps_lock, 'Mechanical KB')

    // Additional mechanical keyboard specific mappings
    const mech = devices.mechanicalKb
    mech.map(k.insert).to(k.f16)
    mech.map(k.print_screen).to(k.f17)
}

// Global mappings that apply to all devices without device conditions
// These apply when no specific device rules match
co.map(k.right_command).to(k.f18)

// Function key mappings for devices without dedicated media keys
co.map(k.f1).to(k.display_brightness_decrement)
co.map(k.f2).to(k.display_brightness_increment)
co.map(k.f7).to(k.rewind)
co.map(k.f8).to(k.play_or_pause)
co.map(k.f9).to(k.fastforward)
co.map(k.f10).to(k.mute)
co.map(k.f11).to(k.volume_decrement)
co.map(k.f12).to(k.volume_increment)

// Device-specific conditional mappings
// Only apply caps_lock mapping for devices that don't have homerow mods
const globalRule = co.rule('Global caps_lock for non-Apple keyboards')
	.deviceUnless(devices.macbookAir)
    .deviceUnless(devices.magicKeyboard)

globalRule.map(k.caps_lock).to(k.escape)

// Execute configurations
configureSofleKeyboard()
configureAppleKeyboards()
configureMechanicalKeyboard()

/**
 * Best Practices for Multi-Device Setup:
 *
 * 1. Always use device parameter in device-specific functions
 *    ✅ device.ruleBaseBy(key)
 *    ❌ co.ruleBaseBy(key)
 *
 * 2. Use descriptive device names and configurations
 *    - Helps with debugging
 *    - Makes rules easier to understand
 *
 * 3. Group related functionality into functions
 *    - Easier to maintain
 *    - Consistent across devices
 *
 * 4. Use conditional mappings wisely
 *    - deviceIf() for specific devices
 *    - deviceUnless() for exclusions
 *    - Global mappings for common functionality
 *
 * 5. Test each device separately
 *    - Ensure no conflicts
 *    - Verify expected behavior
 *
 * 6. Document device-specific quirks
 *    - Different timing requirements
 *    - Available keys (F16, F18, etc.)
 *    - Layout differences
 */

export default () => co
