interface Props {
  options: string[]
  activeOption: string
  onChange: (option: string) => void
}

export default function DetailViewSwitcher({ options, activeOption, onChange }: Props) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-gray-400 mr-2">Visualizar por:</span>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            activeOption === opt
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
