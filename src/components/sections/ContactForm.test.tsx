import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/i18n';
import { ContactForm } from './ContactForm';

const mockFetch = vi.fn();

function makeResponse(status: number, data?: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data ?? {}),
  } as Response;
}

const renderForm = (options?: Parameters<typeof renderWithProviders>[1]) =>
  renderWithProviders(<ContactForm />, options);

/** Fill all required fields and blur each to trigger onBlur validation */
async function fillRequired(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^Name/), 'John Smith');
  await user.tab();
  await user.type(screen.getByLabelText(/^Email/), 'john@example.com');
  await user.tab();
  await user.type(screen.getByLabelText(/^Message/), 'This is a test message, long enough.');
  await user.tab();
}

async function submitWhenEnabled(user: ReturnType<typeof userEvent.setup>) {
  const submitBtn = await screen.findByRole('button', { name: /send request/i });
  await waitFor(() => expect(submitBtn).not.toBeDisabled());
  await user.click(submitBtn);
  return submitBtn;
}

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
  mockFetch.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ContactForm', () => {
  it('renders all form fields', async () => {
    await renderForm();
    expect(screen.getByLabelText(/^Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Phone/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Subject/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Message/)).toBeInTheDocument();
  });

  it('shows validation error and blocks submit for too-short name', async () => {
    const user = userEvent.setup();
    await renderForm();

    await user.type(screen.getByLabelText(/^Name/), 'J');
    await user.tab();

    expect(await screen.findByText('At least 2 characters')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send request/i })).toBeDisabled();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('translates a visible validation error when the language changes', async () => {
    const user = userEvent.setup();
    const { i18n } = await renderForm();

    await user.type(screen.getByLabelText(/^Name/), 'J');
    await user.tab();
    expect(await screen.findByText('At least 2 characters')).toBeInTheDocument();

    await act(() => i18n.changeLanguage('ru'));
    expect(await screen.findByText(i18n.t('form:errors.nameMin'))).toBeInTheDocument();
    expect(screen.queryByText('At least 2 characters')).not.toBeInTheDocument();
  });

  it('calls fetch with correct body on valid submit', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(
      makeResponse(200, { id: '1', status: 'pending', created_at: '2026-01-01' }),
    );

    await renderForm();
    await fillRequired(user);
    await submitWhenEnabled(user);

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/feedbacks/requests');
    expect(init.method).toBe('POST');
    const body = JSON.parse(init.body as string) as Record<string, unknown>;
    expect(body.name).toBe('John Smith');
    expect(body.email).toBe('john@example.com');
  });

  it('fills the subject when an interest chip is clicked', async () => {
    const user = userEvent.setup();
    await renderForm();

    const chip = screen.getByRole('button', { name: 'AI orchestrator' });
    await user.click(chip);

    expect(chip).toHaveAttribute('aria-pressed', 'true');
    // Тема «впечатывается» по буквам
    await waitFor(() => expect(screen.getByLabelText(/^Subject/)).toHaveValue('AI orchestrator'));
  });

  it('does not overwrite a subject typed by the user', async () => {
    const user = userEvent.setup();
    await renderForm();

    await user.type(screen.getByLabelText(/^Subject/), 'My own topic');
    await user.click(screen.getByRole('button', { name: 'Client portal' }));

    expect(screen.getByLabelText(/^Subject/)).toHaveValue('My own topic');
  });

  it('preselects the subject passed through router state', async () => {
    await renderForm({
      router: {
        initialEntries: [
          { pathname: '/', hash: '#contact', state: { subjectKey: 'supportAgent' } },
        ],
      },
    });

    expect(screen.getByRole('button', { name: '24/7 support agent' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByLabelText(/^Subject/)).toHaveValue('24/7 support agent');
  });

  it('shows success card after successful submit', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(
      makeResponse(200, { id: '1', status: 'pending', created_at: '2026-01-01' }),
    );

    await renderForm();
    await fillRequired(user);
    await submitWhenEnabled(user);

    expect(await screen.findByText(/thank you/i, {}, { timeout: 3000 })).toBeInTheDocument();
  });

  it('maps 422 details to field errors', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(
      makeResponse(422, {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: [{ field: 'email', message: 'This email is already registered' }],
        },
      }),
    );

    await renderForm();
    await fillRequired(user);
    await submitWhenEnabled(user);

    expect(await screen.findByText('This email is already registered')).toBeInTheDocument();
  });

  it('shows error toast on 500 response', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(makeResponse(500));

    await renderForm();
    await fillRequired(user);
    await submitWhenEnabled(user);

    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('does not call fetch when honeypot is filled', async () => {
    const user = userEvent.setup();
    await renderForm();
    await fillRequired(user);

    const submitBtn = await screen.findByRole('button', { name: /send request/i });
    await waitFor(() => expect(submitBtn).not.toBeDisabled());

    // Simulate bot filling the hidden honeypot field
    const honeypot = document.querySelector('input[name="website"]') as HTMLInputElement;
    Object.defineProperty(honeypot, 'value', { value: 'http://spam.com', writable: true });

    await user.click(submitBtn);

    await waitFor(() => expect(screen.queryByText(/thank you/i)).toBeInTheDocument(), {
      timeout: 3000,
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('disables submit button while submitting (no double submit)', async () => {
    const user = userEvent.setup();
    let resolveRequest!: (v: Response) => void;
    mockFetch.mockReturnValue(
      new Promise<Response>((r) => {
        resolveRequest = r;
      }),
    );

    await renderForm();
    await fillRequired(user);
    const submitBtn = await submitWhenEnabled(user);

    expect(await screen.findByText(/sending/i)).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();
    expect(mockFetch).toHaveBeenCalledTimes(1);

    resolveRequest(makeResponse(200, { id: '1', status: 'pending', created_at: '2026-01-01' }));
    await waitFor(() => expect(screen.queryByText(/thank you/i)).toBeInTheDocument(), {
      timeout: 3000,
    });
  });
});
