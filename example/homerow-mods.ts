/**
 * HomeRow Modifiers Example
 *
 * This example demonstrates how to implement HomeRow Modifiers, allowing you to use
 * modifier keys (Shift, Ctrl, Alt, Cmd) without leaving the home row.
 *
 * Concept:
 * - Tap: Normal letter output
 * - Hold: Acts as modifier key
 * - caps_lock: Tap outputs Escape, Hold outputs F16 (can be used as Hyper Key)
 */

import { Config, Key as k, Mod as mod } from 'karabiner-ts-config'

const co = new Config()
const mdAny = [mod.any]

// Setup HomeRow Modifiers for Apple keyboards
function setHomeRowMods(device, delayedActionMs = 138, thresholdMs = 160, ruleName = 'HomeRow Modifiers') {

    const hr = device.rule(ruleName)
    hr.setOnHold({ delayedActionMs, thresholdMs })

    // caps_lock: Tap → Escape, Hold → F16 (Hyper Key)
    hr.map(k.caps_lock, mdAny).to(k.escape).onHold(k.f16)

    // Left hand modifiers (ASDF)
    hr.map(k.a, mdAny).onHold(k.lshift)   // A: Left Shift
    hr.map(k.s, mdAny).onHold(k.lctrl)    // S: Left Ctrl
    hr.map(k.d, mdAny).onHold(k.lalt)     // D: Left Alt
    hr.map(k.f, mdAny).onHold(k.lcmd)     // F: Left Cmd

    // Right hand modifiers (JKL;)
    hr.map(k.j, mdAny).onHold(k.rcmd)     // J: Right Cmd
    hr.map(k.k, mdAny).onHold(k.ralt)     // K: Right Alt
    hr.map(k.l, mdAny).onHold(k.rctrl)    // L: Right Ctrl
    hr.map(k.semicolon, mdAny).onHold(k.rshift)  // ;: Right Shift

    return hr
}

// Setup for different devices
const macbookAir = co.device({
    vendor_id: 1452,
    product_id: 641
})

const magicKeyboard = co.device({
    vendor_id: 1452,
    product_id: 569
})

// Apply to different devices
setHomeRowMods(macbookAir, 140, 170, 'HomeRow Mods (MacBook Air)')

setHomeRowMods(magicKeyboard, 135, 160, 'HomeRow Mods (Magic Keyboard)')

// Advanced: Combine HomeRow Modifiers with Hyper Key
function setHomeRowWithHyper(device) {
    // First setup HomeRow Modifiers
    setHomeRowMods(device)

    // Then use F16 as Hyper Key
    const hyper = device.ruleBaseBy(k.f16).desc('Hyper Key from caps_lock')
        .ifAlone(k.escape)  // Output Escape when F16 is pressed alone

    // Common application shortcuts
    hyper.map(k.f).to(`open -a 'Finder'`).desc('Open Finder')
    hyper.map(k.t).to(`open -a 'Terminal'`).desc('Open Terminal')
    hyper.map(k.b).to(`open -a 'Firefox'`).desc('Open Firefox')
    hyper.map(k.c).to(`open -a 'Visual Studio Code'`).desc('Open VS Code')

    // Vim-style arrow keys
    hyper.map(k.h, [mod.any]).to(k.left_arrow).desc('Left')
    hyper.map(k.j, [mod.any]).to(k.down_arrow).desc('Down')
    hyper.map(k.k, [mod.any]).to(k.up_arrow).desc('Up')
    hyper.map(k.l, [mod.any]).to(k.right_arrow).desc('Right')

    return hyper
}

// Practical usage example
const externalKeyboard = co.device({
    vendor_id: 1234,
    product_id: 5678
})

setHomeRowWithHyper(externalKeyboard)

/**
 * Usage Guide:
 *
 * 1. After installation, your ASDF and JKL; keys have dual functionality:
 *    - Tap: Normal letter output
 *    - Hold: Modifier key function
 *
 * 2. caps_lock becomes a powerful Hyper Key:
 *    - Tap: Escape
 *    - Hold + other keys: Various shortcut functions
 *
 * 3. Learning curve:
 *    - Week 1: May have accidental triggers, need adaptation
 *    - Week 2: Start feeling efficiency improvements
 *    - Week 3: Can't go back to traditional keyboard layout
 *
 * 4. Tuning suggestions:
 *    - Adjust delayedActionMs and thresholdMs based on typing habits
 *    - Different devices can have different parameters
 *    - Recommend starting with longer thresholds, gradually shortening
 */

export default () => co
