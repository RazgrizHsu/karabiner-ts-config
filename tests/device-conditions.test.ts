/**
 * Device Conditions Test
 */

import { Config, Key as k } from '../src'

describe('Device Conditions', () => {

  test('device specific rule should include device_if conditions', () => {
    const co = new Config()
    const device = co.device({ vendor_id: 1452, product_id: 641 })

    const rule = device.rule('Device Specific Rule')
    rule.map(k.a).to(k.b).desc('A to B')

    const config = co.toJSON()
    const rules = config.profiles[0].complex_modifications.rules

    const deviceRule = rules.find(r => r.description.includes('Device Specific Rule'))
    expect(deviceRule).toBeDefined()

    const manipulator = deviceRule!.manipulators[0]
    expect(manipulator.conditions).toBeDefined()
    expect(manipulator.conditions).toContainEqual({
      type: 'device_if',
      identifiers: [{ vendor_id: 1452, product_id: 641 }]
    })
  })

  test('device specific ruleBaseBy should include device_if conditions in base trigger', () => {
    const co = new Config()
    const device = co.device({ vendor_id: 1452, product_id: 641 })

    const hyper = device.ruleBaseBy(k.caps_lock).desc('Device Hyper Key')
    hyper.map(k.f).to(`open -a 'Finder'`).desc('Finder')

    const config = co.toJSON()
    const rules = config.profiles[0].complex_modifications.rules

    const hyperRule = rules.find(r => r.description.includes('Device Hyper Key'))
    expect(hyperRule).toBeDefined()

    // Check base trigger (caps_lock variable setter)
    const baseTrigger = hyperRule!.manipulators.find(m =>
      m.description && m.description.includes('Set var_caps_lock variable')
    )
    expect(baseTrigger).toBeDefined()
    expect(baseTrigger!.conditions).toBeDefined()
    expect(baseTrigger!.conditions).toContainEqual({
      type: 'device_if',
      identifiers: [{ vendor_id: 1452, product_id: 641 }]
    })

    // Check direct mapping (f key)
    const finderMapping = hyperRule!.manipulators.find(m =>
      m.description === 'Finder'
    )
    expect(finderMapping).toBeDefined()
    expect(finderMapping!.conditions).toBeDefined()
    expect(finderMapping!.conditions).toContainEqual({
      type: 'device_if',
      identifiers: [{ vendor_id: 1452, product_id: 641 }]
    })
  })

  test('device specific layer should include device_if conditions', () => {
    const co = new Config()
    const device = co.device({ vendor_id: 1452, product_id: 641 })

    const hyper = device.ruleBaseBy(k.caps_lock).desc('Device Hyper Key')
    const layer = hyper.layer(k.o).desc('Open Apps')
    layer.map(k.s).to(`open -a spotify`).desc('Spotify')

    const config = co.toJSON()
    const rules = config.profiles[0].complex_modifications.rules

    const hyperRule = rules.find(r => r.description.includes('Device Hyper Key'))
    expect(hyperRule).toBeDefined()

    // Check layer toggle (o key)
    const layerToggle = hyperRule!.manipulators.find(m =>
      m.description === 'Toggle layer o'
    )
    expect(layerToggle).toBeDefined()
    expect(layerToggle!.conditions).toBeDefined()
    expect(layerToggle!.conditions).toContainEqual({
      type: 'device_if',
      identifiers: [{ vendor_id: 1452, product_id: 641 }]
    })

    // Check layer mapping (s key for spotify)
    const spotifyMapping = hyperRule!.manipulators.find(m =>
      m.description === 'Spotify'
    )
    expect(spotifyMapping).toBeDefined()
    expect(spotifyMapping!.conditions).toBeDefined()
    expect(spotifyMapping!.conditions).toContainEqual({
      type: 'device_if',
      identifiers: [{ vendor_id: 1452, product_id: 641 }]
    })
  })

  test('nested layer should include device_if conditions', () => {
    const co = new Config()
    const device = co.device({ vendor_id: 1452, product_id: 641 })

    const hyper = device.ruleBaseBy(k.caps_lock).desc('Device Hyper Key')
    const windowLayer = hyper.layer(k.w).desc('Window Management')
    const resizeLayer = windowLayer.layer(k.r).desc('Resize')
    resizeLayer.map(k.h).to(`resize-left`).desc('Resize Left')

    const config = co.toJSON()
    const rules = config.profiles[0].complex_modifications.rules

    const hyperRule = rules.find(r => r.description.includes('Device Hyper Key'))
    expect(hyperRule).toBeDefined()

    // Check nested layer toggle (r key within w layer)
    const nestedLayerToggle = hyperRule!.manipulators.find(m =>
      m.description === 'Toggle layer r'
    )
    expect(nestedLayerToggle).toBeDefined()
    expect(nestedLayerToggle!.conditions).toBeDefined()
    expect(nestedLayerToggle!.conditions).toContainEqual({
      type: 'device_if',
      identifiers: [{ vendor_id: 1452, product_id: 641 }]
    })

    // Check nested layer mapping (h key for resize)
    const resizeMapping = hyperRule!.manipulators.find(m =>
      m.description === 'Resize Left'
    )
    expect(resizeMapping).toBeDefined()
    expect(resizeMapping!.conditions).toBeDefined()
    expect(resizeMapping!.conditions).toContainEqual({
      type: 'device_if',
      identifiers: [{ vendor_id: 1452, product_id: 641 }]
    })
  })

  test('global rules should not include device_if conditions', () => {
    const co = new Config()

    const globalRule = co.rule('Global Rule')
    globalRule.map(k.a).to(k.b).desc('Global A to B')

    const globalHyper = co.ruleBaseBy(k.f16).desc('Global Hyper')
    globalHyper.map(k.f).to(`open -a 'Finder'`).desc('Global Finder')

    const config = co.toJSON()
    const rules = config.profiles[0].complex_modifications.rules

    // Check global rule has no device conditions
    const globalRuleFound = rules.find(r => r.description.includes('Global Rule'))
    expect(globalRuleFound).toBeDefined()

    const globalMapping = globalRuleFound!.manipulators[0]
    if (globalMapping.conditions) {
      expect(globalMapping.conditions).not.toContainEqual(
        expect.objectContaining({ type: 'device_if' })
      )
    }

    // Check global hyper rule has no device conditions in base trigger
    const globalHyperRule = rules.find(r => r.description.includes('Global Hyper'))
    expect(globalHyperRule).toBeDefined()

    const globalBaseTrigger = globalHyperRule!.manipulators.find(m =>
      m.description && m.description.includes('Set var_f16 variable')
    )
    expect(globalBaseTrigger).toBeDefined()
    if (globalBaseTrigger!.conditions) {
      expect(globalBaseTrigger!.conditions).not.toContainEqual(
        expect.objectContaining({ type: 'device_if' })
      )
    }
  })

  test('multiple devices should have separate device_if conditions', () => {
    const co = new Config()
    const device1 = co.device({ vendor_id: 1452, product_id: 641 })
    const device2 = co.device({ vendor_id: 7504, product_id: 24926 })

    const hyper1 = device1.ruleBaseBy(k.caps_lock).desc('Device 1 Hyper')
    hyper1.map(k.f).to(`open -a 'Finder'`).desc('Finder 1')

    const hyper2 = device2.ruleBaseBy(k.f16).desc('Device 2 Hyper')
    hyper2.map(k.f).to(`open -a 'Finder'`).desc('Finder 2')

    const config = co.toJSON()
    const rules = config.profiles[0].complex_modifications.rules

    // Check device 1 conditions
    const device1Rule = rules.find(r => r.description.includes('Device 1 Hyper'))
    expect(device1Rule).toBeDefined()

    const device1Mapping = device1Rule!.manipulators.find(m => m.description === 'Finder 1')
    expect(device1Mapping).toBeDefined()
    expect(device1Mapping!.conditions).toContainEqual({
      type: 'device_if',
      identifiers: [{ vendor_id: 1452, product_id: 641 }]
    })

    // Check device 2 conditions
    const device2Rule = rules.find(r => r.description.includes('Device 2 Hyper'))
    expect(device2Rule).toBeDefined()

    const device2Mapping = device2Rule!.manipulators.find(m => m.description === 'Finder 2')
    expect(device2Mapping).toBeDefined()
    expect(device2Mapping!.conditions).toContainEqual({
      type: 'device_if',
      identifiers: [{ vendor_id: 7504, product_id: 24926 }]
    })
  })

})
