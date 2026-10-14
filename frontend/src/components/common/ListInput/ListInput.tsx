import React, { useState } from 'react';
import {
  Button,
  IconButton,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TextInput,
} from '@carbon/react';
import { Add, SubtractAlt } from '@carbon/icons-react';
import styles from './ListInput.module.scss';

const PAGE_SIZE = 5;

/**
 * Props for {@link ListInput}.
 */
interface ListInputProps {
  /** HTML `id` forwarded to the underlying `TextInput`. */
  id: string;
  /** Controlled list of committed items. */
  items: string[];
  /** Called with the updated array whenever an item is added or removed. */
  onChange: (items: string[]) => void;
  /** Accessible label for the text input (visually hidden). */
  labelText: string;
  /** Header text of the table listing the committed items. */
  tableTitle: string;
  /** Placeholder shown inside the text input when empty. */
  placeholder?: string;
  /** Helper text rendered below the input. */
  helperText?: string;
}

/**
 * Text input with an explicit **Add +** button and a table of committed items.
 *
 * Behaviour:
 * - Pending text is committed only on Enter, comma, or clicking **Add +**.
 * - Losing focus never commits or clears the pending text, so users can switch
 *   to another application (e.g. to copy a filename) and return to append.
 * - Adding a value that already exists is a no-op (the input is still cleared).
 * - Each row has a remove button; the table is paginated.
 */
export function ListInput({
  id,
  items,
  onChange,
  labelText,
  tableTitle,
  placeholder,
  helperText,
}: ListInputProps): React.JSX.Element {
  const [inputValue, setInputValue] = useState('');
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const commit = (): void => {
    const trimmed = inputValue.trim().replace(/,+$/, '').trim();
    if (trimmed && !items.includes(trimmed)) {
      onChange([...items, trimmed]);
    }
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    }
  };

  const handleRemove = (item: string): void => {
    onChange(items.filter((i) => i !== item));
  };

  return (
    <div className={styles.wrapper}>
      <TextInput
        id={id}
        labelText={labelText}
        hideLabel
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => { setInputValue(e.target.value); }}
        onKeyDown={handleKeyDown}
        helperText={helperText}
      />

      <Button
        kind="tertiary"
        size="md"
        renderIcon={Add}
        className={styles.addButton}
        disabled={!inputValue.trim()}
        onClick={commit}
      >
        Add
      </Button>

      {items.length > 0 && (
        <div className={styles.tableWrapper}>
          <Table size="lg" aria-label={tableTitle}>
            <TableHead>
              <TableRow>
                <TableHeader colSpan={2}>{tableTitle}</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {pageItems.map((item) => (
                <TableRow key={item}>
                  <TableCell className={styles.valueCell}>{item}</TableCell>
                  <TableCell className={styles.removeCell}>
                    <IconButton
                      kind="ghost"
                      size="sm"
                      label={`Remove ${item}`}
                      onClick={() => { handleRemove(item); }}
                    >
                      <SubtractAlt />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {pageCount > 1 && (
            <Pagination
              page={currentPage}
              pageSize={PAGE_SIZE}
              pageSizes={[PAGE_SIZE]}
              totalItems={items.length}
              onChange={({ page: p }) => { setPage(p); }}
            />
          )}
        </div>
      )}
    </div>
  );
}
