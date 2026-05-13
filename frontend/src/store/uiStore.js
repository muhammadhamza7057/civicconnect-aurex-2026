import { create } from 'zustand';

export const useUiStore = create(set => ({
  theme: 'dark',
  sidebarOpen: false,
  initTheme: () => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('civicconnect-theme') : null;
    const nextTheme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const root = document.documentElement;
    root.classList.toggle('dark', nextTheme === 'dark');
    root.setAttribute('data-theme', nextTheme);
    set({ theme: nextTheme });
  },
  toggleTheme: () =>
    set(state => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', nextTheme === 'dark');
      document.documentElement.setAttribute('data-theme', nextTheme);
      window.localStorage.setItem('civicconnect-theme', nextTheme);
      return { theme: nextTheme };
    }),
  setSidebarOpen: value => set({ sidebarOpen: value }),
  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen }))
}));
