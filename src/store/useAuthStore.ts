import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    user: any | null;
    setUser: (user: any) => void;
    logout: () => void;
    paxIP: string;
    setPaxIP: (ip: string) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user, paxIP: user.pax_ip || '' }),
            logout: () => set({ user: null, paxIP: '' }),
            paxIP: '',
            setPaxIP: (ip) => set({ paxIP: ip }),
        }),
        {
            name: 'fos-auth-storage',
        }
    )
);
