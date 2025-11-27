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

    expect(screen.getByText(/Modern cohort learning for ambitious teams/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Browse cohorts/i })).toBeInTheDocument();
  });
});
