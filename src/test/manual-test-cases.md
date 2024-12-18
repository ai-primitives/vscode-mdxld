# Manual Test Cases for VS Code Extension

## Desktop Environment Tests

### Fetch Provider
1. Configure settings:
   ```json
   {
     "mdxld.provider": "fetch",
     "mdxld.fetch.endpoint": "https://api.mdx.org.ai",
     "mdxld.fetch.token": "b3b000070fbf8602ae54ca3787afb542"
   }
   ```
2. Verify namespace browser shows fetch provider
3. Verify collections are listed
4. Verify error handling when token is invalid

### FS Provider
1. Configure settings:
   ```json
   {
     "mdxld.provider": "fs",
     "mdxld.fs.path": ".",
     "mdxld.openaiApiKey": "sk-proj-U5Tub6GjcFlhp0Ev1IDDT3BlbkFJrLPDi9z7ej5WsPLtaQiS"
   }
   ```
2. Verify namespace browser shows local files
3. Verify collections are listed from filesystem
4. Verify error handling for invalid paths

### ClickHouse Provider
1. Configure settings:
   ```json
   {
     "mdxld.provider": "clickhouse",
     "mdxld.clickhouse.url": "http://localhost:8123",
     "mdxld.clickhouse.username": "default",
     "mdxld.clickhouse.password": "password",
     "mdxld.clickhouse.database": "mdxld",
     "mdxld.clickhouse.oplogTable": "mdxld_oplog",
     "mdxld.clickhouse.dataTable": "mdxld_data",
     "mdxld.openaiApiKey": "sk-proj-U5Tub6GjcFlhp0Ev1IDDT3BlbkFJrLPDi9z7ej5WsPLtaQiS"
   }
   ```
2. Verify namespace browser shows ClickHouse data
3. Verify collections are listed
4. Verify error handling for connection issues

## Web Environment Tests

### Fetch Provider (Only Supported Provider)
1. Configure settings:
   ```json
   {
     "mdxld.fetch.endpoint": "https://api.mdx.org.ai",
     "mdxld.fetch.token": "b3b000070fbf8602ae54ca3787afb542"
   }
   ```
2. Verify namespace browser shows fetch provider
3. Verify collections are listed
4. Verify error handling when token is invalid

### Other Providers (Should Be Blocked)
1. Try configuring fs provider
2. Verify appropriate error message about web limitations
3. Try configuring clickhouse provider
4. Verify appropriate error message about web limitations

## Error Handling Tests

1. Missing Configuration
   - Remove required settings
   - Verify helpful error messages

2. Invalid Configuration
   - Set invalid endpoint URLs
   - Set invalid tokens
   - Verify error messages are clear

3. Web Limitations
   - Verify clear message when attempting to use unsupported providers
   - Verify graceful fallback to fetch provider

## Configuration Tests

1. Settings Schema
   - Verify settings are properly typed in VS Code settings UI
   - Verify autocomplete works for provider types
   - Verify validation for required fields

2. Security
   - Verify tokens are not logged
   - Verify secure storage of sensitive information

## Results

- [ ] Desktop Fetch Provider Tests Passed
- [ ] Desktop FS Provider Tests Passed
- [ ] Desktop ClickHouse Provider Tests Passed
- [ ] Web Fetch Provider Tests Passed
- [ ] Web Limitations Tests Passed
- [ ] Error Handling Tests Passed
- [ ] Configuration Tests Passed
