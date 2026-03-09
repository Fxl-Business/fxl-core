interface Props {
  options: string[]
  activeOption: string
  onChange: (option: string) => void
}

export default function DetailViewSwitcher({ options, activeOption, onChange }: Props) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-wf-muted mr-2">Visualizar por:</span>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
          style={activeOption === opt
            ? { backgroundColor: 'var(--wf-accent)', color: 'var(--wf-accent-fg)' }
            : { backgroundColor: 'var(--wf-canvas)', color: 'var(--wf-body)' }
          }
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
