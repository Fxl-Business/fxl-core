# Module: {{module-name}}

## Purpose
{{one-line description}}

## Ownership
- src/modules/{{module-name}}/**

## Public API

### Types
- {{TypeName}}: {{brief description}} (src/modules/{{module-name}}/types/{{file}})

### Hooks
- {{useHookName}}: {{brief description}} (src/modules/{{module-name}}/hooks/{{file}})

### Components
- {{ComponentName}}: {{brief description}} (src/modules/{{module-name}}/components/{{file}})

## Dependencies

### From shared/
- {{imports from shared/}}

### From platform/
- {{imports from platform/}}

### From other modules
- modules/{{other}}: {{what it reads, always read-only}}

## Validation
- {{module-specific checks}}

## Agent Rules
- **Write:** Only files under `src/modules/{{module-name}}/`
- **Read:** Entire codebase
- **Shared writes:** Request via lead → platform agent
- **Cross-module writes:** Never — report to lead
- **Do NOT run** `tsc --noEmit` individually (lead runs full-project check)
