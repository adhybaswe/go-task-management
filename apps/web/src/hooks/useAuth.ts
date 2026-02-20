import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { type AuthResponse, type User } from '../types';
import { create } from 'zustand';
import { toast } from 'sonner';

interface AuthState {
    user: User | null;
    token: string | null;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token'),
    setAuth: (user, token) => {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        set({ user, token });
    },
    logout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        set({ user: null, token: null });
        toast.info('Logged out successfully');
    },
}));

export function useLogin() {
    const setAuth = useAuthStore((state) => state.setAuth);
    return useMutation({
        mutationFn: async (credentials: any) => {
            const { data } = await api.post<AuthResponse>('/auth/login', credentials);
            return data;
        },
        onSuccess: (data) => {
            setAuth(data.user, data.token);
            toast.success(`Welcome back, ${data.user.username}!`);
        },
        onError: (error: any) => {
            const message = error.response?.data?.error || 'Login failed';
            toast.error(message);
        }
    });
}

export function useRegister() {
    return useMutation({
        mutationFn: async (userData: any) => {
            const { data } = await api.post<AuthResponse>('/auth/register', userData);
            return data;
        },
        onSuccess: () => {
            toast.success('Account created! You can now sign in.');
        },
        onError: (error: any) => {
            const message = error.response?.data?.error || 'Registration failed';
            toast.error(message);
        }
    });
}
