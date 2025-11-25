import React, { useState, useEffect } from 'react'
import apiClient from '@/services/apiClient'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Users, Plus, Edit2, Trash2, Search } from 'lucide-react'

interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'instructor' | 'student'
  full_name?: string
  phone?: string
  created_at: string
}

interface CreateEditUserModalProps {
  user: User | null
  onClose: () => void
  onSave: () => void
}

function CreateEditUserModal({ user, onClose, onSave }: CreateEditUserModalProps) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'student',
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    bio: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const payload: any = { ...formData }
      
      // Remove password if not set (for updates)
      if (user && !payload.password) {
        delete payload.password
      }

      if (user) {
        await apiClient.put(`/api/users/${user.id}`, payload)
      } else {
        await apiClient.post('/api/users', payload)
      }

      onSave()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">
            {user ? 'Edit User' : 'Create New User'}
          </h2>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <Input
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={user ? 'Password (leave blank to keep current)' : 'Password *'}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!user}
              />

              <div>
                <label className="block text-sm font-medium mb-1">Role *</label>
                <select
                  className="w-full p-2 border rounded"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  required
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <Input
              label="Full Name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />

            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                className="w-full p-2 border rounded"
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" isLoading={loading}>
                {user ? 'Update' : 'Create'} User
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showModal, setShowModal] = useState(false)

  const loadUsers = async () => {
    try {
      const { data } = await apiClient.get('/api/users')
      setUsers(data)
      setFilteredUsers(data)
    } catch (err) {
      console.error('Failed to load users', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    let filtered = users

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter((u) => u.role === roleFilter)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredUsers(filtered)
  }, [users, roleFilter, searchTerm])

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      await apiClient.delete(`/api/users/${id}`)
      loadUsers()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete user')
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700'
      case 'instructor':
        return 'bg-blue-100 text-blue-700'
      case 'student':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
    instructors: users.filter((u) => u.role === 'instructor').length,
    students: users.filter((u) => u.role === 'student').length,
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8" />
            User Management
          </h1>
          <p className="text-text-light mt-1">Manage instructors, students, and admins</p>
        </div>
        <Button
          onClick={() => {
            setEditingUser(null)
            setShowModal(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-sm text-text-light">Total Users</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-text-light">Admins</div>
          <div className="text-2xl font-bold text-purple-600">{stats.admins}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-text-light">Instructors</div>
          <div className="text-2xl font-bold text-blue-600">{stats.instructors}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-text-light">Students</div>
          <div className="text-2xl font-bold text-green-600">{stats.students}</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <select
            className="px-4 py-2 border rounded-lg"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="instructor">Instructors</option>
            <option value="student">Students</option>
          </select>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        {loading ? (
          <div className="p-8 text-center text-text-light">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-text-light">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold">Name</th>
                  <th className="text-left p-4 font-semibold">Email</th>
                  <th className="text-left p-4 font-semibold">Role</th>
                  <th className="text-left p-4 font-semibold">Phone</th>
                  <th className="text-left p-4 font-semibold">Created</th>
                  <th className="text-right p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-medium">{user.name}</div>
                      {user.full_name && (
                        <div className="text-sm text-text-light">{user.full_name}</div>
                      )}
                    </td>
                    <td className="p-4 text-text-light">{user.email}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 text-text-light">{user.phone || '—'}</td>
                    <td className="p-4 text-text-light">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-end">
                        <button
                          className="p-2 hover:bg-gray-100 rounded"
                          onClick={() => {
                            setEditingUser(user)
                            setShowModal(true)
                          }}
                        >
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          className="p-2 hover:bg-gray-100 rounded"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showModal && (
        <CreateEditUserModal
          user={editingUser}
          onClose={() => {
            setShowModal(false)
            setEditingUser(null)
          }}
          onSave={loadUsers}
        />
      )}
    </div>
  )
}
