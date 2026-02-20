import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { type Category } from '../types'

import { toast } from 'sonner'

export function useCategories() {
    return useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data } = await api.get('/categories')
            return data
        },
    })
}

export function useCreateCategory() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (newCategory: Pick<Category, 'name' | 'color'>) => {
            const { data } = await api.post('/categories', newCategory)
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            toast.success('Category created successfully')
        },
        onError: () => {
            toast.error('Failed to create category')
        }
    })
}
