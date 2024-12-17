import { MDXLD } from 'mdxld';
import fetch from 'node-fetch';
import { SchemaValidationResult } from './index';

interface SchemaOrgDefinition {
    '@context': string;
    '@type': string;
    properties: Record<string, unknown>;
    required?: string[];
}

/**
 * Validates content against schema.org schema
 */
export async function validateSchemaOrg(
    type: string,
    content: MDXLD
): Promise<SchemaValidationResult> {
    try {
        const response = await fetch(`https://schema.org/${type.split('/').pop()}.jsonld`);
        if (!response.ok) {
            return {
                isValid: false,
                errors: [`Failed to fetch schema.org definition: ${response.statusText}`]
            };
        }

        const schema = await response.json() as SchemaOrgDefinition;
        const errors: string[] = [];
        const data = content.data as Record<string, unknown>;

        // Validate required fields
        if (schema.required) {
            for (const field of schema.required) {
                if (!(field in data)) {
                    errors.push(`Missing required field: ${field}`);
                }
            }
        }

        // Validate property types
        for (const [key, value] of Object.entries(data)) {
            const propertySchema = schema.properties[key];
            if (propertySchema && typeof propertySchema === 'object') {
                const expectedType = (propertySchema as { '@type': string })['@type'];
                if (!validateSchemaOrgType(value, expectedType)) {
                    errors.push(`Invalid type for ${key}: expected ${expectedType}`);
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined
        };
    } catch (error) {
        return {
            isValid: false,
            errors: [(error as Error).message]
        };
    }
}

function validateSchemaOrgType(value: unknown, expectedType: string): boolean {
    switch (expectedType) {
        case 'Text':
            return typeof value === 'string';
        case 'Number':
            return typeof value === 'number';
        case 'Boolean':
            return typeof value === 'boolean';
        case 'Date':
            return value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)));
        default:
            return true; // Allow unknown types for now
    }
}

/**
 * Enriches content with schema.org metadata
 */
export async function enrichSchemaOrg(content: MDXLD): Promise<MDXLD> {
    try {
        const type = content.$type.split('/').pop();
        const response = await fetch(`https://schema.org/${type}.jsonld`);
        if (!response.ok) {
            return content;
        }

        const schemaData = await response.json();
        return {
            ...content,
            data: {
                ...content.data,
                '@context': 'https://schema.org',
                '@type': type,
                ...schemaData
            }
        };
    } catch (error) {
        console.error('Schema.org enrichment failed:', error);
        return content;
    }
}
