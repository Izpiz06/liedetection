import { create } from 'zustand';

const useStore = create((set, get) => ({
  // Auth state
  user: JSON.parse(localStorage.getItem('rs_user') || 'null'),
  token: localStorage.getItem('rs_token') || null,
  isAuthenticated: !!localStorage.getItem('rs_token'),

  setAuth: (user, token) => {
    localStorage.setItem('rs_user', JSON.stringify(user));
    localStorage.setItem('rs_token', token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('rs_user');
    localStorage.removeItem('rs_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (user) => {
    localStorage.setItem('rs_user', JSON.stringify(user));
    set({ user });
  },

  // Theme state
  darkMode: localStorage.getItem('rs_theme') === 'dark',
  toggleDarkMode: () => {
    const newMode = !get().darkMode;
    localStorage.setItem('rs_theme', newMode ? 'dark' : 'light');
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ darkMode: newMode });
  },

  // Toast notifications
  toasts: [],
  addToast: (message, type = 'info', duration = 4000) => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  // Sidebar
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));

// Initialize dark mode on load
if (localStorage.getItem('rs_theme') === 'dark') {
  document.documentElement.classList.add('dark');
}

export default useStore;
