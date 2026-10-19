import assert from 'node:assert/strict'
import { test } from 'node:test'

import { discoverySections } from './project-discovery.ts'

const published = [
  { title: 'Motion Sensor Alarm', description: 'PIR alarm', isPublished: true, slug: '8' },
  { title: 'Servo Pan-Tilt Camera', description: 'Two servos', isPublished: true, slug: '18' },
]
const drafts = [
  { title: 'Smart Plant Monitor', description: 'Soil sensor', isPublished: false, slug: '1' },
  { title: 'ESP32 Wi-Fi Weather Station', description: 'BME280', isPublished: false, slug: '23' },
  { title: 'ESP32 Bluetooth RGB LED Controller', description: 'BLE colour', isPublished: false, slug: '24' },
]

test('published projects stay ahead of the development draft list', () => {
  const sections = discoverySections({ published, drafts, search: '', showDrafts: true })
  assert.deepEqual(
    sections.map((section) => section.id),
    ['published', 'drafts'],
  )
  assert.deepEqual(
    sections[0].projects.map((project) => project.slug),
    ['8', '18'],
  )
  assert.equal(sections[1].projects.some((project) => project.slug === '8' || project.slug === '18'), false)
  assert.equal(sections[1].projects.some((project) => project.slug === '23' || project.slug === '24'), true)
})

test('search finds a published project without leaving unrelated drafts above it', () => {
  const sections = discoverySections({ published, drafts, search: 'motion', showDrafts: true })
  assert.equal(sections[0].id, 'published')
  assert.deepEqual(
    sections[0].projects.map((project) => project.slug),
    ['8'],
  )
  assert.equal(sections.some((section) => section.id === 'drafts'), false)
})

test('unpublished projects stay out of the published section', () => {
  const sections = discoverySections({
    published: drafts,
    drafts,
    search: 'weather',
    showDrafts: true,
  })
  assert.deepEqual(sections[0].projects, [])
  assert.deepEqual(
    sections[1].projects.map((project) => project.slug),
    ['23'],
  )
})
