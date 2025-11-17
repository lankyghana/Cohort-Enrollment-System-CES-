interface Resource {
  id: string
  title: string
  file_type: string
  created_at?: string
}

interface Props {
  resources: Resource[]
}

export const ResourcesTable = ({ resources }: Props) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-xs text-gray-500">
            <th className="p-2">Title</th>
            <th className="p-2">Type</th>
            <th className="p-2">Uploaded</th>
          </tr>
        </thead>
        <tbody>
          {resources.map((r) => (
            <tr key={r.id} className="border-t hover:bg-gray-50 transition-colors">
              <td className="p-2">{r.title}</td>
              <td className="p-2">{r.file_type}</td>
              <td className="p-2 text-xs text-gray-600">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ResourcesTable
