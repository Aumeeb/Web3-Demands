export const assert = require('assert')

//#region Types
type Domain = string
type FilterMethodKeys = 'identical' | 'numberic' | 'hex' | 'ignored' | 'unordered' | 'date'
type FilterAction = (name: Domain) => string | null
//#endregion

//#region Prediction
const allEqual = (str: string) => str.split('').every((char) => char === str[0])
const isDecimal = (str: string) => !str.startsWith('0x') && !isNaN(+str)
const isHex = (str: string) => str.startsWith('0x') && !isNaN(+str)
const isEndWithZeroAndNonHex = (str: string) => !isHex(str) && str.endsWith('0')
const isStartWithZeronAndNonHex = (str: string) => !isHex(str) && str.startsWith('0')
const isDateStructureWithoutYears = (str: string) => str.length === 4
const isValidDate = (months: string, days: string) => {
  let dateString = `${new Date().getFullYear()}-${months}-${days}`
  let timestamp = Date.parse(dateString)
  if (isNaN(timestamp)) return false
  else return true
}
//#endregion
//#region utils

function processParams(args: any) {
  if (args[1] === undefined) {
    args[1] = args[0]
  }
  if (typeof args[0] === 'string') {
    args[0] = []
  }
  return getDomain(args[1])
}
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
function numbericToString(len: number): string | null {
  if (len < 4) return '999'
  if (len === 4) return '10K'
  if (len === 5) return '100K'
  else return null
  // ...
}
function symbolize(str: string, symbol: string = 'X') {
  let length = str.length
  let strArr = []
  for (let i = 0; i < length; i++) {
    if (str[i] === '0') strArr.push(0)
    else strArr.push(symbol)
  }
  return strArr.join('').toString()
}
function symbolizeStartWithZero(str: string, symbol: string = 'X'): string[] {
  let zeroCount = 0

  const arr = []

  for (let i = 0; i < str.length; i++) {
    if (str[i] === '0') zeroCount++
    else break
  }
  for (let i = 0; i < zeroCount; i++) {
    let strArr: string[] = []
    let timesToKeepZero = i + 1

    for (let j = 0; j < str.length; j++) {
      if (str[j] === '0' && j < timesToKeepZero) {
        strArr.push('0')
      } else strArr.push(symbol)
    }
    arr.push(strArr.join('').toString())
  }
  return arr
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
 * A Class contains diff pattern validation methods
 */
class Validator {
  protected static startWithZerosAndNonHex(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    let originalMethod = descriptor.value
    descriptor.value = function (...args: any) {
      let domain = processParams(args)
      if (isStartWithZeronAndNonHex(domain)) {
        const result = symbolizeStartWithZero(domain)
        result.forEach((item) => {
          args[0].push(item)
        })
      }
      return originalMethod.apply(this, args)
    }
  }
  protected static endWithZeroAndNonHex(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    let originalMethod = descriptor.value
    descriptor.value = function (...args: any) {
      let domain = processParams(args)
      if (isEndWithZeroAndNonHex(domain)) {
        const result = symbolize(domain)
        args[0].push(result)
      }
      return originalMethod.apply(this, args)
    }
  }
  protected static unify(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    let originalMethod = descriptor.value
    descriptor.value = function (...args: any) {
      let domain = processParams(args)
      if (allEqual(domain)) {
        const {charIdxMapping} = findUniqueCharNumbers(domain)
        const result = charIdxMapping[0].repeat(domain.length)
        args[0].push(result)
      }
      return originalMethod.apply(this, args)
    }
  }
  protected static toNumberic(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    let originalMethod = descriptor.value
    descriptor.value = function (...args: any) {
      let domain = processParams(args)
      if (isDecimal(domain)) {
        const result = numbericToString(domain.length)
        result && args[0].push(result)
      }
      return originalMethod.apply(this, args)
    }
  }
  protected static unordered(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    let originalMethod = descriptor.value
    descriptor.value = function (...args: any) {
      let domain = processParams(args)
      if (isDecimal(domain) && !allEqual(domain)) {
        const {charIdxMapping, charIdx, chars} = findUniqueCharNumbers(domain)
        let result = ''
        for (let i = 0; i < domain.length; i++) {
          const char = domain[i]
          const index = chars.findIndex((item) => item === char)
          result += identicalCharMappingToWord[index + 1]
        }
        args[0].push(result)
      }
      return originalMethod.apply(this, args)
    }
  }
  protected static toHex(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    let originalMethod = descriptor.value
    descriptor.value = function (...args: any) {
      let domain = processParams(args)
      if (isHex(domain)) {
        domain = domain.toLowerCase().replace('0x', '')
        const result = `0x${numbericToString(domain.length)}`
        result && args[0].push(result)
      }
      return originalMethod.apply(this, args)
    }
  }
  protected static toDate(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    let originalMethod = descriptor.value
    descriptor.value = function (...args: any) {
      let domain = processParams(args)
      if (isDateStructureWithoutYears(domain)) {
        const months = domain.substring(0, 2)
        const days = domain.substring(2, 4)
        if (isValidDate(months, days)) {
          let monthsMask = 'M'.repeat(months.length)
          let daysMask = 'D'.repeat(days.length)
          args[0].push(monthsMask + daysMask)
        }
      }
      return originalMethod.apply(this, args)
    }
  }
}

/**
 * Attaching different validator methods to filter output as demanding.
 * The method orders will not affect the results.
 */
class TextFilter extends Validator {
  @Validator.unify
  @Validator.toNumberic
  @Validator.unordered
  @Validator.endWithZeroAndNonHex
  @Validator.startWithZerosAndNonHex
  @Validator.toHex
  @Validator.toDate
  public detectPatterns(name: `${string}.bit`): Set<string> {
    return new Set(name as unknown as Set<string>)
  }
}

const {detectPatterns} = new TextFilter()

console.log(detectPatterns('0311.bit'), new Set(['ABCC', '0XXX', '10K', 'MMDD']))

console.log(assert.deepEqual(detectPatterns('333.bit'), new Set(['AAA', '999'])))
console.log(assert.deepEqual(detectPatterns('2112.bit'), new Set(['ABBA', '10K'])))
console.log(assert.deepEqual(detectPatterns('45555.bit'), new Set(['ABBBB', '100K'])))
console.log(assert.deepEqual(detectPatterns('888000.bit'), new Set(['AAABBB', 'XXX000'])))
console.log(assert.deepEqual(detectPatterns('0098.bit'), new Set(['10K', 'AABC', '0XXX', '00XX'])))
console.log(assert.deepEqual(detectPatterns('0x9832.bit'), new Set(['0x10K'])))
console.log(assert.deepEqual(detectPatterns('0311.bit'), new Set(['ABCC', '0XXX', '10K', 'MMDD'])))
