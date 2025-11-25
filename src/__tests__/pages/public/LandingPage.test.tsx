import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { LandingPage } from '@/pages/public/LandingPage';

describe('LandingPage', () => {
  it('renders the hero section with a call to action', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/The Future of Learning/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Browse Courses/i })).toBeInTheDocument();
  });
});
