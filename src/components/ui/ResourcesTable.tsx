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
          <tr>
            <th className="p-2 text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">Title</th>
            <th className="p-2 text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">Type</th>
            <th className="p-2 text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">Uploaded</th>
          </tr>
        </thead>
        <tbody>
          {resources.map((r) => (
            <tr key={r.id} className="border-t border-white/70 transition-colors hover:bg-primary/5">
              <td className="p-2 font-medium text-text">{r.title}</td>
              <td className="p-2 text-text-soft">{r.file_type}</td>
              <td className="p-2 text-xs text-text-muted">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ResourcesTable

