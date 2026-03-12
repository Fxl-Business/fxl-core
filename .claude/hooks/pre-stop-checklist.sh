#!/bin/bash
# Pre-stop checklist hook
# Blocks Claude from finishing if visual files were changed without verification.
#
# Checks:
# 1. TypeScript compilation (npx tsc --noEmit)
# 2. If .tsx files in visual paths were modified, remind to verify in browser

set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
cd "$PROJECT_DIR"

# 1. TypeScript gate
if ! npx tsc --noEmit 2>/dev/null; then
  echo '{"decision": "block", "reason": "TypeScript compilation failed. Run `npx tsc --noEmit` and fix all errors before completing work."}'
  exit 0
fi

# 2. Check if visual files were modified (unstaged or staged)
VISUAL_PATTERNS="src/components/ src/pages/ tools/.*/components/ clients/.*/wireframe/"
VISUAL_CHANGED=false

for pattern in $VISUAL_PATTERNS; do
  if git diff --name-only HEAD 2>/dev/null | grep -qE "$pattern.*\.tsx$"; then
    VISUAL_CHANGED=true
    break
  fi
  if git diff --cached --name-only 2>/dev/null | grep -qE "$pattern.*\.tsx$"; then
    VISUAL_CHANGED=true
    break
  fi
  if git diff --name-only 2>/dev/null | grep -qE "$pattern.*\.tsx$"; then
    VISUAL_CHANGED=true
    break
  fi
done

if [ "$VISUAL_CHANGED" = true ]; then
  # Check if user has confirmed visual verification in this session
  # We use a marker file that gets cleaned up on session start
  MARKER="/tmp/.claude-visual-verified-$$"
  if [ ! -f "$MARKER" ]; then
    CHANGED_FILES=$(git diff --name-only HEAD 2>/dev/null | grep -E '\.tsx$' | head -5)
    echo "{\"decision\": \"block\", \"reason\": \"Visual .tsx files were modified but not verified in the browser. Changed files include: ${CHANGED_FILES}. Per CLAUDE.md rules: open the affected page in the browser (make dev + localhost), verify rendering in light/dark mode, and test interactions. After verification, inform the user of the results.\"}"
    touch "$MARKER"
    exit 0
  fi
fi

# All checks passed
exit 0
