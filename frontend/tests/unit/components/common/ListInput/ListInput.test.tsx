import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ListInput } from '@/components/common/ListInput/ListInput';

function renderListInput(props: Partial<Parameters<typeof ListInput>[0]> = {}) {
  const defaultProps = {
    id: 'list-input-test',
    labelText: 'Paths',
    tableTitle: 'Added paths',
    items: [],
    onChange: vi.fn(),
    ...props,
  };
  return render(React.createElement(ListInput, defaultProps));
}

describe('ListInput', () => {
  it('renders committed items in a table', () => {
    renderListInput({ items: ['/a', '/b'] });
    expect(screen.getByText('Added paths')).toBeDefined();
    expect(screen.getByText('/a')).toBeDefined();
    expect(screen.getByText('/b')).toBeDefined();
  });

  it('does not render the table when there are no items', () => {
    renderListInput();
    expect(screen.queryByText('Added paths')).toBeNull();
  });

  it('Add button is always visible and disabled while input is empty', () => {
    renderListInput();
    const add = screen.getByRole('button', { name: /add/i });
    expect(add).toHaveProperty('disabled', true);
  });

  it('clicking Add commits the typed text', async () => {
    const onChange = vi.fn();
    renderListInput({ items: ['/existing'], onChange });
    await userEvent.type(screen.getByRole('textbox'), '/data/documents');
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(onChange).toHaveBeenCalledWith(['/existing', '/data/documents']);
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('');
  });

  it('Enter commits the typed text', async () => {
    const onChange = vi.fn();
    renderListInput({ onChange });
    await userEvent.type(screen.getByRole('textbox'), '/x{Enter}');
    expect(onChange).toHaveBeenCalledWith(['/x']);
  });

  it('comma commits the typed text', async () => {
    const onChange = vi.fn();
    renderListInput({ onChange });
    await userEvent.type(screen.getByRole('textbox'), '/y,');
    expect(onChange).toHaveBeenCalledWith(['/y']);
  });

  it('blur does NOT commit and keeps the pending text', async () => {
    const onChange = vi.fn();
    renderListInput({ onChange });
    const input = screen.getByRole('textbox') as HTMLInputElement;
    await userEvent.type(input, '/data/documents');
    fireEvent.blur(input);
    expect(onChange).not.toHaveBeenCalled();
    expect(input.value).toBe('/data/documents');
    await userEvent.type(input, '/file.pdf');
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(onChange).toHaveBeenCalledWith(['/data/documents/file.pdf']);
  });

  it('duplicate value is not added', async () => {
    const onChange = vi.fn();
    renderListInput({ items: ['/dupe'], onChange });
    await userEvent.type(screen.getByRole('textbox'), '/dupe{Enter}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('remove button removes the item', async () => {
    const onChange = vi.fn();
    renderListInput({ items: ['/a', '/b'], onChange });
    await userEvent.click(screen.getByRole('button', { name: 'Remove /a' }));
    expect(onChange).toHaveBeenCalledWith(['/b']);
  });

  it('paginates when more than 5 items', () => {
    renderListInput({ items: ['1', '2', '3', '4', '5', '6'] });
    expect(screen.getByText('Page 1')).toBeDefined();
    expect(screen.queryByText('6')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(screen.getByText('Page 2')).toBeDefined();
    expect(screen.getByText('6')).toBeDefined();
  });
});
