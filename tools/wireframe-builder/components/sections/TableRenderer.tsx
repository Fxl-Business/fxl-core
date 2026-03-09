import { useState } from 'react'
import type {
  DataTableSection,
  DrillDownTableSection,
  ClickableTableSection,
  ColumnConfig,
} from '../../types/blueprint'
import DataTable from '../DataTable'
import DrillDownTable from '../DrillDownTable'
import ClickableTable from '../ClickableTable'
import type { ClickRow } from '../ClickableTable'
import DetailViewSwitcher from '../DetailViewSwitcher'
import WireframeModal from '../WireframeModal'

type TableSection = DataTableSection | DrillDownTableSection | ClickableTableSection

type Props = {
  section: TableSection
  compareMode: boolean
  /** Brand primary color (resolved hex). Passed through to table components for header bg. */
  brandPrimary?: string
}

function filterColumns(columns: ColumnConfig[], compareMode: boolean) {
  return columns
    .filter((col) => !col.compareOnly || compareMode)
    .map(({ key, label, align }) => ({ key, label, align }))
}

function DataTableRenderer({ section, compareMode, brandPrimary }: { section: DataTableSection; compareMode: boolean; brandPrimary?: string }) {
  const columns = filterColumns(section.columns, compareMode)
  return <DataTable title={section.title} columns={columns} rowCount={section.rowCount} brandPrimary={brandPrimary} />
}

function DrillDownTableRenderer({ section, compareMode, brandPrimary }: { section: DrillDownTableSection; compareMode: boolean; brandPrimary?: string }) {
  const columns = filterColumns(section.columns, compareMode)
  const [activeView, setActiveView] = useState(section.viewSwitcher?.default ?? '')
  const rows = section.viewSwitcher
    ? section.viewSwitcher.rowsByView[activeView] ?? section.rows
    : section.rows

  return (
    <div className="space-y-3">
      {section.viewSwitcher && (
        <DetailViewSwitcher
          options={section.viewSwitcher.options}
          activeOption={activeView}
          onChange={setActiveView}
        />
      )}
      <DrillDownTable
        title={section.title}
        subtitle={section.subtitle}
        columns={columns}
        rows={rows}
        brandPrimary={brandPrimary}
      />
    </div>
  )
}

function ClickableTableRenderer({ section, compareMode, brandPrimary }: { section: ClickableTableSection; compareMode: boolean; brandPrimary?: string }) {
  const columns = filterColumns(section.columns, compareMode)
  const [modal, setModal] = useState(false)
  const [modalTitle, setModalTitle] = useState('')

  const handleRowClick = (row: ClickRow) => {
    const titleKey = section.modalTitleKey
    const title = titleKey ? String(row.data[titleKey] ?? '') : ''
    setModalTitle(title)
    setModal(true)
  }

  return (
    <>
      <ClickableTable
        title={section.title}
        subtitle={section.subtitle}
        columns={columns}
        rows={section.rows}
        onRowClick={handleRowClick}
        brandPrimary={brandPrimary}
      />
      <WireframeModal
        title={modalTitle}
        open={modal}
        onClose={() => setModal(false)}
        footer={section.modalFooter}
      >
        <p className="text-xs text-gray-400">Detalhamento em desenvolvimento.</p>
      </WireframeModal>
    </>
  )
}

export default function TableRenderer({ section, compareMode, brandPrimary }: Props) {
  switch (section.type) {
    case 'data-table':
      return <DataTableRenderer section={section} compareMode={compareMode} brandPrimary={brandPrimary} />
    case 'drill-down-table':
      return <DrillDownTableRenderer section={section} compareMode={compareMode} brandPrimary={brandPrimary} />
    case 'clickable-table':
      return <ClickableTableRenderer section={section} compareMode={compareMode} brandPrimary={brandPrimary} />
  }
}
