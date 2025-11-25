import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CourseCatalog } from '@/pages/public/CourseCatalog'

describe('CourseCatalog', () => {
  it('renders heading', () => {
    render(
      <MemoryRouter>
        <CourseCatalog />
      </MemoryRouter>
    )

    // Look specifically for the page heading to avoid matching the loading text
    expect(screen.getByRole('heading', { name: /browse courses/i })).toBeInTheDocument()
  })
})

