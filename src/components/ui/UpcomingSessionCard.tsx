interface Props {
  title: string
  time: string
  course: string
}

export const UpcomingSessionCard = ({ title, time, course }: Props) => {
  return (
    <div className="float-card w-72 p-4 mb-3">
      <div className="text-xs text-gray-500">Upcoming</div>
      <div className="font-semibold mt-1">{title}</div>
      <div className="text-sm text-gray-600">{course}</div>
      <div className="text-xs text-gray-500 mt-3">{time}</div>
    </div>
  )
}

export default UpcomingSessionCard
