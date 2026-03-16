type PageHeaderProps = {
  badge?: string
  title: string
  description: string
  version?: string
  date?: string
}

export default function PageHeader({
  badge,
  title,
  description,
  version,
  date,
}: PageHeaderProps) {
  return (
    <div className="mb-8 border-b border-border pb-6">
      {badge && (
        <span className="mb-3 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          {badge}
        </span>
      )}
      <h1 className="mb-2 text-2xl font-bold text-foreground">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
      {(version || date) && (
        <div className="mt-3 flex gap-3">
          {version && <span className="text-xs text-muted-foreground">v{version}</span>}
          {date && <span className="text-xs text-muted-foreground">{date}</span>}
        </div>
      )}
    </div>
  )
}
