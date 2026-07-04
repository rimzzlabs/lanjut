```markdown
# lanjut Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the `lanjut` TypeScript codebase. You'll learn about file naming, import/export styles, commit message conventions, and how to write and run tests. This guide is designed to help contributors quickly adapt to the project's standards and workflows.

## Coding Conventions

### File Naming
- **Style:** kebab-case
- **Example:**  
  ```plaintext
  user-service.ts
  data-model.ts
  ```

### Import Style
- **Style:** Relative imports
- **Example:**
  ```typescript
  import { fetchData } from './data-service';
  ```

### Export Style
- **Style:** Named exports
- **Example:**
  ```typescript
  // In data-model.ts
  export interface User { ... }
  export function validateUser(user: User): boolean { ... }
  ```

### Commit Messages
- **Type:** Conventional commits
- **Prefix:** `feat`
- **Average Length:** 51 characters
- **Example:**
  ```
  feat: add user authentication middleware
  ```

## Workflows

### Feature Development
**Trigger:** When adding a new feature  
**Command:** `/feature-development`

1. Create a new TypeScript file using kebab-case naming.
2. Use relative imports to include dependencies.
3. Export functions, interfaces, or constants using named exports.
4. Write or update corresponding test files (`*.test.*`).
5. Commit changes using the conventional commit format with `feat` prefix.
6. Push your branch and open a pull request.

### Testing
**Trigger:** When verifying code correctness  
**Command:** `/run-tests`

1. Identify or create test files matching the `*.test.*` pattern.
2. Write tests for new or updated code.
3. Run the test suite using the project's test runner (framework unknown; check project scripts).
4. Ensure all tests pass before merging.

## Testing Patterns

- **File Pattern:** Test files are named with the `*.test.*` convention (e.g., `user-service.test.ts`).
- **Framework:** Not explicitly detected; check the repository for test runner details.
- **Example:**
  ```typescript
  // user-service.test.ts
  import { getUser } from './user-service';

  describe('getUser', () => {
    it('returns user data for valid ID', () => {
      // test implementation
    });
  });
  ```

## Commands
| Command              | Purpose                                      |
|----------------------|----------------------------------------------|
| /feature-development | Start a new feature with project conventions |
| /run-tests           | Run the test suite                           |
```
