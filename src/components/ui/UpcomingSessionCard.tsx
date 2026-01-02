interface Props {
  title: string
  time: string
  course: string
}

export const UpcomingSessionCard = ({ title, time, course }: Props) => {
  return (
    <div className="float-card w-full rounded-[24px] border border-white/60 bg-white/95 p-5 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-text-soft">Upcoming</p>
      <p className="mt-2 text-lg font-semibold text-text">{title}</p>
      <p className="text-sm text-text-soft">{course}</p>
      <p className="mt-3 text-xs text-text-muted">{time}</p>
    </div>
  )
}

export default UpcomingSessionCard

