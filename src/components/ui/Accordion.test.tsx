import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Accordion } from './Accordion';

const ITEMS = [
  { id: 'a', title: 'Question A', content: 'Answer A' },
  { id: 'b', title: 'Question B', content: 'Answer B' },
];

describe('Accordion', () => {
  it('opens the default item and reflects state in aria-expanded', () => {
    render(<Accordion items={ITEMS} defaultOpenIds={['a']} />);
    expect(screen.getByRole('button', { name: 'Question A' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Question B' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.getByText('Answer A')).toBeInTheDocument();
  });

  it('opens one item at a time by default', async () => {
    const user = userEvent.setup();
    render(<Accordion items={ITEMS} defaultOpenIds={['a']} />);

    await user.click(screen.getByRole('button', { name: 'Question B' }));
    expect(screen.getByRole('button', { name: 'Question B' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Question A' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('allows several open items with multiple', async () => {
    const user = userEvent.setup();
    render(<Accordion items={ITEMS} multiple defaultOpenIds={['a']} />);

    await user.click(screen.getByRole('button', { name: 'Question B' }));
    expect(screen.getByRole('button', { name: 'Question A' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Question B' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('links the button and the region', () => {
    render(<Accordion items={ITEMS} defaultOpenIds={['a']} />);
    const button = screen.getByRole('button', { name: 'Question A' });
    const region = screen.getByRole('region', { name: 'Question A' });
    expect(button).toHaveAttribute('aria-controls', region.id);
  });
});
