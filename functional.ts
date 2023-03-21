export const assert = require('assert')

//#region Types
type RawDomain = Parameters<typeof detectPatterns>[0]
type Domain = string
type FilterMethodKeys = 'identical' | 'numberic' | 'hex' | 'ignored' | 'chaotic' | 'date'
type FilterAction = (name: Domain) => string | null
//#endregion

//#region
const allEqual = (str: string) => str.split('').every((char) => char === str[0])
const isDecimal = (str: string) => !str.startsWith('0x') && !isNaN(+str)
const isHex = (str: string) => !str.startsWith('0x') && isNaN(+str)
const numbericToString = (len: number): string => {
  if (len < 4) return '999'
  if (len === 4) return '10K'
  if (len === 5) return '100K'
  else return '???'
  // ...
}
//#endregion

/** The key of the object is increased by how many unique number of a text it contains,
 * each one maps a captialized letter. You can add new keys by demands manually or create them through a function later on.
 */
const identicalCharMappingToWord: {[key: number]: string} = {
  1: 'A',
  2: 'B',
  3: 'C',
  4: 'E',
  5: 'F',
  6: 'G',
  //...
} as const

/**
 * A function returns `Null` that means the pattern not supported.
 */
const patternFilter = {
  identical: function (name: Domain) {
    if (allEqual(name)) {
      const {charIdxMapping} = findUniqueCharNumbers(name)
      return charIdxMapping[0].repeat(name.length)
    }
    return null
  },
  numberic: (name: Domain) => {
    console.log('call numberic')
    console.log(isDecimal(name), name)

    if (isDecimal(name)) {
      const result = numbericToString(name.length)
      console.log(result + '~~~')

      return result
    } else {
      return null
    }
  },
  hex: (name) => null,
  ignored: () => null,
  chaotic: () => null,
  date: (name) => null,
} satisfies Record<FilterMethodKeys, FilterAction>

function findUniqueCharNumbers(text: string) {
  const cleanStr = text.replace(/ /gi, '')
  const set = [...new Set(cleanStr)]
  const result: {charIdx: number[]; charIdxMapping: string[]; chars: string[]} = {
    charIdx: [],
    chars: set,
    charIdxMapping: [],
  }
  for (let i = 0; i < result.chars.length; i++) {
    result.charIdx.push(i + 1)
    result.charIdxMapping.push(identicalCharMappingToWord[result.charIdx[i]])
  }

  return result
}

function getDomain(name: `${string}.bit`) {
  try {
    return name.substring(0, name.length - 4)
  } catch (error) {
    return ''
  }
}

function detectPatterns(name: `${string}.bit`): Set<string> {
  try {
    let domain = getDomain(name)
    let sets: string[] = []
    ;(Object.keys(patternFilter) as FilterMethodKeys[]).forEach((key) => {
      let result = patternFilter[key](domain)
      if (result) sets.push(result)
    })
    return new Set(sets)
  } catch (error) {
    return new Set([])
  }
}

class PatternValidator {}

console.log(assert.deepEqual(detectPatterns('333.bit'), new Set(['AAA', '999'])))
