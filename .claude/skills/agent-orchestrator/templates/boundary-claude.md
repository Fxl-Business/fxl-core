# Boundary: {{name}}

## Purpose
{{one-line description}}

## Ownership
- {{primary path}}

## Associated Paths
- {{external paths with read-write access, if any}}
- {{reason for association}}

## Public API

### Types
- {{TypeName}}: {{brief description}} ({{path}})

### Hooks
- {{useHookName}}: {{brief description}} ({{path}})

### Components
- {{ComponentName}}: {{brief description}} ({{path}})

### Services
- {{serviceName}}: {{brief description}} ({{path}})

### Pages
- {{PageName}}: {{brief description}} ({{path}})

### Extensions
- {{ExtensionName}}: {{brief description}} ({{path}})

## Dependencies

### From shared/
- {{imports from shared/}}

### From platform/
- {{imports from platform/}}

### From other boundaries
- {{boundary}}: {{what it reads, always read-only}}

### From external packages
- {{package}}: {{what it uses}}

### From tools/
- {{tool path}}: {{what it imports}}

## Validation
- {{boundary-specific checks}}

## Agent Rules
- **Write:** Only files under ownership and associated paths
- **Read:** Entire codebase
- **Shared writes:** Request via lead
- **Cross-boundary writes:** Never — report to lead
- **Do NOT run** `tsc --noEmit` individually (lead runs full-project check)
