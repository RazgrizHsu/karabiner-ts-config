<p align="center">
<img src="https://raw.githubusercontent.com/RazgrizHsu/karabiner-ts-config/main/doc/intro.png" alt="From-To"/>
</p>

<p align="center">
<a href="https://buymeacoffee.com/razgrizhsu" target="_blank"><img src="https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support-yellow.svg?style=flat-square&logo=buy-me-a-coffee" alt="Buy Me A Coffee"/></a>
</p>

# karabiner-ts-config

A TypeScript-based tool for building Karabiner Elements configuration files with type-safe Fluent API design

## Features

- **Builder Pattern**: Fluent API design for creating complex key mappings
- **Type Safety**: Complete TypeScript support with type definitions
- **Duplicate Key Detection**: Automatic validation prevents conflicting key mappings
- **Simple Mappings**: Easy one-to-one key remapping
- **Combination Keys**: Support for modifier + key combinations
- **Base Key Support**: Advanced Base Key functionality with layer system
- **Variable System**: Uses Karabiner's variable system for complex key combinations
- **Shell Commands**: Direct integration with shell commands and AppleScript

## Installation & Usage

```bash
# Install globally or use npx without installation
npm install -g karabiner-ts-config

# You can use my configuration as a base for your adjustments.
curl -o my-config.ts https://raw.githubusercontent.com/razgrizhsu/karabiner-ts-config/main/example/raz.ts

# Use the command - outputs directly to Karabiner config directory
karabiner-ts-config my-config.ts

# Or specify custom output path
karabiner-ts-config my-config.ts ~/karabiner-test.json

# Or use without installation
npx karabiner-ts-config my-config.ts
```

**Output Behavior:**
- **Default Path**: If no output path is specified, the configuration is written directly to `~/.config/karabiner/karabiner.json`
- **File Overwrite Protection**: If the target file already exists, you'll be prompted to confirm before overwriting
- **Automatic Directory Creation**: Output directories are created automatically if they don't exist

## Getting Started

### Creating Your First Configuration

Create a TypeScript file (e.g., `my-config.ts`):

```typescript
import { Config, Key as k, Mod as mod } from 'karabiner-ts-config'

const co = new Config()
co.global.show_in_menu_bar = true

// Export configuration function
// The CLI automatically handles Config objects, JSON objects, and JSON strings.
export default () => co
```

This creates an empty but valid Karabiner configuration. Now let's add some mappings!

### Basic Key Mappings

#### Map one key to another:
```typescript

// Map letter B to letter Z
const rule1 = co.rule('Map B to Z')
rule1.map(k.b).to(k.z).desc('B becomes Z')
```


#### Map modifier keys to function keys:

```typescript
// Map Right Command to F18 (useful for app-specific shortcuts)
const rule2 = co.rule('Right CMD to F18')
rule2.map(k.right_command).to(k.f18).desc('Right CMD becomes F18')

// Map F18 to open Terminal
const rule3 = co.rule('F18 opens Terminal')
rule3.map(k.f18).to(`open -a 'Terminal'`).desc('F18 to Terminal')
```


### With Modifier Keys

Create keyboard shortcuts using modifier keys:

```typescript
// Map CMD+Shift+G to open Google.com
const rule4 = co.rule('Open Google shortcut')
rule4.map(k.g, [mod.left_command, mod.left_shift])
     .to(`open 'https://google.com'`).desc('CMD+Shift+G opens Google')

// Map CMD+Shift+T to open new terminal window
const rule5 = co.rule('Terminal shortcut')
rule5.map(k.t, [mod.left_command, mod.left_shift])
     .to(`osascript -e 'tell application "Terminal" to do script ""'`).desc('CMD+Shift+T new terminal')
```


### Key Groups

Common navigation improvements for compact keyboards:

```typescript
// navigation with Fn key
const fnNav = co.rule('Fn Navigation Enhancement')

// Fn + Arrow keys for page navigation
fnNav.map(k.up_arrow, [mod.fn]).to(k.page_up).desc('Fn+Up to Page Up')
fnNav.map(k.down_arrow, [mod.fn]).to(k.page_down).desc('Fn+Down to Page Down')
fnNav.map(k.left_arrow, [mod.fn]).to(k.home).desc('Fn+Left to Home')
fnNav.map(k.right_arrow, [mod.fn]).to(k.end).desc('Fn+Right to End')
```

### Home Row Modifiers

Transform your home row keys into modifier keys when held down, while maintaining their normal function when typed. This technique is popular among users who want to minimize finger movement for common modifiers:

```typescript
// Create a rule for home row modifiers
const homeRow = co.rule('Home Row Modifiers')

// Set global hold parameters for this rule
// Each person has different typing speed, you may need to adjust these parameters
// Use karabiner-eventviewer to see what delay works best for you
homeRow.setOnHold({ delayedActionMs: 120, thresholdMs: 160 })

// Map home row keys to modifiers when held
homeRow.map(k.a).onHold(k.lctrl).desc('A -> Left Control')
homeRow.map(k.s).onHold(k.lalt).desc('S -> Left Alt')
homeRow.map(k.d).onHold(k.lcmd).desc('D -> Left Command')
homeRow.map(k.f).onHold(k.lshift).desc('F -> Left Shift')

// You can also set individual parameters for specific keys
// homeRow.map(k.j).onHold(k.rshift).setArgs({thresholdMs: 125}).desc('J -> Right Shift')
```

**Parameters:**
- `delayedActionMs`: How long to wait before starting to repeat the held key (default: 120ms)
- `thresholdMs`: Minimum time the key must be held to trigger the modifier (default: 160ms)

**Usage Tips:**
- Use Karabiner-EventViewer to fine-tune timing parameters for your typing speed
- Start with conservative timing and adjust based on your comfort
- Consider your most frequently used modifiers when choosing which keys to map

For more Hold Down examples, see [homerow-mods.ts](./example/homerow-mods.ts).

## Device Configuration

Configure specific devices to apply different settings based on keyboard or mouse hardware:

```typescript
// Create device instances
const apple = co.device({ vendor_id: 1452, product_id: 641 })
const sofle = co.device({ product_id: 24926, vendor_id: 7504 })

// Device-specific mappings
apple.map(k.caps_lock).to(k.f16)     // Only on Apple keyboards
sofle.map(k.f19).to(k.escape)        // Only on Sofle keyboards

// Device-specific rules
const appleRule = apple.rule('Apple features')
appleRule.map(k.f1).to(k.volume_decrement)

// Add device conditions to existing rules
const rule = co.rule('Conditional rule')
rule.deviceIf(apple)                 // Only when Apple keyboard is active
rule.deviceUnless(sofle)             // Except when Sofle keyboard is active
rule.map(k.a).to(k.b)
```

**Finding Device IDs:**
1. Open Karabiner-Elements EventViewer
2. Connect your device and press any key
3. Note the vendor_id and product_id values

For comprehensive Device Configuration examples, see [multi-device.ts](./example/multi-device.ts).

## Simple Key Mappings with Config.map()

For basic one-to-one key remapping without complex logic, use `config.map()`. This creates simple modifications that are processed faster than complex rules:

```typescript
// Simple key replacements (uses Karabiner's simple_modifications)
co.map(k.caps_lock).to(k.escape)
co.map(k.right_command).to(k.f18)

// With modifier keys
co.map(k.f1, [mod.fn]).to(k.f1) // Override Fn+F1 behavior
```

**When to use Config.map() vs Rule.map():**
- **Config.map()**: Basic key replacement, faster processing, limited functionality
- **Rule.map()**: Complex mappings, shell commands, conditional logic, layers

**Limitations of Config.map():**
- Cannot execute shell commands
- Cannot create layers or complex conditions
- Cannot use device conditions (deviceIf, deviceUnless, etc.)
- Only supports direct key-to-key mapping

**For device-specific simple mappings, use:**
```typescript
// Option 1: Device builder
const myKeyboard = co.device({ vendor_id: 1452 })
myKeyboard.map(k.caps_lock).to(k.escape)

// Option 2: Rule with device condition
const rule = co.rule('Device-specific mapping')
rule.map(k.caps_lock).to(k.escape).deviceIf(myKeyboard)
```


# Base Key System

The Base Key System introduces a powerful modifier key that streamlines your workflow by consolidating multiple modifiers into one. This prevents conflicts with existing shortcuts and unlocks a vast new space for custom key combinations.

## What is a Base Key?

A **Base Key** is a special modifier key, often mapped to `caps_lock`, that acts as a unique foundation for your custom shortcuts. When held down, it activates a special mode where other keys can trigger custom actions, applications, or even entire layers of new mappings.

## Setting Up Your Base Key

The most common approach is to use `caps_lock` as your Base Key. Here are a few ways to configure it:

```typescript
// Basic: Create a Base Key rule using caps_lock
const hyp = co.ruleBaseBy(k.caps_lock).desc('Base Key')

// Optional: Map the Base Key to a specific modifier combination, often called a "Hyper Key"
const hyp2 = co.ruleBaseBy(k.caps_lock)
    .desc('Base Key')
    // This maps it to Ctrl+Option+Cmd+Shift
    .mapTo(mod.left_shift, [mod.left_control, mod.left_option, mod.left_command])

// Alternative: Redirect the Base Key to a virtual key like F18
const hyp3 = co.ruleBaseBy(k.caps_lock)
    .desc('Base Key')
    .mapTo(k.f18)

// Configure fallback behavior for when the Base Key is pressed alone
const hyp4 = co.ruleBaseBy(k.caps_lock)
    .desc('Base Key with custom alone behavior')
    .mapTo(mod.left_shift, [mod.left_control, mod.left_option, mod.left_command])
    .ifAlone(k.caps_lock)  // When pressed alone, output caps_lock instead of escape
```

### Setting Fallback Behavior with `.ifAlone()`

By default, when a Base Key is pressed and released without any other keys, it outputs the `escape` key. You can customize this behavior using the `.ifAlone()` method:

```typescript
// Example 1: When pressed alone, output the original key (caps_lock)
const hyp = co.ruleBaseBy(k.caps_lock)
    .desc('Base Key')
    .mapTo(mod.left_shift, [mod.left_control, mod.left_option, mod.left_command])
    .ifAlone(k.caps_lock)

// Example 2: When pressed alone, output a different key (like F18)
const hyp2 = co.ruleBaseBy(k.caps_lock)
    .desc('Base Key')
    .mapTo(mod.left_shift, [mod.left_control, mod.left_option, mod.left_command])
    .ifAlone(k.f18)

// Example 3: Without ifAlone(), pressing the key alone will output escape (default)
const hyp3 = co.ruleBaseBy(k.caps_lock)
    .desc('Base Key')
    .mapTo(mod.left_shift, [mod.left_control, mod.left_option, mod.left_command])
    // No ifAlone() - defaults to escape when pressed alone
```

## Using the Base Key: Direct Mappings

Once your Base Key is set up, you can create simple, direct shortcuts. These are ideal for frequently used commands.

```typescript
// Base Key + T opens Terminal
hyp.map(k.t).to(`open -a 'Terminal'`).desc('Terminal').separate()

// Base Key + B opens your Browser
hyp.map(k.b).to(`open -a 'Safari'`).desc('Browser').separate()

// Base Key + F opens Finder
hyp.map(k.f).to(`open -a 'Finder'`).desc('Finder').separate()

// Base Key + Spacebar can trigger another shortcut
hyp.map(k.spacebar).to(k.f1, [mod.left_command]).desc('Trigger CMD+F1').separate()
```

Sometimes, you'll need to use osascript to open applications or specific URLs, especially if the standard open -a command isn't sufficient.


```typescript
// For some cases, you will need to open using osascript
hyp.map(k.a).to(`osascript -e 'tell application "APPLICATION_NAME" to open location "URL_HERE"'`)
// You can simplify this with toOsaOpen
hyp.map(k.a).toOsaOpen( 'APPLICATION_NAME', 'URL_HERE' )

```

---

## Layer System

For more complex workflows, the Layer System allows you to group related commands under a single trigger key, creating a multi-step key combination.

### What are Layers?

**Layers** create a temporary mode that is activated by holding your **Base Key** plus a specific "trigger key". While this layer is active, subsequent key presses will execute actions defined within that layer. This is perfect for organizing groups of related functions, like window management or application launching.

### Creating a Basic Layer

Here's how to create a simple layer for launching applications.

**To use:** Hold `Base Key + O`, then press `M` to open Obsidian or `V` to open VSCode.

```typescript
// Create the layer: Base Key + O is the trigger for "Open Applications"
const sO = hyp.layer(k.o).desc('Open Applications').separate()

// Define the mappings within this layer:
sO.map(k.m).to(`open -a 'Obsidian'`).desc('Open Obsidian')
sO.map(k.v).to(`open -a 'Visual Studio Code'`).desc('Open VSCode')

// Alternative: Using toOsaOpen method
sO.map(k.s).toOsaOpen('Slack').desc('Open Slack')
```

### Creating a Nested Layer

Layers can also be nested inside other layers, allowing for even more sophisticated and organized command structures.

In this example, we'll create a primary "Window Management" layer and then a nested "Resize" layer within it.

```typescript
// 1. Create the parent layer for "Window Management" (Trigger: Base Key + W)
const sW = hyp.layer(k.w).desc('Window Management').separate()

// Define top-level commands in the parent layer
// Usage: Base Key + W, then O/J/K
sW.map(k.o).to(`open -g 'rectangle://execute-action?name=next-display'`).desc('Next Display')
sW.map(k.j).to(`open -g 'rectangle://execute-action?name=smaller'`).desc('Small')
sW.map(k.k).to(`open -g 'rectangle://execute-action?name=larger'`).desc('Large')

// 2. Create the nested layer for "Window Resize" (Trigger: Base Key + W + R)
const sWR = sW.layer(k.r).desc('Window resize').separate()

// Define commands within the nested layer
// Usage: Base Key + W + R, then H/L/J/K
sWR.map(k.h).to(`open -g 'rectangle://execute-action?name=smaller-width'`).desc('Smaller Width')
sWR.map(k.l).to(`open -g 'rectangle://execute-action?name=larger-width'`).desc('Larger Width')
sWR.map(k.j).to(`open -g 'rectangle://execute-action?name=smaller-height'`).desc('Smaller Height')
sWR.map(k.k).to(`open -g 'rectangle://execute-action?name=larger-height'`).desc('Larger Height')
```

### When to Use Direct Mappings vs. Layers

- **Direct Mapping**: Best for high-frequency, single-purpose shortcuts that you want to access instantly.
- **Layers**: Ideal for grouping multiple related commands under a single, memorable trigger key, keeping your root-level shortcuts clean and organized.



## Examples Gallery

We provide comprehensive examples to help you learn and implement different configuration patterns:

### Basic Examples
- **[simple.ts](./example/simple.ts)** - Basic key mappings and simple rules
- **[homerow-mods.ts](./example/homerow-mods.ts)** - HomeRow Modifiers implementation with timing tuning

### Device-Specific Examples
- **[multi-device.ts](./example/multi-device.ts)** - Multi-device configuration best practices

### Advanced Examples
- **[layer-system.ts](./example/layer-system.ts)** - Advanced layer system with nested layers
- **[kb-apple](./example/kb-apple.ts)** - Advanced layer system with nested layers
- **[raz.ts](./example/raz.ts)** - Complete real-world configuration with multiple keyboards and complex setups

### Learning Resources
- **[wrong.ts](./example/wrong.ts)** - Common mistakes and correct alternatives ❌✅
- **[issue.ts](./example/issue.ts)** - Hardware limitation examples (key rollover)


## Common Mistakes to Avoid

Based on common issues encountered by users, here are important mistakes to avoid:

### 1. Device-Specific Function Errors
❌ **Wrong**: Using global config in device-specific functions
```typescript
function setupHyperKey(device, triggerKey) {
    const base = co.ruleBaseBy(triggerKey)  // Wrong: using global 'co'
}
```

✅ **Correct**: Use the device parameter
```typescript
function setupHyperKey(device, triggerKey) {
    const base = device.ruleBaseBy(triggerKey)  // Correct: using device
}
```

### 2. Key Conflicts
❌ **Wrong**: Same key used by multiple functions
```typescript
device.rule('HomeRow').map(k.caps_lock).to(k.escape).onHold(k.f16)
device.ruleBaseBy(k.caps_lock)  // Conflict!
```

✅ **Correct**: Use chaining logic
```typescript
device.rule('HomeRow').map(k.caps_lock).to(k.escape).onHold(k.f16)
device.ruleBaseBy(k.f16)  // Use f16 as hyper key
```

### 3. Layer Trigger Mapping
❌ **Wrong**: Mapping trigger key within its own layer
```typescript
const layer = base.layer(k.a)
layer.map(k.a).to(k.b)  // Error: can't map trigger key
```

✅ **Correct**: Map other keys within layer
```typescript
const layer = base.layer(k.a)
layer.map(k.s).to(k.left_arrow)  // Map different keys
```

### 4. Device Condition Logic
❌ **Wrong**: Confusing device conditions
```typescript
// ❌ Wrong: SimpleKeyMap does not support device conditions
// co.map(k.caps_lock).to(k.escape).deviceIf(keyboard1)  // Error!

// ✅ Correct: Use Rule for device conditions
const rule1 = co.rule('KB1 caps_lock')
rule1.map(k.caps_lock).to(k.escape).deviceIf(keyboard1)

const rule2 = co.rule('KB2 caps_lock')
rule2.map(k.caps_lock).to(k.f16).deviceIf(keyboard2)
```

✅ **Correct**: Explicit device separation
```typescript
const kb1 = co.device(keyboard1)
kb1.map(k.caps_lock).to(k.escape)

const kb2 = co.device(keyboard2)
kb2.map(k.caps_lock).to(k.f16)
```

For more comprehensive examples of mistakes and corrections, see [wrong.ts](./example/wrong.ts).

## Best Practices

### Multi-Device Configuration
1. **Use device parameters in functions**: Always use the passed device parameter, not global config
2. **Clear device separation**: Use explicit device builders for clarity
3. **Document device differences**: Note timing, available keys, and layout differences
4. **Function usage**: Only create functions when you need to reuse the same configuration across multiple devices

### Layer Organization
1. **Logical grouping**: Group related functions together (apps, window management, system)
2. **Mnemonic triggers**: Use memorable trigger keys (o for open, w for window, s for system)
3. **Consistent patterns**: Use spatial relationships (hjkl for navigation)
4. **Don't nest too deeply**: Maximum 2-3 layer levels for usability

### Performance Optimization
1. **Use simple mappings when possible**: `co.map()` is faster than complex rules
2. **Avoid excessive conditions**: Too many device conditions can slow processing
3. **Test regularly**: Verify no unexpected conflicts or behavior

### Debugging and Testing
1. **Use Karabiner EventViewer**: Essential for timing adjustments and debugging
2. **Test incrementally**: Add configurations gradually and test each addition
3. **Document your logic**: Clear descriptions help with maintenance

## Troubleshooting

### Duplicate Key Detection Errors
The tool includes automatic duplicate key detection. Common causes:

1. **Same key mapped twice in same rule**
   - Solution: Use different keys or organize with layers

2. **Device function using global config**
   - Solution: Use device parameter in functions

3. **Layer trigger key mapped within layer**
   - Solution: Don't map the trigger key inside its own layer

### Hold Down Timing Issues
If HomeRow Modifiers trigger accidentally:

1. **Increase thresholdMs**: Start with 180ms, adjust down
2. **Use EventViewer**: Monitor actual hold times
3. **Per-key adjustment**: Some keys may need different timing

### Device-Specific Rules Not Working
1. **Check device IDs**: Use EventViewer to verify vendor_id/product_id
2. **Test device conditions**: Ensure deviceIf/deviceUnless logic is correct
3. **Verify device connection**: Rules only apply when device is connected

## Known Limitations

due to hardware constraints known as **key rollover** or **ghosting**, some complex multi-key combinations may not work reliably on all keyboards.

for example, on my apple keyboards, pressing keys like `t + y` together, and then pressing `-` or `=` may exceed the keyboard’s rollover capability. when this happens, the keyboard hardware fails to register some of the keys, so karabiner-elements never receives those key events. this causes the configured key mappings to not trigger as expected.

key rollover limitations vary between different keyboard models, so please test your specific hardware when creating complex key combinations.


## api reference

### config

- `rule(description)` - create basic rule for simple mappings
- `ruleBaseBy(key, modifiers?)` - create base key rule
- `device(identifiers, ignore?)` - create device builder for device-specific rules
- `map(key, modifiers?)` - create simple key mapping
- `toJson()` - generate json karabiner configuration (object)
- `toString()` - generate formatted karabiner configuration

### rule (basic rules)

- `map(key, modifiers?)` - create key mapping (chainable)
- `setOnHold(args)` - set global hold parameters for rule
- `deviceIf(device)` - add device condition (device_if)
- `deviceUnless(device)` - add device condition (device_unless)
- `deviceExistsIf(device)` - add device condition (device_exists_if)
- `deviceExistsUnless(device)` - add device condition (device_exists_unless)
- `.desc(description)` - add description to rule

### rulebased (advanced rules)

- `mapTo(modifier, modifiers[]?)` - Set Base Key modifiers (optional)
- `ifAlone(key)` - Set fallback key when Base Key is pressed alone (optional, defaults to escape)
- `map(key, modifiers?)` - Create key mapping (chainable)
- `layer(key)` - Create layer
- `.desc(description)` - Add description to rule

### Mapping Methods (Chainable)

- `.to(command)` - Map to shell command
- `.to(key, modifiers?)` - Map to key combination
- `.onHold(key, modifiers?)` - Map key when held down
- `.setArgs(args)` - Set hold parameters for individual mapping
- `.toOsaOpen(app, url)` - Open URL with AppleScript
- `.desc(description)` - Add description to mapping
- `.separate()` - Create independent rule (use after mapping)

### DeviceBuilder

- `rule(description)` - Create device-specific rule
- `ruleBaseBy(key, modifiers?)` - Create device-specific base key rule
- `map(key, modifiers?)` - Create device-specific simple mapping
- `.desc(description)` - Add description to device

### Layer

- `map(key, modifiers?)` - Create key mapping within layer
- `.desc(description)` - Add description to layer
- `.separate()` - Create independent rule
- All mapping methods available (`.to()`, `.toOsaOpen()`, etc.)


## Author

**RazgrizHsu** - [dev@raz.tw](mailto:dev@raz.tw)

## License

MIT License

## Project Links

- GitHub: [https://github.com/RazgrizHsu/karabiner-ts-config](https://github.com/RazgrizHsu/karabiner-ts-config)
- NPM: [https://www.npmjs.com/package/karabiner-ts-config](https://www.npmjs.com/package/karabiner-ts-config)
