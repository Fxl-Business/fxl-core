type Props = {
  badge?: string
  title: string
  description?: string
}

export default function DocPageHeader({ badge, title, description }: Props) {
  return (
    <div className="mb-0">
      {badge && (
        <span className="mb-3 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-950/50 dark:text-indigo-400 dark:ring-indigo-400/30">
          {badge}
        </span>
      )}
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-foreground sm:text-5xl">{title}</h1>
      {description && (
        <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">{description}</p>
      )}
    </div>
  )
}
