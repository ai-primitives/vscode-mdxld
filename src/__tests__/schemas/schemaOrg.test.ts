import { describe, test, expect } from 'vitest'
import { validateSchemaOrg } from '../../schemas/schemaOrg'
import { MDXLD } from '../../types/mdxld'

describe('Schema.org Validation', () => {
  test('validates correct type and context', async () => {
    const content: MDXLD = {
      $type: 'https://schema.org/Article',
      $context: 'https://schema.org',
      content: '',
      data: { headline: 'Test Article' },
    }
    const result = await validateSchemaOrg(content.$type || '', content)
    expect(result.isValid).toBe(true)
  })

  test('handles missing type', async () => {
    const content: MDXLD = {
      $context: 'https://schema.org',
      content: '',
      data: { headline: 'Test Article' },
    }
    const result = await validateSchemaOrg('', content)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Missing schema type')
  })

  test('handles invalid schema type', async () => {
    const content: MDXLD = {
      $type: 'https://schema.org/InvalidType',
      $context: 'https://schema.org',
      content: '',
      data: { headline: 'Test Article' },
    }
    const result = await validateSchemaOrg(content.$type || '', content)
    expect(result.isValid).toBe(false)
    expect(result.errors?.[0]).toMatch(/Failed to fetch schema.org definition/)
  })

  test('validates property types', async () => {
    const content: MDXLD = {
      $type: 'https://schema.org/Article',
      $context: 'https://schema.org',
      content: '',
      data: {
        headline: 123, // Invalid type - should be string
        articleBody: true, // Invalid type - should be string
      },
    }
    const result = await validateSchemaOrg(content.$type || '', content)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Invalid type for headline: expected one of [Text]')
    expect(result.errors).toContain('Invalid type for articleBody: expected one of [Text]')
  })
})
