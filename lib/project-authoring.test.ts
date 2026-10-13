import assert from 'node:assert/strict'
import { test } from 'node:test'

import { COMPONENT_CATALOGUE } from '../constants/component-catalogue.ts'
import { ESP32_WIFI_WEATHER_FIRMWARE } from '../constants/firmware/esp32-wifi-weather-station.ts'
import { ESP32_WIFI_WEATHER_LAYOUT } from '../constants/wiring-diagrams/layouts/esp32-wifi-weather-station.ts'
import {
  ESP32_WIFI_WEATHER_BOM,
  ESP32_WIFI_WEATHER_CONNECTIONS,
  ESP32_WIFI_WEATHER_PROJECT,
  ESP32_WIFI_WEATHER_STEPS,
} from '../constants/walkthroughs/esp32-wifi-weather-station.ts'
import { localAuthoredProjects } from './authored-projects.ts'
import { authoringErrors, publicationBlockers, reviewAuthoredProject } from './project-authoring.ts'

const catalogueIds = new Set(COMPONENT_CATALOGUE.map((entry) => entry.id))

function weatherInput(overrides: Partial<Parameters<typeof reviewAuthoredProject>[0]> = {}) {
  return {
    slug: ESP32_WIFI_WEATHER_PROJECT.slug,
    title: ESP32_WIFI_WEATHER_PROJECT.title,
    isPublished: ESP32_WIFI_WEATHER_PROJECT.isPublished,
    learningObjectives: ESP32_WIFI_WEATHER_PROJECT.learningObjectives,
    coverPending: true,
    bom: ESP32_WIFI_WEATHER_BOM.map((item) => ({ slug: item.slug, quantity: item.quantity })),
    catalogueIds,
    steps: ESP32_WIFI_WEATHER_STEPS,
    connections: ESP32_WIFI_WEATHER_CONNECTIONS,
    layout: ESP32_WIFI_WEATHER_LAYOUT,
    firmware: ESP32_WIFI_WEATHER_FIRMWARE,
    requirements: ESP32_WIFI_WEATHER_BOM.map(() => ({
      policy: 'exact' as const,
      approvedReviewIds: [],
    })),
    codeStyle: 'single-program' as const,
    compilation: 'not_run' as const,
    hardwareTested: false,
    ...overrides,
  }
}

test('the weather station passes the structural authoring checks', () => {
  const findings = reviewAuthoredProject(weatherInput())
  assert.deepEqual(authoringErrors(findings).map((finding) => finding.message), [])
  assert.equal(findings.some((finding) => finding.gate === 'visual' && finding.level === 'review'), true)
  assert.equal(findings.some((finding) => finding.gate === 'firmware' && finding.level === 'review'), true)
  assert.equal(findings.some((finding) => finding.gate === 'behaviour' && finding.level === 'review'), true)
})

test('a structural gap is an error and does not count as publication-ready', () => {
  const findings = reviewAuthoredProject(weatherInput({
    bom: [{ slug: 'missing-part', quantity: 1 }],
    compilation: 'passed',
    hardwareTested: true,
    coverPending: false,
  }))
  assert.equal(authoringErrors(findings).some((finding) => finding.gate === 'hardware'), true)
  assert.equal(publicationBlockers(weatherInput({ compilation: 'passed', hardwareTested: true, coverPending: false }), []).includes('Firmware compilation has not passed.'), false)
  const readyLooking = publicationBlockers(weatherInput(), findings)
  assert.equal(readyLooking.some((reason) => reason.includes('missing-part')), true)
  assert.equal(readyLooking.some((reason) => reason.includes('photographic cover')), true)
})

test('local authoring validation covers every walkthrough project', () => {
  const reports = localAuthoredProjects().map((project) => ({
    slug: project.slug,
    errors: authoringErrors(reviewAuthoredProject(project)).map((finding) => finding.message),
  }))
  assert.deepEqual(
    reports,
    [
      { slug: '8', errors: [] },
      { slug: '18', errors: [] },
      { slug: '23', errors: [] },
    ],
  )
})

test('an approved substitution still needs a review id', () => {
  const findings = reviewAuthoredProject(weatherInput({
    requirements: [{ policy: 'direct', approvedReviewIds: [''] }],
  }))
  assert.equal(authoringErrors(findings).some((finding) => finding.gate === 'compatibility'), true)
})
