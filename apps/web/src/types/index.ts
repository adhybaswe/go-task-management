export interface User {
    id: number;
    username: string;
    email: string;
    created_at: string;
    updated_at: string;
}

export interface Subtask {
    id: number;
    task_id: number;
    title: string;
    is_completed: boolean;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: number;
    user_id: number;
    name: string;
    color: string;
}

export interface Task {
    id: number;
    user_id: number;
    category_id?: number;
    category?: Category;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    due_date?: string;
    subtasks: Subtask[];
    created_at: string;
    updated_at: string;
}

export type CreateTaskInput = Pick<Task, 'title' | 'description' | 'priority' | 'due_date' | 'category_id'> & {
    subtasks?: Pick<Subtask, 'title' | 'is_completed'>[];
};
export type UpdateTaskInput = Partial<CreateTaskInput & {
    status: Task['status'];
    subtasks: (Pick<Subtask, 'title' | 'is_completed'> & { id?: number })[];
}>;

export interface AuthResponse {
    token: string;
    user: User;
}

export interface TaskStats {
    total: number;
    completed: number;
    pending: number;
    high: number;
    overdue: number;
    dueToday: number;
    chartData: { date: string; count: number }[];
}
