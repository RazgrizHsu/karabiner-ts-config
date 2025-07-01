/**
 * ❌ Common Mistakes Examples - DO NOT COPY!
 *
 * This file demonstrates common mistakes when using karabiner-ts-config.
 * These errors can cause duplicate key detection failures, configuration conflicts, or other issues.
 *
 * Each mistake is marked with ❌ and contrasted with ✅ correct approaches.
 */

import { Config, Key as k, Mod as mod } from 'karabiner-ts-config'

const co = new Config()

// ❌ Mistake 1: Device-specific function using global config
function wrongSetHyperKey(device, triggerKey, desc) {
    // Problem: Using global 'co' instead of passed 'device' parameter
    // This causes same keys on different devices to be incorrectly flagged as duplicates
    const base = co.ruleBaseBy(triggerKey).desc(desc)
    base.map(k.f).to(`open -a 'Finder'`)
    return base
}

// ✅ Correct 1: Device-specific function using device config
function correctSetHyperKey(device, triggerKey, desc) {
    // Correct: Use the passed device parameter
    const base = device.ruleBaseBy(triggerKey).desc(desc)
    base.map(k.f).to(`open -a 'Finder'`)
    return base
}

// ❌ Mistake 2: Same key used by multiple functions
function wrongKeyConflict() {
    const device = co.device({ vendor_id: 1452 })

    // Problem: caps_lock used by two different functions simultaneously
    const homeRow = device.rule('HomeRow')
    homeRow.map(k.caps_lock).to(k.escape).onHold(k.f16)  // HomeRow function

    const hyperKey = device.ruleBaseBy(k.caps_lock)       // Hyper Key function - Conflict!
    hyperKey.map(k.f).to(`open -a 'Finder'`)
}

// ✅ Correct 2: Use chaining logic to avoid conflicts
function correctKeyChaining() {
    const device = co.device({ vendor_id: 1452 })

    // Correct: caps_lock tap outputs escape, hold outputs f16
    const homeRow = device.rule('HomeRow')
    homeRow.map(k.caps_lock).to(k.escape).onHold(k.f16)

    // Then use f16 as Hyper Key (not caps_lock)
    const hyperKey = device.ruleBaseBy(k.f16).desc('Hyper Key')
    hyperKey.map(k.f).to(`open -a 'Finder'`)
}

// ❌ Mistake 3: Duplicate mappings of same key within RuleBased
function wrongDuplicateInRule() {
    const base = co.ruleBaseBy(k.f16)

    // Problem: Duplicate mapping of k.f within same RuleBased
    base.map(k.f).to(`open -a 'Finder'`)
    base.map(k.f).to(`open -a 'Firefox'`)  // Duplicate! Will cause error
}

// ✅ Correct 3: Use different keys or Layer separation
function correctNoDuplicateInRule() {
    const base = co.ruleBaseBy(k.f16)

    // Correct: Use different keys
    base.map(k.f).to(`open -a 'Finder'`)
    base.map(k.b).to(`open -a 'Firefox'`)

    // Or use Layer to organize related functions
    const appLayer = base.layer(k.o).desc('Open Apps')
    appLayer.map(k.f).to(`open -a 'Finder'`)
    appLayer.map(k.b).to(`open -a 'Firefox'`)
}

// ❌ Mistake 4: Confusing device condition logic
function wrongDeviceConditions() {
    const keyboard1 = { vendor_id: 1452, product_id: 641 }
    const keyboard2 = { vendor_id: 1452, product_id: 569 }

    // Problem: Unclear logic, easily causes confusion
    co.map(k.caps_lock).to(k.escape).deviceIf(keyboard1)
    co.map(k.caps_lock).to(k.f16).deviceUnless(keyboard1)  // This applies to keyboard2 and all other devices
    co.map(k.caps_lock).to(k.escape).deviceIf(keyboard2)   // Conflicts with above!
}

// ✅ Correct 4: Clear device separation logic
function correctDeviceConditions() {
    const keyboard1 = { vendor_id: 1452, product_id: 641 }
    const keyboard2 = { vendor_id: 1452, product_id: 569 }

    // Correct: Explicit configuration for each device
    const kb1 = co.device(keyboard1)
    kb1.map(k.caps_lock).to(k.escape)

    const kb2 = co.device(keyboard2)
    kb2.map(k.caps_lock).to(k.f16)

    // Or use explicit conditional logic
    co.map(k.caps_lock).to(k.escape).deviceIf(keyboard1)
    co.map(k.caps_lock).to(k.f16).deviceIf(keyboard2)  // Explicitly specify device
}

// ❌ Mistake 5: Mapping trigger key within its own layer
function wrongLayerTriggerMapping() {
    const base = co.ruleBaseBy(k.f16)
    const layer = base.layer(k.a).desc('A Layer')

    // Problem: Mapping k.a within layer triggered by k.a
    // This is physically impossible (key is used to trigger layer, cannot be mapped simultaneously)
    layer.map(k.a).to(k.b)  // Error! Will cause error
}

// ✅ Correct 5: Don't map trigger key within layer
function correctLayerMapping() {
    const base = co.ruleBaseBy(k.f16)
    const layer = base.layer(k.a).desc('A Layer')

    // Correct: Map other keys, not the layer trigger key
    layer.map(k.s).to(k.left_arrow)
    layer.map(k.d).to(k.down_arrow)
    layer.map(k.f).to(k.up_arrow)
    layer.map(k.g).to(k.right_arrow)
}

// ❌ Mistake 6: Ignoring modifier key conflicts
function wrongModifierConflicts() {
    const base = co.ruleBaseBy(k.f16)

    // Problem: Not considering modifier combinations, may cause unexpected behavior
    base.map(k.j).to(k.down_arrow)                    // j → down
    base.map(k.j, [mod.any]).to(k.page_down)         // j+any modifier → page_down

    // This causes logical conflict: when pressing j, both rules may match
}

// ✅ Correct 6: Explicit modifier combination logic
function correctModifierLogic() {
    const base = co.ruleBaseBy(k.f16)

    // Correct: Clearly distinguish cases with/without modifiers
    base.map(k.j).to(k.down_arrow)                    // j alone → down
    base.map(k.j, [k.lshift]).to(k.down_arrow, [k.lshift])  // j+shift → down+shift
    base.map(k.j, [k.lctrl]).to(k.page_down)         // j+ctrl → page_down

    // Or use more precise modifier combinations
    base.map(k.j, [k.lshift, k.lctrl]).to(k.end)     // j+shift+ctrl → end
}

// ❌ Mistake 7: Attempting to use device conditions on SimpleKeyMap
function wrongSimpleKeyMapDevice() {
    const keyboard1 = { vendor_id: 1452, product_id: 641 }
    
    // Problem: SimpleKeyMap doesn't support device conditions
    // co.map(k.caps_lock).to(k.escape).deviceIf(keyboard1)  // This will fail!
}

// ✅ Correct 7: Use Rule or Device builder for device-specific mappings
function correctSimpleKeyMapDevice() {
    const keyboard1 = { vendor_id: 1452, product_id: 641 }
    
    // Option 1: Use device builder
    const kb1 = co.device(keyboard1)
    kb1.map(k.caps_lock).to(k.escape)
    
    // Option 2: Use Rule with device condition
    const rule = co.rule('Device-specific caps_lock')
    rule.map(k.caps_lock).to(k.escape).deviceIf(keyboard1)
}

/**
 * 💡 Best Practices Summary:
 *
 * 1. Device-specific functions must use the passed device parameter, not global config
 * 2. Avoid same key being used by multiple functions, use chaining logic
 * 3. Don't duplicate same key+modifier combinations within same rule
 * 4. Use clear device separation logic, avoid condition confusion
 * 5. Don't map layer trigger key within the layer itself
 * 6. Handle modifier combinations carefully, avoid logical conflicts
 * 7. SimpleKeyMap doesn't support device conditions - use Rule or Device builder instead
 * 8. Only create functions when you need to reuse configuration across multiple devices
 * 9. Use clear function names and comments
 * 10. Test configurations regularly to ensure no unexpected behavior
 */

// This file should not be executed, for reference only
// export default () => co
