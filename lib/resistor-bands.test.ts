import assert from 'node:assert/strict'
import { test } from 'node:test'

import { resistorColorCode, resistorOhmsFromId } from './resistor-bands.ts'

test('four-band 5% codes match the standard examples', () => {
  assert.deepEqual(resistorColorCode(220)?.colors, ['red', 'red', 'brown', 'gold'])
  assert.deepEqual(resistorColorCode(1000)?.colors, ['brown', 'black', 'red', 'gold'])
  assert.deepEqual(resistorColorCode(100)?.colors, ['brown', 'black', 'brown', 'gold'])
  assert.deepEqual(resistorColorCode(330)?.colors, ['orange', 'orange', 'brown', 'gold'])
  assert.deepEqual(resistorColorCode(470)?.colors, ['yellow', 'violet', 'brown', 'gold'])
  assert.deepEqual(resistorColorCode(2200)?.colors, ['red', 'red', 'red', 'gold'])
  assert.deepEqual(resistorColorCode(4700)?.colors, ['yellow', 'violet', 'red', 'gold'])
  assert.deepEqual(resistorColorCode(10000)?.colors, ['brown', 'black', 'orange', 'gold'])
  assert.deepEqual(resistorColorCode(47000)?.colors, ['yellow', 'violet', 'orange', 'gold'])
  assert.deepEqual(resistorColorCode(100000)?.colors, ['brown', 'black', 'yellow', 'gold'])
  assert.equal(resistorColorCode(220)?.body, 'beige')
  assert.equal(resistorColorCode(220)?.tolerance, 0.05)
})

test('five-band 1% codes use three significant figures and a brown tolerance band', () => {
  const kilo = resistorColorCode(1000, { bands: 5, tolerance: 0.01 })
  assert.deepEqual(kilo?.colors, ['brown', 'black', 'black', 'brown', 'brown'])
  assert.equal(kilo?.body, 'blue')
  assert.deepEqual(resistorColorCode(220, { bands: 5 })?.colors, ['red', 'red', 'black', 'black', 'brown'])
  assert.deepEqual(resistorColorCode(10000, { bands: 5, tolerance: 0.01 })?.colors, ['brown', 'black', 'black', 'red', 'brown'])
})

test('identical values stay identical and unknown values are not invented', () => {
  assert.deepEqual(resistorColorCode(220), resistorColorCode(220))
  assert.equal(resistorColorCode(220)?.colors[1] === resistorColorCode(1000)?.colors[1], false)
  assert.equal(resistorColorCode(0), null)
  assert.equal(resistorColorCode(123), null)
  assert.equal(resistorColorCode(220, { tolerance: 0.03 }), null)
})

test('catalogue resistor ids select the value used for the bands', () => {
  assert.equal(resistorOhmsFromId('resistor-220'), 220)
  assert.equal(resistorOhmsFromId('resistor-1k'), 1000)
  assert.equal(resistorOhmsFromId('resistor-2k2'), 2200)
  assert.equal(resistorOhmsFromId('resistor-4k7'), 4700)
  assert.equal(resistorOhmsFromId('resistor-10k'), 10000)
  assert.equal(resistorOhmsFromId('resistor'), null)
})
