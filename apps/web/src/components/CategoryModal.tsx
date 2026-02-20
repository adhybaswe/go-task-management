import { useState } from 'react'
import { X, Plus, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCreateCategory } from '../hooks/useCategories'
import { cn } from '../lib/utils'

interface CategoryModalProps {
    isOpen: boolean
    onClose: () => void
}

const COLORS = [
    { name: 'blue', class: 'bg-blue-500' },
    { name: 'emerald', class: 'bg-emerald-500' },
    { name: 'red', class: 'bg-red-500' },
    { name: 'amber', class: 'bg-amber-500' },
    { name: 'purple', class: 'bg-purple-500' },
    { name: 'pink', class: 'bg-pink-500' },
    { name: 'slate', class: 'bg-slate-500' },
]

export function CategoryModal({ isOpen, onClose }: CategoryModalProps) {
    const [name, setName] = useState('')
    const [selectedColor, setSelectedColor] = useState('blue')
    const createCategory = useCreateCategory()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return

        createCategory.mutate({
            name: name.trim(),
            color: selectedColor
        }, {
            onSuccess: () => {
                setName('')
                onClose()
            }
        })
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-8"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">New Category</h2>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Label Name</label>
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="e.g. Side Project"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 font-bold text-slate-700 dark:text-white focus:outline-none focus:border-primary-500 transition-all"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Color Palette</label>
                                <div className="flex flex-wrap gap-3">
                                    {COLORS.map((color) => (
                                        <button
                                            key={color.name}
                                            type="button"
                                            onClick={() => setSelectedColor(color.name)}
                                            className={cn(
                                                "w-10 h-10 rounded-full transition-all transform hover:scale-110 active:scale-90 flex items-center justify-center shadow-lg",
                                                color.class,
                                                selectedColor === color.name ? "ring-4 ring-offset-4 ring-slate-200 dark:ring-slate-700" : "opacity-80 hover:opacity-100"
                                            )}
                                        >
                                            {selectedColor === color.name && <Check className="w-5 h-5 text-white" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={createCategory.isPending || !name.trim()}
                                className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white py-4 rounded-2xl font-black shadow-xl shadow-primary-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
                            >
                                <Plus className="w-5 h-5" />
                                {createCategory.isPending ? 'DEPLOYING...' : 'CREATE CATEGORY'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
