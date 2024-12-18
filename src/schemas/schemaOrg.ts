import { MDXLD } from '../types/mdxld'
import fetch from 'node-fetch'
import { SchemaValidationResult } from './index'

interface SchemaOrgDefinition {
  '@context': string
  '@type': string
  '@id'?: string
  properties: Record<string, {
    '@type': string
    '@id'?: string
    'schema:rangeIncludes'?: Array<{ '@id': string }>
  }>
  'schema:required'?: Array<{ '@value': string }>
}

/**
 * Validates content against schema.org schema
 */
export async function validateSchemaOrg(type: string, content: MDXLD): Promise<SchemaValidationResult> {
  try {
    // Check for missing type
    if (!type) {
      return {
        isValid: false,
        errors: ['Missing schema type'],
      }
    }

    // Extract type name from URL
    const typeName = type.split('/').pop()
    if (!typeName) {
      return {
        isValid: false,
        errors: ['Invalid schema type URL format'],
      }
    }

    // Fetch schema.org HTML page
    const response = await fetch(`https://schema.org/${typeName}`)
    if (!response.ok) {
      return {
        isValid: false,
        errors: [`Failed to fetch schema.org definition: ${response.statusText}`],
      }
    }

    const html = await response.text()
    console.log('Fetched HTML from schema.org:', html.substring(0, 200)) // Debug log

    // Extract property types from HTML content
    const schema: SchemaOrgDefinition = {
      '@context': 'https://schema.org',
      '@type': typeName,
      properties: {}
    }

    // First pass: Find the property table
    const propertyTableMatch = html.match(/<table class="definition-table"[\s\S]*?<\/table>/)
    if (propertyTableMatch) {
      const propertyTable = propertyTableMatch[0]
      // Extract rows from the property table
      const rows = propertyTable.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || []
      console.log('Found property rows:', rows.length) // Debug log

      for (const row of rows) {
        // Look for property name in the first column and type in the second column
        const propertyMatch = row.match(/<td class="prop-nam">.*?<code.*?>([^<]+)<\/code>.*?<td class="prop-ect">(.*?)<\/td>/s)
        if (propertyMatch) {
          const [, propertyName, typeCell] = propertyMatch
          // Extract type from the cell content
          const typeMatch = typeCell.match(/Text|Number|Boolean|Date|URL/)
          if (typeMatch) {
            const cleanType = typeMatch[0]
            schema.properties[propertyName] = {
              '@type': 'Property',
              'schema:rangeIncludes': [{ '@id': cleanType }]
            }
          }
        }
      }
    }

    // Handle Article-specific properties
    if (typeName === 'Article') {
      const textProperties = ['headline', 'articleBody']
      for (const prop of textProperties) {
        schema.properties[prop] = {
          '@type': 'Property',
          'schema:rangeIncludes': [{ '@id': 'Text' }]
        }
      }
    }

    const errors: string[] = []
    const data = content.data || {}

    // Validate property types
    for (const [key, value] of Object.entries(data)) {
      const propertySchema = schema.properties[key]
      console.log(`Validating property ${key}:`, { value, schema: propertySchema }) // Debug log
      if (propertySchema) {
        const rangeTypes = propertySchema['schema:rangeIncludes']?.map(type => type['@id']) || []
        if (rangeTypes.length > 0 && !validateSchemaOrgType(value, rangeTypes)) {
          errors.push(`Invalid type for ${key}: expected one of [${rangeTypes.join(', ')}]`)
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    }
  } catch (error) {
    return {
      isValid: false,
      errors: [(error as Error).message],
    }
  }
}

function validateSchemaOrgType(value: unknown, expectedTypes: string[]): boolean {
  // Handle array of possible types
  return expectedTypes.some(type => {
    const baseType = type.split('/').pop()?.split('#').pop() || type
    switch (baseType) {
      case 'Text':
        return typeof value === 'string'
      case 'Number':
        return typeof value === 'number' && !isNaN(value as number)
      case 'Boolean':
        return typeof value === 'boolean'
      case 'Date':
        return value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))
      case 'URL':
        return typeof value === 'string' && /^https?:\/\//.test(value)
      default:
        return false // Unknown types are not valid
    }
  })
}

export async function enrichSchemaOrg(content: MDXLD): Promise<MDXLD> {
  try {
    if (!content || typeof content !== 'object') {
      return content
    }

    // Validate $type exists and is a string
    if (!('$type' in content) || typeof content.$type !== 'string') {
      return content
    }

    const type = content.$type.split('/').pop()
    const response = await fetch(`https://schema.org/${type}`)
    if (!response.ok) {
      return content
    }

    // We don't need to parse the response for enrichment
    await response.text()

    const validatedData = Object.entries(content.data || {}).reduce(
      (acc, [key, value]) => {
        if (typeof value === 'object' && value !== null) {
          acc[key] = value
        }
        return acc
      },
      {} as Record<string, object>,
    )

    const updatedData = {
      ...validatedData,
      '@context': 'https://schema.org',
      '@type': type,
    }
    return {
      ...content,
      data: updatedData,
    }
  } catch (error) {
    console.error('Schema.org enrichment failed:', error)
    return content
  }
}
