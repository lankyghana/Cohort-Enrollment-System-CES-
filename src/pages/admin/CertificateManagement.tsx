import { Card } from '@/components/ui/Card'

export const CertificateManagement = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">Certificate Management</h1>
      </div>

      <Card className="p-6">
        <p className="text-gray-600">Manage certificate templates, issuance rules, and bulk certificate generation for students.</p>
      </Card>
    </div>
  )
}

