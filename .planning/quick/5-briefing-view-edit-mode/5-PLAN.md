---
phase: quick
plan: 5
type: execute
wave: 1
depends_on: []
files_modified:
  - src/pages/clients/BriefingForm.tsx
autonomous: true
requirements: [QUICK-5]

must_haves:
  truths:
    - "Briefing page loads in read-only view mode by default"
    - "User can toggle to edit mode via a button in the page header"
    - "In view mode, all data displays as static text (no inputs, no add/remove buttons)"
    - "In edit mode, the existing form behavior is preserved exactly as-is"
    - "Toggling back to view mode discards no data (state is shared)"
  artifacts:
    - path: "src/pages/clients/BriefingForm.tsx"
      provides: "View/edit mode toggle for briefing page"
      contains: "isEditing"
  key_links:
    - from: "header toggle button"
      to: "isEditing state"
      via: "onClick -> setIsEditing"
      pattern: "setIsEditing"
    - from: "isEditing state"
      to: "card rendering"
      via: "conditional render: static text vs form inputs"
      pattern: "isEditing.*Input|isEditing.*Textarea"
---

<objective>
Add a view/edit mode toggle to the BriefingForm page. Currently the briefing page is always editable with form inputs. This plan adds a read-only view state as the default, with a toggle button to switch into edit mode. View mode renders all briefing data as clean static text. Edit mode preserves the existing form behavior exactly.

Purpose: Briefing data is read far more often than edited. A read-only default provides a cleaner experience and prevents accidental edits.
Output: Updated BriefingForm.tsx with dual-mode rendering.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/pages/clients/BriefingForm.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add view/edit mode toggle with read-only view rendering</name>
  <files>src/pages/clients/BriefingForm.tsx</files>
  <action>
Modify BriefingFormInner to support a view/edit toggle:

1. **Add state:** `const [isEditing, setIsEditing] = useState(false)` -- defaults to view mode.

2. **Update page header:** Replace the existing Save button area with a conditional:
   - View mode: Show an "Editar" button (import `Pencil` from lucide-react) with `variant="outline"` and `size="sm"` that calls `setIsEditing(true)`.
   - Edit mode: Show a row with "Cancelar" button (`variant="ghost"`, `size="sm"`, calls `setIsEditing(false)`) and the existing Save button.

3. **Create a `ViewField` helper** (inline in the same file, above BriefingFormInner) for rendering read-only values:
   ```tsx
   function ViewField({ label, value }: { label: string; value: string | undefined }) {
     if (!value) return null
     return (
       <div className="space-y-1">
         <p className="text-xs font-medium text-muted-foreground">{label}</p>
         <p className="text-sm text-foreground">{value}</p>
       </div>
     )
   }
   ```

4. **Create a `ViewList` helper** for rendering comma-separated arrays:
   ```tsx
   function ViewList({ label, items }: { label: string; items: string[] }) {
     if (items.length === 0) return null
     return (
       <div className="space-y-1">
         <p className="text-xs font-medium text-muted-foreground">{label}</p>
         <p className="text-sm text-foreground">{items.join(', ')}</p>
       </div>
     )
   }
   ```

5. **Render each Card section conditionally:**
   For EVERY Card section (all 9 cards), wrap the CardContent children with `{isEditing ? ( ...existing form inputs... ) : ( ...static view... )}`.

   View mode rendering per section:
   - **Informacoes da Empresa:** ViewField for name, segment, size, description. Use 2-col grid same as edit.
   - **Contexto do Produto:** ViewField for productType, sourceSystem, objective, approval, corePremise.
   - **Fontes de Dados:** For each source, show a bordered div with system, exportType, fields (ViewList), and fieldMappings (render as "campo -> uso" text pairs). No add/remove buttons. If no sources, show "Nenhuma fonte cadastrada." in muted text.
   - **Modulos e KPIs:** For each module, show name, kpis (ViewList), businessRules. No add/remove buttons. If no modules, show muted text.
   - **Categorias de KPIs:** For each category, show category name, confirmed/suggested/blocked as ViewList. If none, show muted text.
   - **Regras de Status:** For each rule, show "condition -> status" as text. If none, show muted text.
   - **Regras de Negocio:** For each rule, show rule text. If none, show muted text.
   - **Publico-alvo:** ViewField with the text. If empty, muted text.
   - **Notas Adicionais:** Show freeFormNotes as `whitespace-pre-wrap` text (preserve markdown line breaks). If empty, muted text.

6. **Hide bottom Save button in view mode:** Only show the bottom save area when `isEditing` is true.

7. **Keep all existing updater functions and state logic untouched.** The form inputs continue to work exactly as before when isEditing is true. No refactoring of the updater functions.

Important details:
- Import `Pencil` from lucide-react (add to existing import).
- Empty/undefined sections in view mode should show a single muted-text placeholder like "Nao informado." rather than rendering nothing (so the Card is never empty).
- Arrays that are empty or undefined: show "Nenhum item cadastrado." in muted text.
- The Select components (company size, export type) in view mode just show the value as plain text.
  </action>
  <verify>
    <automated>cd /Users/cauetpinciara/Documents/fxl/fxl-core && npx tsc --noEmit 2>&1 | tail -20</automated>
  </verify>
  <done>
    - BriefingForm loads in view mode by default (no inputs visible, all data as text)
    - "Editar" button in header switches to edit mode
    - Edit mode shows all form inputs and Save/Cancelar buttons
    - "Cancelar" returns to view mode preserving current state
    - Save button works as before in edit mode
    - All 9 card sections have proper view mode rendering
    - Zero TypeScript errors
  </done>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passes with zero errors
- Page loads at `/clients/{slug}/briefing` in view mode (static text, no inputs)
- Clicking "Editar" shows all form inputs
- Clicking "Cancelar" returns to view mode
- Save works correctly in edit mode
</verification>

<success_criteria>
BriefingForm defaults to a clean read-only view displaying all briefing data as static text. A single toggle button switches between view and edit modes. Edit mode preserves all existing form functionality. TypeScript compiles cleanly.
</success_criteria>

<output>
After completion, create `.planning/quick/5-briefing-view-edit-mode/5-SUMMARY.md`
</output>
