import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/services/supabase'

type Resource = {
  id: string
  title: string
  description?: string | null
  file_url: string
  file_type: string
}

export const Resources = () => {
  const { id } = useParams<{ id: string }>()
  const [resources, setResources] = useState<Resource[]>([])

  useEffect(() => {
    if (!id) return

    const fetch = async () => {
      try {
        const { data } = await supabase
          .from('resources')
          .select('*')
          .eq('course_id', id)
          .order('order_index', { ascending: true })

        setResources((data as Resource[]) || [])
      } catch (err) {
        setResources([])
      }
    }

    fetch()
  }, [id])

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold mb-6">Resources</h1>
      <div className="grid grid-cols-1 gap-3">
        {resources.map((r) => (
          <Card key={r.id}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{r.title}</div>
                {r.description && <div className="text-text-light text-sm">{r.description}</div>}
              </div>
              <div>
                <Button asChild>
                  <a href={r.file_url} target="_blank" rel="noreferrer" download>
                    Download
                  </a>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

