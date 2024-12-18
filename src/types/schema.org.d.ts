/**
 * Type definitions for Schema.org integration
 */

export interface SchemaOrgType {
  '@type': string
  '@context': 'https://schema.org'
  [key: string]: unknown
}

export interface SchemaOrgProperty {
  '@type': string
  '@id'?: string
  description?: string
  rangeIncludes?: {
    '@id': string
  }[]
}

export interface SchemaOrgDefinition {
  '@context': 'https://schema.org'
  '@type': 'rdfs:Class'
  '@id': string
  description?: string
  properties?: Record<string, SchemaOrgProperty>
}
