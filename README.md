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



## More Complex Examples

For a more in-depth look at advanced configurations, you can check out the [raz.ts](./example/raz.tw) example file


## known limitations

due to hardware constraints known as **key rollover** or **ghosting**, some complex multi-key combinations may not work reliably on all keyboards.

for example, on my apple keyboards, pressing keys like `t + y` together, and then pressing `-` or `=` may exceed the keyboard’s rollover capability. when this happens, the keyboard hardware fails to register some of the keys, so karabiner-elements never receives those key events. this causes the configured key mappings to not trigger as expected.

key rollover limitations vary between different keyboard models, so please test your specific hardware when creating complex key combinations.


## api reference

### config

- `rule(description)` - create basic rule for simple mappings
- `rulebaseby(key, modifiers?)` - create base key rule
- `tojson()` - generate json karabiner configuration (object)
- `tostring()` - generate formatted karabiner configuration

### rule (basic rules)

- `map(key, modifiers?)` - create key mapping (chainable)
- `.desc(description)` - add description to rule

### rulebased (advanced rules)

- `mapto(modifier, modifiers[]?)` - Set Base Key modifiers (optional)
- `map(key, modifiers?)` - Create key mapping (chainable)
- `layer(key)` - Create layer
- `.desc(description)` - Add description to rule

### Mapping Methods (Chainable)

- `.to(command)` - Map to shell command
- `.to(key, modifiers?)` - Map to key combination
- `.toOsaOpen(app, url)` - Open URL with AppleScript
- `.desc(description)` - Add description to mapping
- `.separate()` - Create independent rule (use after mapping)

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
