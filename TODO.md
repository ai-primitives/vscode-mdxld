# Project Status and Tasks

## Setup and Configuration

- [x] Initialize VS Code extension with TypeScript
- [x] Configure project structure and build system
- [x] Set up ESLint and Prettier
- [ ] Configure VS Code extension manifest
- [ ] Set up extension activation events
- [ ] Configure extension settings schema

## Core Features Implementation

- [ ] Left Panel (Namespace Browser)

  - [ ] URI-based namespace navigation
    - [ ] HTTP support via @mdxdb/fetch
    - [ ] Local filesystem via @mdxdb/fs
    - [ ] ClickHouse integration via @mdxdb/clickhouse
  - [ ] Collection metadata display
  - [ ] Hierarchical namespace visualization
  - [ ] Refresh and sync capabilities

- [ ] Right Panel (MDX Editor)

  - [ ] YAML frontmatter editing
    - [ ] Schema validation integration
    - [ ] $type-based schema enforcement
    - [ ] Auto-completion for known schemas
  - [ ] MDX content editing
    - [ ] Syntax highlighting
    - [ ] Live preview
  - [ ] JavaScript/TypeScript support
    - [ ] Import/export validation
    - [ ] Component usage detection

- [ ] Additional Views
  - [ ] AST Visualization
    - [ ] JSON5 format display
    - [ ] Tree view navigation
    - [ ] AST node inspection
  - [ ] UI Component Preview
    - [ ] Layout rendering
    - [ ] Component visualization
    - [ ] Hot reload support

## Schema Integration

- [ ] Schema.org Integration

  - [ ] Type definitions
  - [ ] Context validation
  - [ ] Auto-completion

- [ ] GS1.org Integration

  - [ ] Type definitions
  - [ ] Context validation
  - [ ] Auto-completion

- [ ] MDX.org.ai Integration
  - [ ] Type definitions
  - [ ] Context validation
  - [ ] Auto-completion

## Technical Challenges

- [ ] Performance Optimization

  - [ ] Large file handling
  - [ ] Real-time validation
  - [ ] Preview rendering

- [ ] Schema Validation

  - [ ] Dynamic schema loading
  - [ ] Custom schema support
  - [ ] Schema caching

- [ ] UI Component Integration
  - [ ] Sandbox environment
  - [ ] Component isolation
  - [ ] Style handling

## Verification Requirements

- [ ] Unit Tests

  - [ ] Parser functionality
  - [ ] Schema validation
  - [ ] Component rendering

- [ ] Integration Tests

  - [ ] Extension commands
  - [ ] View interactions
  - [ ] File system operations

- [ ] End-to-End Tests
  - [ ] Full workflow scenarios
  - [ ] Cross-platform testing
  - [ ] Performance benchmarks

## Deployment

- [ ] VS Code Marketplace

  - [ ] Extension packaging
  - [ ] Marketplace listing
  - [ ] Version management

- [ ] CI/CD Pipeline
  - [ ] GitHub Actions workflow
  - [ ] Automated testing
  - [ ] Release automation

## Current Blockers

### ESLint Configuration Issue

- [ ] ESLint config using ES modules without proper module type configuration
  - Error: Cannot use import statement outside a module
  - Reproduction:
    1. Run `pnpm lint`
    2. Error in eslint.config.js: SyntaxError: Cannot use import statement outside a module
  - Blocking: CI pipeline, code quality checks
  - Resolution pending: Need to update package.json type field or convert to .mjs

### @mdxdb Package Dependencies

- [ ] Published @mdxdb packages contain workspace dependencies
  - Error: Published packages still contain workspace references
  - Reproduction:
    1. Update package.json to use published npm packages
    2. Run `pnpm install`
    3. Error: ERR_PNPM_WORKSPACE_PKG_NOT_FOUND for @mdxdb/types workspace dependency
  - Affected packages:
    - @mdxdb/clickhouse
    - @mdxdb/fetch
    - @mdxdb/fs
  - Blocking: Namespace browser implementation, CI pipeline
  - Resolution pending: Update published packages to use versioned dependencies instead of workspace references

### TypeScript Compilation Errors

- [ ] Schema validation type errors in schemaOrg.ts

  - Error 1: content.$type is possibly undefined
    - Location: src/schemas/schemaOrg.ts:84
    - Impact: Schema validation fails to handle undefined types
    - Resolution: Add type guard for content.$type
    - Reproduction:
      1. Run `pnpm build`
      2. TypeScript compiler shows undefined property error
  - Error 2: Spread types may only be created from object types
    - Location: src/schemas/schemaOrg.ts:97
    - Impact: Invalid object spread operation
    - Resolution: Ensure spread operation is performed on valid object type
    - Reproduction:
      1. Run `pnpm build`
      2. TypeScript compiler shows invalid spread type error
  - Blocking: CI pipeline, schema validation functionality

- [ ] MDXEditorProvider registration method mismatch
  # PLACEHOLDER: existing MDXEditorProvider error content

## Documentation

- [x] README with features and usage
- [ ] API documentation
- [ ] Configuration guide
- [ ] Contributing guidelines
- [ ] Example collection
