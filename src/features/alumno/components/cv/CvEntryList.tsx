"use client";

import { Plus, Trash2 } from "lucide-react";
import styles from "./CvEntryList.module.css";

type CvEntryListProps = {
  idPrefix: string;
  items: string[];
  onChange: (items: string[]) => void;
  addLabel: string;
  placeholder: string;
  emptyHint?: string;
};

function createItemId(prefix: string, index: number) {
  return `${prefix}-${index}`;
}

export function CvEntryList({
  idPrefix,
  items,
  onChange,
  addLabel,
  placeholder,
  emptyHint,
}: CvEntryListProps) {
  const filledCount = items.filter((item) => item.trim()).length;
  const showEmptyHint = Boolean(emptyHint) && filledCount === 0;

  const updateItem = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const addItem = () => {
    onChange([...items, ""]);
  };

  const removeItem = (index: number) => {
    const next = items.filter((_, itemIndex) => itemIndex !== index);
    onChange(next.length > 0 ? next : [""]);
  };

  return (
    <div className={styles.list}>
      {showEmptyHint ? <p className={styles.emptyHint}>{emptyHint}</p> : null}

      <ul className={styles.entries}>
        {items.map((item, index) => {
          const itemId = createItemId(idPrefix, index);
          const canRemove = items.length > 1 || item.trim().length > 0;

          return (
            <li key={itemId} className={styles.entryCard}>
              <span className={styles.entryIndex} aria-hidden="true">
                {index + 1}
              </span>

              <div className={styles.entryField}>
                <input
                  id={itemId}
                  type="text"
                  className={styles.input}
                  value={item}
                  placeholder={placeholder}
                  onChange={(event) => updateItem(index, event.target.value)}
                  aria-label={`${placeholder} ${index + 1}`}
                />
              </div>

              <button
                type="button"
                className={styles.removeButton}
                onClick={() => removeItem(index)}
                disabled={!canRemove}
                aria-label={`Quitar entrada ${index + 1}`}
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>

      <button type="button" className={styles.addButton} onClick={addItem}>
        <Plus size={14} aria-hidden="true" />
        {addLabel}
      </button>
    </div>
  );
}
