import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AdminRoute } from '@/components/auth/AdminRoute'
import * as authStore from '@/store/authStore'

describe('AdminRoute', () => {
  it('redirects unauthenticated to admin-login', () => {
    vi.spyOn(authStore, 'useAuthStore').mockReturnValue({
      user: null,
      appUser: null,
      loading: false,
      initialized: true,
      initialize: vi.fn(),
    } as any)

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/admin" element={<AdminRoute><div>Admin</div></AdminRoute>} />
          <Route path="/admin-login" element={<div>Admin Login</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText(/admin login/i)).toBeInTheDocument()
  })
})
