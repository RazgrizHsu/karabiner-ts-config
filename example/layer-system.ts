/**
 * Advanced Layer System Example
 *
 * This example demonstrates the powerful layer system in karabiner-ts-config,
 * showing how to create complex, organized key mappings using Base Keys and Layers.
 *
 * Concepts covered:
 * - Base Key as layer activator
 * - Multiple layers for different functions
 * - Nested layers (sub-layers)
 * - Layer organization patterns
 */

import { Config, Key as k, Mod as mod } from 'karabiner-ts-config'

const co = new Config()

// Setup layer system with F16 as the base hyper key
const hyper = co.ruleBaseBy(k.f16).desc('Hyper Layer System')
    .ifAlone(k.escape)  // F16 alone outputs escape

// Layer 1: Application Launcher (hyper + o)
const appLayer = hyper.layer(k.o).desc('Application Launcher')
// Common applications
appLayer.map(k.f).to(`open -a 'Finder'`).desc('Finder')
appLayer.map(k.b).to(`open -a 'Firefox'`).desc('Firefox')
appLayer.map(k.c).to(`open -a 'Visual Studio Code'`).desc('VS Code')
appLayer.map(k.t).to(`open -a 'Terminal'`).desc('Terminal')
appLayer.map(k.s).to(`open -a 'Slack'`).desc('Slack')
appLayer.map(k.m).to(`open -a 'Mail'`).desc('Mail')
appLayer.map(k.n).to(`open -a 'Notes'`).desc('Notes')
appLayer.map(k.p).to(`open -a 'Preview'`).desc('Preview')

// Development tools sub-section
appLayer.map(k.d).to(`open -a 'Docker Desktop'`).desc('Docker')
appLayer.map(k.g).to(`open -a 'GitHub Desktop'`).desc('GitHub Desktop')
appLayer.map(k.i).to(`open -a 'IntelliJ IDEA'`).desc('IntelliJ IDEA')

// Layer 2: Window Management (hyper + w)
const windowLayer = hyper.layer(k.w).desc('Window Management')
// Basic window positioning
windowLayer.map(k.h).to(`open -g 'rectangle://execute-action?name=left-half'`).desc('Left Half')
windowLayer.map(k.l).to(`open -g 'rectangle://execute-action?name=right-half'`).desc('Right Half')
windowLayer.map(k.k).to(`open -g 'rectangle://execute-action?name=top-half'`).desc('Top Half')
windowLayer.map(k.j).to(`open -g 'rectangle://execute-action?name=bottom-half'`).desc('Bottom Half')

// Corner positioning
windowLayer.map(k.y).to(`open -g 'rectangle://execute-action?name=top-left'`).desc('Top Left')
windowLayer.map(k.u).to(`open -g 'rectangle://execute-action?name=top-right'`).desc('Top Right')
windowLayer.map(k.b).to(`open -g 'rectangle://execute-action?name=bottom-left'`).desc('Bottom Left')
windowLayer.map(k.n).to(`open -g 'rectangle://execute-action?name=bottom-right'`).desc('Bottom Right')

// Full screen operations
windowLayer.map(k.return_or_enter).to(`open -g 'rectangle://execute-action?name=maximize'`).desc('Maximize')
windowLayer.map(k.spacebar).to(`open -g 'rectangle://execute-action?name=restore'`).desc('Restore')
windowLayer.map(k.d).to(`open -g 'rectangle://execute-action?name=next-display'`).desc('Next Display')

// Sub-layer: Window Resizing (hyper + w + r)
const resizeLayer = windowLayer.layer(k.r).desc('Window Resize')
resizeLayer.map(k.h).to(`open -g 'rectangle://execute-action?name=smaller-width'`).desc('Smaller Width')
resizeLayer.map(k.l).to(`open -g 'rectangle://execute-action?name=larger-width'`).desc('Larger Width')
resizeLayer.map(k.j).to(`open -g 'rectangle://execute-action?name=smaller-height'`).desc('Smaller Height')
resizeLayer.map(k.k).to(`open -g 'rectangle://execute-action?name=larger-height'`).desc('Larger Height')
resizeLayer.map(k.i).to(`open -g 'rectangle://execute-action?name=smaller'`).desc('Smaller Overall')
resizeLayer.map(k.o).to(`open -g 'rectangle://execute-action?name=larger'`).desc('Larger Overall')

// Layer 3: System Control (hyper + s)
const systemLayer = hyper.layer(k.s).desc('System Control')
// Media controls
systemLayer.map(k.spacebar).to(k.play_or_pause).desc('Play/Pause')
systemLayer.map(k.comma).to(k.rewind).desc('Previous Track')
systemLayer.map(k.period).to(k.fastforward).desc('Next Track')
systemLayer.map(k.u).to(k.volume_decrement).desc('Volume Down')
systemLayer.map(k.i).to(k.volume_increment).desc('Volume Up')
systemLayer.map(k.m).to(k.mute).desc('Mute')

// Screen brightness
systemLayer.map(k.j).to(k.display_brightness_decrement).desc('Brightness Down')
systemLayer.map(k.k).to(k.display_brightness_increment).desc('Brightness Up')

// Keyboard brightness (MacBook) - using F5/F6 keys for keyboard backlight
systemLayer.map(k.n).to(k.f5).desc('Keyboard Brightness Down')
systemLayer.map(k.p).to(k.f6).desc('Keyboard Brightness Up')

// System sleep and lock
systemLayer.map(k.l).to(`pmset sleepnow`).desc('Sleep System')
systemLayer.map(k.x).to(`/System/Library/CoreServices/Menu\\ Extras/User.menu/Contents/Resources/CGSession -suspend`).desc('Lock Screen')

// Layer 4: Navigation and Editing (hyper + n)
const navLayer = hyper.layer(k.n).desc('Navigation & Editing')
// Vim-style navigation with modifiers
navLayer.map(k.h).to(k.left_arrow).desc('Left')
navLayer.map(k.j).to(k.down_arrow).desc('Down')
navLayer.map(k.k).to(k.up_arrow).desc('Up')
navLayer.map(k.l).to(k.right_arrow).desc('Right')

// Word navigation
navLayer.map(k.h, [k.lalt]).to(k.left_arrow, [k.lalt]).desc('Word Left')
navLayer.map(k.l, [k.lalt]).to(k.right_arrow, [k.lalt]).desc('Word Right')

// Line navigation
navLayer.map(k.a).to(k.left_arrow, [k.lcmd]).desc('Line Start')
navLayer.map(k.e).to(k.right_arrow, [k.lcmd]).desc('Line End')

// Page navigation
navLayer.map(k.u).to(k.page_up).desc('Page Up')
navLayer.map(k.d).to(k.page_down).desc('Page Down')
navLayer.map(k.g).to(k.home).desc('Document Start')
navLayer.map(k.grave_accent_and_tilde).to(k.end).desc('Document End')

// Selection (with shift)
navLayer.map(k.h, [k.lshift]).to(k.left_arrow, [k.lshift]).desc('Select Left')
navLayer.map(k.j, [k.lshift]).to(k.down_arrow, [k.lshift]).desc('Select Down')
navLayer.map(k.k, [k.lshift]).to(k.up_arrow, [k.lshift]).desc('Select Up')
navLayer.map(k.l, [k.lshift]).to(k.right_arrow, [k.lshift]).desc('Select Right')

// Layer 5: Development Tools (hyper + v)
const devLayer = hyper.layer(k.v).desc('Development Tools')
// Git commands (using terminal shortcuts)
devLayer.map(k.s).to(k.s, [k.lcmd]).desc('Save (Cmd+S)')
devLayer.map(k.z).to(k.z, [k.lcmd]).desc('Undo (Cmd+Z)')
devLayer.map(k.y).to(k.z, [k.lcmd, k.lshift]).desc('Redo (Cmd+Shift+Z)')

// Code navigation
devLayer.map(k.f).to(k.f, [k.lcmd]).desc('Find (Cmd+F)')
devLayer.map(k.r).to(k.r, [k.lcmd]).desc('Replace (Cmd+R)')
devLayer.map(k.g).to(k.g, [k.lcmd]).desc('Go to Line (Cmd+G)')

// IDE shortcuts
devLayer.map(k.b).to(k.b, [k.lcmd]).desc('Build (Cmd+B)')
devLayer.map(k.d).to(k.d, [k.lcmd]).desc('Debug (Cmd+D)')
devLayer.map(k.t).to(k.t, [k.lcmd, k.lshift]).desc('Run Tests (Cmd+Shift+T)')

// Terminal shortcuts
devLayer.map(k.c).to(k.c, [k.lctrl]).desc('Interrupt (Ctrl+C)')
devLayer.map(k.x).to(k.x, [k.lctrl]).desc('Kill Line (Ctrl+X)')

// Layer 6: Number Pad (hyper + m)
const numLayer = hyper.layer(k.m).desc('Number Pad')
// Number grid (like a numpad)
numLayer.map(k.u).to(k.n7).desc('7')
numLayer.map(k.i).to(k.n8).desc('8')
numLayer.map(k.o).to(k.n9).desc('9')
numLayer.map(k.j).to(k.n4).desc('4')
numLayer.map(k.k).to(k.n5).desc('5')
numLayer.map(k.l).to(k.n6).desc('6')
numLayer.map(k.n).to(k.n1).desc('1')
numLayer.map(k.m).to(k.n2).desc('2')
numLayer.map(k.comma).to(k.n3).desc('3')
numLayer.map(k.spacebar).to(k.n0).desc('0')

// Math operators
numLayer.map(k.p).to(k.slash).desc('/')
numLayer.map(k.semicolon).to(k.hyphen).desc('-')
numLayer.map(k.quote).to(k.equal_sign, [k.lshift]).desc('+')
numLayer.map(k.period).to(k.period).desc('.')

/**
 * Layer System Best Practices:
 *
 * 1. Logical Organization:
 *    - Group related functions together
 *    - Use mnemonic triggers (o for open, w for window, s for system)
 *    - Keep frequently used functions on primary layers
 *
 * 2. Layer Hierarchy:
 *    - Primary layers for main categories
 *    - Sub-layers for specialized functions
 *    - Don't nest too deeply (max 2-3 levels)
 *
 * 3. Key Placement Strategy:
 *    - Use spatial relationships (hjkl for navigation)
 *    - Home row for most common functions
 *    - Consistent patterns across layers
 *
 * 4. Documentation:
 *    - Clear descriptions for each layer and mapping
 *    - Use .separate() to group related functions in UI
 *    - Document the logic behind key choices
 *
 * 5. Testing:
 *    - Test each layer individually
 *    - Verify no conflicts between layers
 *    - Ensure sub-layers work correctly
 *
 * 6. Evolution:
 *    - Start simple, add complexity gradually
 *    - Monitor usage patterns and adjust
 *    - Remove unused mappings periodically
 */

export default () => co
