"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ChevronDown } from "lucide-react";
import { normalizeText } from "@/lib/utils/search";
import { FormField } from "./FormField";
import styles from "./Form.module.css";

export type SearchableSelectOption = {
  value: string;
  label: string;
  searchText?: string;
  hint?: string;
};

type SearchableSelectProps = {
  id: string;
  label: string;
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  emptyMessage?: string;
  noResultsMessage?: string;
};

function optionMatchesQuery(option: SearchableSelectOption, query: string) {
  if (!query) {
    return true;
  }

  const haystack = [option.label, option.searchText, option.hint].filter(Boolean).join(" ");
  return normalizeText(haystack).includes(query);
}

export function SearchableSelect({
  id,
  label,
  options,
  value,
  onChange,
  error,
  hint,
  required,
  placeholder = "Escribe para buscar…",
  disabled = false,
  emptyMessage = "No hay opciones disponibles.",
  noResultsMessage = "Sin coincidencias. Prueba con otro nombre.",
}: SearchableSelectProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeText(query);
    return options.filter((option) => optionMatchesQuery(option, normalizedQuery));
  }, [options, query]);

  const displayValue = isOpen ? query : (selectedOption?.label ?? "");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query, isOpen]);

  const openList = () => {
    if (disabled) {
      return;
    }

    setIsOpen(true);
    setQuery("");
  };

  const toggleList = () => {
    if (isOpen) {
      closeList();
      return;
    }

    openList();
    inputRef.current?.focus();
  };

  const closeList = () => {
    setIsOpen(false);
    setQuery("");
  };

  const selectOption = (option: SearchableSelectOption) => {
    onChange(option.value);
    setQuery("");
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleInputChange = (nextValue: string) => {
    setQuery(nextValue);
    setIsOpen(true);

    if (value) {
      onChange("");
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!isOpen) {
        openList();
        return;
      }

      setHighlightedIndex((current) =>
        filteredOptions.length === 0 ? 0 : Math.min(current + 1, filteredOptions.length - 1),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) {
        openList();
        return;
      }

      setHighlightedIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      if (!isOpen) {
        openList();
        return;
      }

      event.preventDefault();
      const option = filteredOptions[highlightedIndex];
      if (option) {
        selectOption(option);
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeList();
    }
  };

  const normalizedQuery = normalizeText(query);
  const isFiltering = Boolean(normalizedQuery);
  const listCaption =
    options.length === 0
      ? null
      : isFiltering
        ? filteredOptions.length === 0
          ? "Sin coincidencias"
          : `${filteredOptions.length} coincidencia${filteredOptions.length === 1 ? "" : "s"}`
        : selectedOption
          ? `${options.length} opciones · Seleccionada: ${selectedOption.label}`
          : `${options.length} opción${options.length === 1 ? "" : "es"} disponible${options.length === 1 ? "" : "s"}`;

  return (
    <FormField
      id={id}
      label={label}
      error={error}
      hint={hint}
      required={required}
    >
      <div
        ref={rootRef}
        className={[styles.searchableSelect, disabled && styles.searchableSelectDisabled]
          .filter(Boolean)
          .join(" ")}
      >
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          className={styles.searchableInput}
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          aria-invalid={Boolean(error)}
          aria-required={required}
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          onFocus={openList}
          onChange={(event) => handleInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          className={styles.searchableToggle}
          aria-label={isOpen ? "Cerrar lista" : "Abrir lista"}
          disabled={disabled}
          onClick={toggleList}
        >
          <ChevronDown
            size={14}
            strokeWidth={1.75}
            className={[styles.searchableChevron, isOpen && styles.searchableChevronOpen]
              .filter(Boolean)
              .join(" ")}
            aria-hidden="true"
          />
        </button>

        {isOpen ? (
          <div className={styles.searchableDropdown}>
            {listCaption ? (
              <p className={styles.searchableListCaption}>{listCaption}</p>
            ) : null}
            <ul id={listboxId} className={styles.searchableList} role="listbox">
            {options.length === 0 ? (
              <li className={styles.searchableEmpty} role="presentation">
                {emptyMessage}
              </li>
            ) : filteredOptions.length === 0 ? (
              <li className={styles.searchableEmpty} role="presentation">
                {noResultsMessage}
              </li>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = option.value === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <li key={option.value} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={[
                        styles.searchableOption,
                        isSelected && styles.searchableOptionSelected,
                        isHighlighted && styles.searchableOptionHighlighted,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectOption(option)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      <span className={styles.searchableOptionLabel}>{option.label}</span>
                      {option.hint ? (
                        <span className={styles.searchableOptionHint}>{option.hint}</span>
                      ) : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
          </div>
        ) : null}
      </div>
    </FormField>
  );
}
