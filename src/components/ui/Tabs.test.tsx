import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Tabs } from './Tabs';

const ITEMS = [
  { id: 'one', label: 'One' },
  { id: 'two', label: 'Two' },
  { id: 'three', label: 'Three' },
] as const;

function renderTabs() {
  return render(<Tabs items={ITEMS} label="Example" renderPanel={(id) => <p>Panel {id}</p>} />);
}

describe('Tabs', () => {
  it('shows the first panel and marks the first tab as selected', () => {
    renderTabs();
    expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel one');
  });

  it('moves selection and focus with arrow keys, Home and End', async () => {
    const user = userEvent.setup();
    renderTabs();

    await user.click(screen.getByRole('tab', { name: 'One' }));
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Two' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Three' })).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Three' })).toHaveFocus();

    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'One' })).toHaveFocus();
  });

  it('keeps only the selected tab in the tab order', () => {
    renderTabs();
    expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute('tabindex', '-1');
  });
});
