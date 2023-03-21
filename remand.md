# Coding Test

To estimate your coding skill level, please finish the coding test below with TypeScript.

Please submit your code with online services like [GitHub](https://github.com/), [Gist](https://gist.github.com/) or [CodeSandbox](https://codesandbox.io/), then send the link back.

Please **do not** comment this Gist.

## Description

Every .bit account is unique, they are priceless for the owner. However, some .bit account names match special patterns, which makes them outstanding from other names.

Your goal is to write a function whose input is a .bit name and output is its patterns.

## Challenge

Please detect all **🔢Digit** patterns that [https://rare.id](https://rare.id/search?tab=category) has defined except the `Rare4D` pattern.

The function you wrote must satisfies the signature below:

```ts
function detectPatterns(name: `${string}.bit`): Set<string>
```

## Test cases

Here are some example of test cases:

```ts
import assert from 'assert'

assert.deepEqual(detectPatterns('333.bit'), new Set(['AAA', '999']))
assert.deepEqual(detectPatterns('2112.bit'), new Set(['ABBA', '10K']))
assert.deepEqual(detectPatterns('45555.bit'), new Set(['ABBBB', '100K']))
assert.deepEqual(detectPatterns('888000.bit'), new Set(['AAABBB', 'XXX000']))
assert.deepEqual(detectPatterns('0098.bit'), new Set(['10K', 'AABC', '0XXX', '00XX']))
assert.deepEqual(detectPatterns('0x9832.bit'), new Set(['0x10K']))
assert.deepEqual(detectPatterns('0311.bit'), new Set(['ABCC', '0XXX', '10K', 'MMDD']))
```
