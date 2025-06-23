import { Config, Key as k, Mod as mod } from '../src/index'

describe('Held Down Functionality', () => {
  let co: Config

  beforeEach(() => {
    co = new Config()
  })

  describe('Basic onHold functionality', () => {
    test('should create holdInfo when onHold is called', () => {
      const rule = co.rule('Test hold')
      const mapBuilder = rule.map(k.f)
      const holdInfo = mapBuilder.onHold(k.left_shift)

      expect(mapBuilder.holdInfo).toBeDefined()
      expect(holdInfo.key).toBe(k.left_shift)
    })

    test('should support modifiers in onHold', () => {
      const rule = co.rule('Test hold with modifiers')
      const mapBuilder = rule.map(k.escape)
      const holdInfo = mapBuilder.onHold(k.v, [mod.left_command])

      expect(holdInfo.key).toBe(k.v)
      expect(holdInfo.mods).toEqual([mod.left_command])
    })

  })

  describe('onHoldCmd functionality', () => {
    test('should create holdInfo with shell command', () => {
      const rule = co.rule('Test hold command')
      const shellCmd = "open -b 'com.apple.Safari'"
      const mapBuilder = rule.map(k.tab)
      const holdInfo = mapBuilder.onHoldCmd(shellCmd)

      expect(holdInfo.shell).toBe(shellCmd)
      expect(holdInfo.key).toBeUndefined()
    })
  })

  describe('Parameter setting', () => {
    test('should set threshold parameter', () => {
      const rule = co.rule('Test threshold')
      const holdInfo = rule.map(k.f)
        .onHold(k.left_shift)
        .setParam('thresholdMs', 250)

      expect(holdInfo.args.thresholdMs).toBe(250)
    })

    test('should set multiple parameters', () => {
      const rule = co.rule('Test multiple args')
      const holdInfo = rule.map(k.escape)
        .onHold(k.left_control)
        .setParam('thresholdMs', 200)
        .setParam('delayedActionMs', 500)
        .setParam('aloneTimeoutMs', 100)

      expect(holdInfo.args.thresholdMs).toBe(200)
      expect(holdInfo.args.delayedActionMs).toBe(500)
      expect(holdInfo.args.aloneTimeoutMs).toBe(100)
    })
  })


  describe('Chainable methods', () => {
    test('should support method chaining', () => {
      const rule = co.rule('Test chaining')
      const mapBuilder = rule.map(k.f)
      const holdInfo = mapBuilder
        .onHold(k.left_shift)
        .setParam('thresholdMs', 300)
        .desc('Chained configuration')

      expect(holdInfo.key).toBe(k.left_shift)
      expect(holdInfo.args.thresholdMs).toBe(300)
    })
  })

  describe('Edge cases', () => {
    test('should handle empty modifiers array', () => {
      const rule = co.rule('Test empty mods')
      const mapBuilder = rule.map(k.a)
      const holdInfo = mapBuilder.onHold(k.b, [])

      expect(holdInfo.mods).toEqual([])
    })

    test('should handle undefined modifiers', () => {
      const rule = co.rule('Test undefined mods')
      const mapBuilder = rule.map(k.a)
      const holdInfo = mapBuilder.onHold(k.b, undefined)

      expect(holdInfo.mods).toBeUndefined()
    })

    test('should overwrite previous holdInfo when called multiple times', () => {
      const rule = co.rule('Test overwrite')
      const mapBuilder = rule.map(k.f)

      mapBuilder.onHold(k.left_shift)
      expect(mapBuilder.holdInfo?.key).toBe(k.left_shift)

      mapBuilder.onHoldCmd('echo test')
      expect(mapBuilder.holdInfo?.shell).toBe('echo test')
      expect(mapBuilder.holdInfo?.key).toBeUndefined()
    })
  })

  describe('Integration with normal mapping', () => {
    test('should work with normal to() mapping', () => {
      const rule = co.rule('Test with normal mapping')
      const mapBuilder = rule.map(k.f).to(k.f)  // Normal behavior
      const holdInfo = mapBuilder.onHold(k.left_shift)  // Hold behavior

      expect(mapBuilder.keys).toHaveLength(1)
      expect(mapBuilder.keys[0].key).toBe(k.f)
      expect(holdInfo.key).toBe(k.left_shift)
    })

    test('should work without normal to() mapping', () => {
      const rule = co.rule('Test without normal mapping')
      const mapBuilder = rule.map(k.spacebar)
      const holdInfo = mapBuilder
        .onHold(k.return_or_enter)

      expect(mapBuilder.keys).toHaveLength(0)
      expect(holdInfo.key).toBe(k.return_or_enter)
    })
  })
})
