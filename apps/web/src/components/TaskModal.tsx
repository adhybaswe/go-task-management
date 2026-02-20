import { useState, useEffect } from 'react'
import { X, Save, ChevronDown, Check, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react'
import * as Select from '@radix-ui/react-select'
import { motion, AnimatePresence } from 'framer-motion'
import { type Task, type UpdateTaskInput } from '../types'
import { cn } from '../lib/utils'
import { DatePicker } from './ui/DatePicker'
import { useCategories } from '../hooks/useCategories'

interface TaskModalProps {
    task: Task | null
    isOpen: boolean
    onClose: () => void
    onSave: (id: number, data: UpdateTaskInput) => void
    isSaving: boolean
}

export function TaskModal({ task, isOpen, onClose, onSave, isSaving }: TaskModalProps) {
    const { data: categories = [] } = useCategories()
    const [title, setTitle] = useState(() => task?.title || '')
    const [description, setDescription] = useState(() => task?.description || '')
    const [priority, setPriority] = useState<string>(() => task?.priority || 'medium')
    const [status, setStatus] = useState<string>(() => task?.status || 'pending')
    const [categoryId, setCategoryId] = useState<string>(() => task?.category_id?.toString() || '0')
    const [dueDate, setDueDate] = useState<Date | undefined>(() => {
        if (!task?.due_date) return undefined
        return new Date(task.due_date)
    })

    const [subtasks, setSubtasks] = useState<{ id?: number, title: string, is_completed: boolean }[]>(() =>
        task?.subtasks?.map(s => ({ id: s.id, title: s.title, is_completed: s.is_completed })) || []
    )
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('')

    useEffect(() => {
        if (task && isOpen) {
            setTitle(task.title || '')
            setDescription(task.description || '')
            setPriority(task.priority || 'medium')
            setStatus(task.status || 'pending')
            setCategoryId(task.category_id?.toString() || '0')
            setDueDate(task.due_date ? new Date(task.due_date) : undefined)
            setSubtasks(task.subtasks?.map(s => ({ id: s.id, title: s.title, is_completed: s.is_completed })) || [])
        }
    }, [task, isOpen])

    const addSubtask = () => {
        if (!newSubtaskTitle.trim()) return
        setSubtasks([...subtasks, { title: newSubtaskTitle.trim(), is_completed: false }])
        setNewSubtaskTitle('')
    }

    const toggleSubtask = (index: number) => {
        const updated = [...subtasks]
        updated[index].is_completed = !updated[index].is_completed
        setSubtasks(updated)
    }

    const removeSubtask = (index: number) => {
        setSubtasks(subtasks.filter((_, i) => i !== index))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        let formattedDueDate: string | undefined = undefined;
        if (dueDate) {
            formattedDueDate = dueDate.toISOString();
        }

        onSave(task!.id, {
            title,
            description,
            priority: priority as any,
            status: status as any,
            category_id: categoryId && categoryId !== '0' ? parseInt(categoryId) : undefined,
            due_date: formattedDueDate as any,
            subtasks: subtasks as any
        })
    }

    return (
        <AnimatePresence>
            {isOpen && task && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal core */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/30 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-8 bg-primary-500 rounded-full" />
                                <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Edit Objective</h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 dark:text-slate-500 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                            <form id="task-form" onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Title</label>
                                    <input
                                        type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-lg font-bold text-slate-700 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium"
                                        placeholder="Task title"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Description</label>
                                    <textarea
                                        value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all resize-none font-medium"
                                        placeholder="Add more details about this mission..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Priority</label>
                                        <CustomSelect value={priority} onValueChange={setPriority} options={[{ value: 'low', label: 'Low', color: 'bg-blue-500' }, { value: 'medium', label: 'Medium', color: 'bg-amber-500' }, { value: 'high', label: 'High', color: 'bg-red-500' }]} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Status</label>
                                        <CustomSelect value={status} onValueChange={setStatus} options={[{ value: 'pending', label: 'Pending' }, { value: 'in_progress', label: 'In Progress' }, { value: 'completed', label: 'Completed' }]} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Category</label>
                                        <CustomSelect
                                            value={categoryId}
                                            onValueChange={setCategoryId}
                                            options={[
                                                { value: '0', label: 'None' },
                                                ...categories.map(c => ({
                                                    value: c.id.toString(),
                                                    label: c.name,
                                                    color: c.color === 'blue' ? 'bg-blue-500' :
                                                        c.color === 'emerald' ? 'bg-emerald-500' :
                                                            c.color === 'red' ? 'bg-red-500' :
                                                                c.color === 'amber' ? 'bg-amber-500' : 'bg-slate-500'
                                                }))
                                            ]}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Deadline (Optional)</label>
                                        <DatePicker date={dueDate} setDate={setDueDate} placeholder="Set mission deadline" />
                                    </div>
                                </div>

                                {/* Subtasks Section */}
                                <div className="space-y-4 pt-2">
                                    <label className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Steps to Achieve</label>

                                    <div className="space-y-3">
                                        <AnimatePresence initial={false}>
                                            {subtasks.map((sub, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl group transition-all hover:border-primary-500/30"
                                                >
                                                    <button type="button" onClick={() => toggleSubtask(index)} className="shrink-0 transition-transform active:scale-90">
                                                        {sub.is_completed ? (
                                                            <CheckCircle2 className="w-6 h-6 text-primary-500" />
                                                        ) : (
                                                            <Circle className="w-6 h-6 text-slate-300 dark:text-slate-700" />
                                                        )}
                                                    </button>
                                                    <span className={cn(
                                                        "flex-1 font-bold text-slate-700 dark:text-slate-200",
                                                        sub.is_completed && "line-through text-slate-400 dark:text-slate-600"
                                                    )}>{sub.title}</span>
                                                    <button type="button" onClick={() => removeSubtask(index)} className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-xl transition-all">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>

                                    <div className="flex gap-2">
                                        <input
                                            type="text" value={newSubtaskTitle}
                                            onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                                            className="flex-1 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 font-bold text-slate-600 dark:text-white focus:outline-none focus:border-primary-500 transition-all uppercase text-xs tracking-widest"
                                            placeholder="Insert new step..."
                                        />
                                        <button type="button" onClick={addSubtask} className="p-4 bg-slate-100 dark:bg-slate-800 hover:bg-primary-500 hover:text-white text-slate-500 dark:text-slate-400 rounded-2xl transition-all active:scale-95">
                                            <Plus className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="p-8 border-t border-slate-50 dark:border-slate-800 bg-slate-50/10 shrink-0 flex gap-3">
                            <button type="button" onClick={onClose} className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 py-4 rounded-2xl font-bold transition-all active:scale-95">
                                Cancel
                            </button>
                            <button type="submit" form="task-form" disabled={isSaving} className="flex-[2] bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary-500/40 transition-all active:scale-95 flex items-center justify-center gap-2">
                                <Save className="w-5 h-5" />
                                {isSaving ? 'Updating...' : 'Save Changes'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

function CustomSelect({ value, onValueChange, options }: {
    value: string,
    onValueChange: (v: string) => void,
    options: { value: string, label: string, color?: string }[]
}) {
    return (
        <Select.Root value={value || '0'} onValueChange={onValueChange}>
            <Select.Trigger className="w-full flex items-center justify-between bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 font-bold text-slate-700 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all group">
                <Select.Value placeholder="Select...">
                    {options.find(o => o.value === value)?.label}
                </Select.Value>
                <Select.Icon>
                    <ChevronDown className="w-5 h-5 text-slate-400 dark:text-slate-600 group-data-[state=open]:rotate-180 transition-transform" />
                </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
                <Select.Content className="overflow-hidden bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                    <Select.Viewport className="p-2">
                        {options.map((opt) => (
                            <Select.Item key={opt.value} value={opt.value} className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer data-[highlighted]:bg-slate-50 dark:data-[highlighted]:bg-slate-800 data-[highlighted]:text-primary-600 dark:data-[highlighted]:text-primary-400 transition-colors">
                                <div className="flex items-center gap-3">
                                    {opt.color && <div className={cn("w-2 h-2 rounded-full", opt.color)} />}
                                    <Select.ItemText>{opt.label}</Select.ItemText>
                                </div>
                                <Select.ItemIndicator><Check className="w-4 h-4 text-primary-500" /></Select.ItemIndicator>
                            </Select.Item>
                        ))}
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    )
}
