# Requirements: FXL Core

**Defined:** 2026-03-13
**Core Value:** FXL Core e o cerebro operacional da empresa — documentacao, processo e tooling juntos

## v2.4 Requirements

Requirements for Component Picker Preview Mode milestone. Each maps to roadmap phases.

### Picker

- [ ] **PICK-01**: Dialog tem toggle para alternar entre modo preview e modo compacto
- [ ] **PICK-02**: Dialog abre em modo preview por padrao
- [ ] **PICK-03**: Dialog e maior no modo preview para acomodar previews
- [ ] **PICK-04**: Categorias mantidas como separadores com scroll vertical em ambos os modos

### Preview

- [ ] **PREV-01**: Cada tipo de secao mostra mini-render usando defaultProps() do registry e seu renderer
- [ ] **PREV-02**: Layout em grid de 2-3 colunas com cards de preview
- [ ] **PREV-03**: Clique no card de preview adiciona a secao diretamente (mesmo comportamento do modo compacto)
- [ ] **PREV-04**: Previews renderizados dentro de WireframeThemeProvider para styling correto

## Future Requirements

### Advanced Preview

- **APREV-01**: Busca/filtro por nome no dialog de selecao
- **APREV-02**: Preview interativo com hover effects
- **APREV-03**: Favoritos/recentes no topo do picker

## Out of Scope

| Feature | Reason |
|---------|--------|
| Screenshot/image previews | Mini-render com componentes reais e mais preciso e nao precisa de build step |
| Preview editavel no dialog | Complexidade alta, operador edita depois de adicionar |
| Animacoes de transicao entre modos | Overengineering para um toggle simples |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PREV-01 | Phase 58 | Pending |
| PREV-04 | Phase 58 | Pending |
| PICK-01 | Phase 59 | Pending |
| PICK-02 | Phase 59 | Pending |
| PICK-03 | Phase 59 | Pending |
| PICK-04 | Phase 59 | Pending |
| PREV-02 | Phase 59 | Pending |
| PREV-03 | Phase 59 | Pending |

**Coverage:**
- v2.4 requirements: 8 total
- Mapped to phases: 8
- Unmapped: 0

---
*Requirements defined: 2026-03-13*
*Last updated: 2026-03-13 after roadmap creation — all 8 requirements mapped*
