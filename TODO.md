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

### Dependency Availability
- [ ] @mdxdb packages not published to npm
  - Affected packages:
    - @mdxdb/fs
    - @mdxdb/fetch
    - @mdxdb/clickhouse
  - Blocking: Namespace browser implementation
  - Resolution pending: Package publication to npm registry

## Documentation

- [x] README with features and usage
- [ ] API documentation
- [ ] Configuration guide
- [ ] Contributing guidelines
- [ ] Example collection
