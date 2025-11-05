import { create } from "zustand";

/**
 * Example Zustand store for managing application state
 *
 * Usage:
 * ```tsx
 * import { useCounterStore } from '@/stores/exampleStore'
 *
 * function MyComponent() {
 *   const count = useCounterStore((state) => state.count)
 *   const increment = useCounterStore((state) => state.increment)
 *
 *   return (
 *     <div>
 *       <p>Count: {count}</p>
 *       <button onClick={increment}>Increment</button>
 *     </div>
 *   )
 * }
 * ```
 */

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));

/**
 * Example: Store with async actions
 */
interface UserState {
  user: { id: string; name: string } | null;
  isLoading: boolean;
  error: string | null;
  fetchUser: (userId: string) => Promise<void>;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  fetchUser: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      const response = await fetch(`/api/users/${userId}`);
      const user = await response.json();
      set({ user, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      });
    }
  },
  clearUser: () => set({ user: null, error: null }),
}));
