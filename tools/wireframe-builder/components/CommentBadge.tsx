type Props = {
  count: number
}

export default function CommentBadge({ count }: Props) {
  if (count === 0) return null

  return (
    <span className="absolute top-1.5 right-1.5 z-10 flex min-w-[24px] h-6 px-1 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
      {count}
    </span>
  )
}
