import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/i18n';
import { Odometer } from './Odometer';

describe('Odometer', () => {
  it('exposes the final value to screen readers immediately', async () => {
    await renderWithProviders(<Odometer value={1234} prefix="<" suffix="%" />);
    expect(screen.getByText('<1,234%')).toHaveClass('sr-only');
  });

  it('formats the number with the current locale', async () => {
    await renderWithProviders(<Odometer value={1234} />, { locale: 'de' });
    expect(screen.getByText('1.234')).toBeInTheDocument();
  });

  it('renders a digit column for every digit', () => {
    const { container } = render(<Odometer value={57} format={false} />);
    expect(container.querySelectorAll('[aria-hidden] .overflow-hidden')).toHaveLength(2);
  });
});
