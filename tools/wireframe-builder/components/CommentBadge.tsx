type Props = {
  count: number
}

export default function CommentBadge({ count }: Props) {
  if (count === 0) return null

  return (
    <span className="absolute top-1 right-1 z-10 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
      {count}
    </span>
  )
}
