// @flow
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';

import { getProductNames } from './lampData.js';

type Props = {
  value: string,
  onChange: (name: string) => void,
};

export default function LampSelector({
  value,
  onChange,
}: Props): React.Element<'div'> {
  const allProducts = getProductNames();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside.
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains((e.target: any))
      ) {
        setIsOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = query
    ? allProducts.filter((name) =>
        name.toLowerCase().includes(query.toLowerCase()),
      )
    : allProducts;

  function select(name: string) {
    onChange(name);
    setIsOpen(false);
    setQuery('');
  }

  return (
    <div className="lamp-selector" ref={containerRef}>
      <div className="lamp-selector-input-row">
        <input
          type="text"
          className="lamp-selector-input"
          placeholder={value}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <button
          type="button"
          className="lamp-selector-caret"
          onClick={() => {
            setIsOpen(!isOpen);
            setQuery('');
          }}
        >
          {isOpen ? '\u25B2' : '\u25BC'}
        </button>
      </div>
      {isOpen && (
        <div className="lamp-selector-dropdown">
          {filtered.length === 0 && (
            <div className="lamp-selector-option empty">No matches</div>
          )}
          {filtered.map((name) => (
            <div
              key={name}
              className={`lamp-selector-option${
                name === value ? ' selected' : ''
              }`}
              onClick={() => select(name)}
            >
              {name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
