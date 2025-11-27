import { render, screen, fireEvent } from '@testing-library/react';
import { Login as LoginForm } from '../pages/auth/Login';
import { MemoryRouter } from 'react-router-dom';

describe('LoginForm', () => {
  it('renders login form and submits', () => {
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    // You can mock API and check for success message here
  });
});
