import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { type Task, type CreateTaskInput, type UpdateTaskInput, type TaskStats } from '../types';
import { toast } from 'sonner';

export function useTasks(filters: { search?: string, status?: string, category_id?: string | number | null } = {}) {
    return useInfiniteQuery<Task[]>({
        queryKey: ['tasks', filters],
        queryFn: async ({ pageParam = 1 }) => {
            const params = new URLSearchParams()
            params.append('page', (pageParam as number).toString())
            params.append('limit', '10')
            if (filters.search) params.append('search', filters.search)
            if (filters.status && filters.status !== 'all') params.append('status', filters.status)
            if (filters.category_id && filters.category_id !== '0') params.append('category_id', filters.category_id.toString())

            const { data } = await api.get(`/tasks?${params.toString()}`);
            return data || [];
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length === 10 ? allPages.length + 1 : undefined
        },
    });
}

export function useTaskStats() {
    return useQuery<TaskStats>({
        queryKey: ['task-stats'],
        queryFn: async () => {
            const { data } = await api.get('/tasks/stats');
            return data;
        },
    });
}

export function useCreateTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (task: CreateTaskInput) => {
            const { data } = await api.post('/tasks', task);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['task-stats'] });
            toast.success('Task created successfully');
        },
        onError: () => {
            toast.error('Failed to create task');
        }
    });
}

export function useUpdateTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...update }: { id: number } & UpdateTaskInput) => {
            const { data } = await api.put(`/tasks/${id}`, update);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['task-stats'] });
            toast.success('Task updated');
        },
        onError: () => {
            toast.error('Failed to update task');
        }
    });
}

export function useDeleteTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/tasks/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['task-stats'] });
            toast.success('Task deleted');
        },
        onError: () => {
            toast.error('Failed to delete task');
        }
    });
}
