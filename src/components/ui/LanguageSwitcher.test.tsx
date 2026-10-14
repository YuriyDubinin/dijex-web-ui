import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/i18n';
import { LOCALE_STORAGE_KEY } from '@/i18n/config';
import { LanguageSwitcher } from './LanguageSwitcher';

afterEach(() => {
  window.localStorage.clear();
});

describe('LanguageSwitcher', () => {
  it('opens with the keyboard and marks the current language as selected', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<LanguageSwitcher />);

    const trigger = screen.getByRole('button', { name: /site language: english/i });
    trigger.focus();
    await user.keyboard('{ArrowDown}');

    const listbox = await screen.findByRole('listbox');
    expect(listbox).toHaveFocus();
    expect(screen.getByRole('option', { name: /english/i })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getAllByRole('option')).toHaveLength(7);
  });

  it('moves the active option with arrows and selects with Enter', async () => {
    const user = userEvent.setup();
    const { i18n } = await renderWithProviders(<LanguageSwitcher />);

    screen.getByRole('button', { name: /site language/i }).focus();
    await user.keyboard('{ArrowDown}');
    const listbox = await screen.findByRole('listbox');

    await user.keyboard('{ArrowDown}');
    const russian = screen.getByRole('option', { name: /русский/i });
    expect(listbox).toHaveAttribute('aria-activedescendant', russian.id);

    await user.keyboard('{Enter}');
    await waitFor(() => expect(i18n.language).toBe('ru'));
    expect(document.documentElement.lang).toBe('ru');
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('ru');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument(), {
      timeout: 3000,
    });
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<LanguageSwitcher />);

    const trigger = screen.getByRole('button', { name: /site language/i });
    await user.click(trigger);
    await screen.findByRole('listbox');

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument(), {
      timeout: 3000,
    });
    expect(trigger).toHaveFocus();
  });

  it('jumps to a language by the first letter of its English name', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<LanguageSwitcher />);

    await user.click(screen.getByRole('button', { name: /site language/i }));
    const listbox = await screen.findByRole('listbox');

    await user.keyboard('j');
    expect(listbox).toHaveAttribute(
      'aria-activedescendant',
      screen.getByRole('option', { name: /日本語/ }).id,
    );
  });
});
