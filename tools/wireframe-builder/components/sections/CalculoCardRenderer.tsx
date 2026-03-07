import type { CalculoCardSection } from '../../types/blueprint'
import CalculoCard from '../CalculoCard'

type Props = {
  section: CalculoCardSection
  compareMode: boolean
  comparePeriod: string
}

export default function CalculoCardRenderer({ section, compareMode, comparePeriod }: Props) {
  return (
    <CalculoCard
      title={section.title}
      rows={section.rows}
      compareMode={compareMode}
      comparePeriodLabel={comparePeriod}
    />
  )
}
