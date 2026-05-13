import React from 'react';
import { useUiStore } from '../store/uiStore';

export function ThemeToggle() {
  const theme = useUiStore(state => state.theme);
  const toggleTheme = useUiStore(state => state.toggleTheme);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-text transition hover:bg-white/10"
    >
      {theme === 'dark' ? 'Dark mode' : 'Light mode'}
    </button>
  );
}
