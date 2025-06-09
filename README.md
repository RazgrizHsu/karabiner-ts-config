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

## Basic Key Mappings

### Simple Key-to-Key Mapping

Map one key to another:

```typescript
// Map letter B to letter Z
const rule1 = co.rule('Map B to Z')
rule1.map(k.b).to(k.z).desc('B becomes Z')
```

### Modifier Key Mapping

Map modifier keys to function keys:

```typescript
// Map Right Command to F18 (useful for app-specific shortcuts)
const rule2 = co.rule('Right CMD to F18')
rule2.map(k.right_command).to(k.f18).desc('Right CMD becomes F18')
```

### Function Key to Command

Map function keys to shell commands:

```typescript
// Map F18 to open Terminal
const rule3 = co.rule('F18 opens Terminal')
rule3.map(k.f18).to(`open -a 'Terminal'`).desc('F18 to Terminal')
```

## Combination Keys

### Basic Modifier Combinations

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

### System Key Combinations

Map to system functions:

```typescript
// Map CMD+Option+D to show/hide dock
const rule6 = co.rule('Toggle Dock')
rule6.map(k.d, [mod.left_command, mod.left_option])
     .to(k.d, [mod.left_command, mod.left_option]).desc('CMD+OPT+D toggle dock')
```

## Function Key Groups

### Fn + Arrow Keys Navigation

Common navigation improvements for compact keyboards:

```typescript
// Enhanced navigation with Fn key
const fnNav = co.rule('Fn Navigation Enhancement')

// Fn + Arrow keys for page navigation
fnNav.map(k.up_arrow, [mod.fn]).to(k.page_up).desc('Fn+Up to Page Up')
fnNav.map(k.down_arrow, [mod.fn]).to(k.page_down).desc('Fn+Down to Page Down')
fnNav.map(k.left_arrow, [mod.fn]).to(k.home).desc('Fn+Left to Home')
fnNav.map(k.right_arrow, [mod.fn]).to(k.end).desc('Fn+Right to End')

// Fn + HJKL for arrow keys (Vim-style)
fnNav.map(k.h, [mod.fn]).to(k.left_arrow).desc('Fn+H to Left')
fnNav.map(k.j, [mod.fn]).to(k.down_arrow).desc('Fn+J to Down')
fnNav.map(k.k, [mod.fn]).to(k.up_arrow).desc('Fn+K to Up')
fnNav.map(k.l, [mod.fn]).to(k.right_arrow).desc('Fn+L to Right')
```

## Base Key System

### What is a Base Key?

A Base Key is a special modifier key that combines multiple modifiers (usually Ctrl+Option+Cmd+Shift) into a single key press. This creates a unique modifier that won't conflict with existing shortcuts and gives you access to many new key combinations.

### Setting Up Base Key

The most common approach is to use `caps_lock` as your Base Key:

```typescript
// Basic: Create a Base Key rule using caps_lock
const hyp = co.ruleBaseBy(k.caps_lock).desc('Base Key')

// Advanced: Map Base Key to specific modifier combination
const hyp2 = co.ruleBaseBy(k.caps_lock)
    .desc('Base Key')
    .mapTo(mod.left_shift, [mod.left_control, mod.left_option, mod.left_command])

// Or redirect to another key
const hyp3 = co.ruleBaseBy(k.caps_lock)
    .desc('Base Key')
    .mapTo(k.f18)
```

### Direct Base Key Mappings

Once you have a Base Key set up, you can create direct mappings:

```typescript
// Base Key + T opens Terminal
hyp.map(k.t).to(`open -a 'Terminal'`).desc('Terminal').separate()

// Base Key + B opens Browser
hyp.map(k.b).to(`open -a 'Safari'`).desc('Browser').separate()

// Base Key + F opens Finder
hyp.map(k.f).to(`open -a 'Finder'`).desc('Finder').separate()

// Base Key + Space triggers Raycast
hyp.map(k.spacebar).to(k.spacebar, [mod.left_command]).desc('Raycast').separate()
```

### When to Use Direct Mapping vs Layers

- **Direct Mapping**: Use for frequently accessed, single-purpose shortcuts
- **Layers**: Use when you need multiple related commands under one key

## Layer System

### What are Layers?

Layers allow you to create multi-step key combinations. Hold the Base Key + a trigger key to activate a "layer" where subsequent key presses perform different actions.

### Basic Layer

Create a layer for application launching:

```typescript
// Create layer: Base Key + O for "Open applications"
const sO = hyp.layer(k.o).desc('Open Applications').separate()

// Within this layer:
sO.map(k.m).to(`open -a 'Obsidian'`).desc('Open Obsidian')
sO.map(k.v).to(`open -a 'Visual Studio Code'`).desc('Open VSCode')
sO.map(k.n).to(`open -a 'Notion'`).desc('Open Notion')
```

Usage: `Base Key + O, then M` opens Obsidian, `Base Key + O, then V` opens VSCode.

### Layer System

Layers allow you to create multi-step key combinations:

```typescript
// Create layer for window management
const sW = hyp.layer(k.w).desc('Window Management').separate()

// Raycast is awesome app, install it
sW.map(k.h).toOsaOpen('Raycast', 'raycast://extensions/raycast/window-management/left-half').desc('Left Half')
sW.map(k.l).toOsaOpen('Raycast', 'raycast://extensions/raycast/window-management/right-half').desc('Right Half')
sW.map(k.return_or_enter).toOsaOpen('Raycast', 'raycast://extensions/raycast/window-management/maximize').desc('Maximize')
```

Usage: Hold `Base Key + W`, then press `H` for left half, `L` for right half, etc.


## Complete Example

Here's a complete configuration combining all concepts:

```typescript
import { Config, Key as k, Mod as mod } from 'karabiner-ts-config'

const co = new Config()
co.global.show_in_menu_bar = true

// Basic mappings
const basicRule = co.rule('Basic Mappings')
basicRule.map(k.right_command).to(k.f18).desc('Right CMD to F18')

// Fn navigation group
const fnNav = co.rule('Fn Navigation')
fnNav.map(k.up_arrow, [mod.fn]).to(k.page_up).desc('Fn+Up to Page Up')
fnNav.map(k.down_arrow, [mod.fn]).to(k.page_down).desc('Fn+Down to Page Down')
fnNav.map(k.left_arrow, [mod.fn]).to(k.home).desc('Fn+Left to Home')
fnNav.map(k.right_arrow, [mod.fn]).to(k.end).desc('Fn+Right to End')

// Base Key setup
const hyp = co.ruleBaseBy(k.caps_lock).desc('My Base Key')
    // optional: set specific modifier combination for this base key
    .mapTo(mod.left_shift, [mod.left_control, mod.left_option])

// Direct Base Key mappings
hyp.map(k.t).to(`open -a 'Terminal'`).desc('Terminal').separate()
hyp.map(k.b).to(`open -a 'Safari'`).desc('Browser').separate()

// layers
const sO = hyp.layer(k.o).desc('Open Applications').separate()
sO.map(k.m).to(`open -a 'Obsidian'`).desc('Open Obsidian')
sO.map(k.v).to(`open -a 'Visual Studio Code'`).desc('Open VSCode')

const sS = hyp.layer(k.s).desc('System Control').separate()
sS.map(k.u).to(k.volume_increment).desc('Volume Up')
sS.map(k.p).to(k.play_or_pause).desc('Play/Pause')

// Export configuration function
export default () => co
```

## API Reference

### Config

- `rule(description)` - Create basic rule for simple mappings
- `ruleBaseBy(key, modifiers?)` - Create Base Key rule
- `toJSON()` - Generate JSON Karabiner configuration (Object)
- `toString()` - Generate formatted Karabiner configuration

### Rule (Basic Rules)

- `map(key, modifiers?)` - Create key mapping (chainable)
- `.desc(description)` - Add description to rule

### RuleBased (Advanced Rules)

- `mapTo(modifier, modifiers[]?)` - Set Base Key modifiers (optional)
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
