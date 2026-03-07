import type {
  SaldoBancoSection,
  ManualInputSectionConfig,
  UploadSectionConfig,
} from '../../types/blueprint'
import SaldoBancoInput from '../SaldoBancoInput'
import ManualInputSection from '../ManualInputSection'
import UploadSection from '../UploadSection'

type InputSection = SaldoBancoSection | ManualInputSectionConfig | UploadSectionConfig

type Props = {
  section: InputSection
}

export default function InputRenderer({ section }: Props) {
  switch (section.type) {
    case 'saldo-banco':
      return (
        <SaldoBancoInput
          banks={section.banks}
          total={section.total}
          title={section.title}
          note={section.note}
        />
      )
    case 'manual-input':
      return (
        <ManualInputSection
          title={section.title}
          initialBalance={section.initialBalance}
          entries={section.entries}
        />
      )
    case 'upload-section':
      return (
        <UploadSection
          label={section.label}
          acceptedFormats={section.acceptedFormats}
          successMessage={section.successMessage}
          errorMessages={section.errorMessages}
          history={section.history}
        />
      )
  }
}
