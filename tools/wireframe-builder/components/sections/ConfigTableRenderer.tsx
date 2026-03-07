import type { ConfigTableSection } from '../../types/blueprint'
import ConfigTable from '../ConfigTable'

type Props = {
  section: ConfigTableSection
}

export default function ConfigTableRenderer({ section }: Props) {
  return (
    <ConfigTable
      title={section.title}
      addLabel={section.addLabel}
      columns={section.columns}
      rows={section.rows}
    />
  )
}
