import { Config, Key as k, Mod as mod } from '../src/index'

describe('Key Validation', () => {
  describe('Key conflicts between maps and layer triggers', () => {
    test('should throw error when same key is both mapped and used as layer trigger', () => {
      expect(() => {
        let co = new Config()
        let hyp = co.ruleBaseBy(k.a)
        hyp.map(k.o).to(`open -a ''`)
        hyp.layer(k.o)
        co.toJSON()
      }).toThrow()
    })

    test('should not throw error when keys are used in different contexts', () => {
      expect(() => {
        let co = new Config()
        let hyp1 = co.ruleBaseBy(k.a)
        hyp1.map(k.o).to(`open -a ''`)

        let hyp2 = co.ruleBaseBy(k.right_shift)
        hyp2.layer(k.o)

        co.toJSON()
      }).not.toThrow()
    })
  })

  describe('Layer key mapping conflicts', () => {
    test('should throw error when mapping key within layer triggered by same key', () => {
      expect(() => {
        let co = new Config()
        let hyp = co.ruleBaseBy(k.a)
        let sO = hyp.layer(k.o)
        sO.map(k.o).to(`open -a ''`)
        co.toJSON()
      }).toThrow()
    })

    test('should allow mapping different keys within layer', () => {
      expect(() => {
        let co = new Config()
        let hyp = co.ruleBaseBy(k.a)
        let sO = hyp.layer(k.o)
        sO.map(k.j).to(`open -a JDownloader`)
        co.toJSON()
      }).not.toThrow()
    })

    test('should allow nested layers with proper key separation', () => {
      expect(() => {
        let co = new Config()
        let hyp = co.ruleBaseBy(k.a)
        let sW = hyp.layer(k.w)
        let sWR = sW.layer(k.r)
        sWR.map(k.h).to(`resize-smaller`)
        co.toJSON()
      }).not.toThrow()
    })

    test('should throw error in nested layer with same key mapping', () => {
      expect(() => {
        let co = new Config()
        let hyp = co.ruleBaseBy(k.a)
        let sW = hyp.layer(k.w)
        let sWR = sW.layer(k.r)
        sWR.map(k.r).to(`invalid-mapping`)
        co.toJSON()
      }).toThrow()
    })
  })

  describe('Complex scenario validation', () => {
    test('should validate raz.ts example conflicts', () => {
      expect(() => {
        let co = new Config()
        let hyp = co.ruleBaseBy(k.a)

        hyp.map(k.o).to(`open -a ''`)
        let sO = hyp.layer(k.o)

        co.toJSON()
      }).toThrow()
    })

    test('should handle multiple valid layer configurations', () => {
      expect(() => {
        let co = new Config()
        let hyp = co.ruleBaseBy(k.a)

        let sW = hyp.layer(k.w)
        sW.map(k.o).to(`o`)
        sW.map(k.k).to(`k`)
        sW.map(k.j).to(`j`)

        let sV = hyp.layer(k.v)
        sV.map(k.k).to(k.up_arrow)
        sV.map(k.j).to(k.down_arrow)

        co.toJSON()
      }).not.toThrow()
    })
  })

  describe('Simple key mapping validation', () => {
    test('should throw error when same simple key is mapped twice', () => {
      expect(() => {
        let co = new Config()
        co.map(k.a).to(k.b)
        co.map(k.a).to(k.c)
        co.toJSON()
      }).toThrow('Duplicate key combination: a in Config.map(a)')
    })

    test('should throw error when same simple key with mods is mapped twice', () => {
      expect(() => {
        let co = new Config()
        co.map(k.a, [mod.left_command]).to(k.b)
        co.map(k.a, [mod.left_command]).to(k.c)
        co.toJSON()
      }).toThrow('Duplicate key combination: a+left_command in Config.map(a)')
    })
  })
})
