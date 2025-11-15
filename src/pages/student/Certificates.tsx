import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/services/supabase'

type Cert = { id: string; certificate_url: string; course_id: string; issued_at: string }

export const Certificates = () => {
  const { user } = useAuthStore()
  const [certs, setCerts] = useState<Cert[]>([])

  useEffect(() => {
    if (!user) return

    const fetch = async () => {
      try {
        const { data } = await supabase
          .from('certificates')
          .select('*')
          .eq('student_id', user.id)
          .order('issued_at', { ascending: false })

        setCerts((data as Cert[]) || [])
      } catch (err) {
        setCerts([])
      }
    }

    fetch()
  }, [user])

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold mb-6">Certificates</h1>
      <div className="grid grid-cols-1 gap-3">
        {certs.map((c) => (
          <Card key={c.id}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Certificate for course {c.course_id}</div>
                <div className="text-text-light text-sm">Issued: {new Date(c.issued_at).toLocaleDateString()}</div>
              </div>
              <div>
                <Button asChild>
                  <a href={c.certificate_url} target="_blank" rel="noreferrer" download>
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

