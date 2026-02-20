import { useState, useMemo, useEffect, useRef } from 'react'
import { Plus, Trash2, CheckCircle2, Clock, AlertCircle, Loader2, LogOut, User as UserIcon, Search, Edit3, MessageSquare, Moon, Sun, TrendingUp, Calendar, CheckSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster } from 'sonner'
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useTaskStats } from './hooks/useTasks'
import { useCategories } from './hooks/useCategories'
import { useAuthStore } from './hooks/useAuth'
import { useThemeStore } from './hooks/useTheme'
import { AuthPage } from './components/AuthPage'
import { TaskModal } from './components/TaskModal'
import { CategoryModal } from './components/CategoryModal'
import { useThemeObserver } from './hooks/useThemeObserver'
import { cn } from './lib/utils'
import { type Task } from './types'

type FilterStatus = 'all' | 'pending' | 'completed'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
} as const

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100
    }
  }
} as const

function App() {
  useThemeObserver()
  const { user, logout } = useAuthStore()
  const { isDarkMode, toggleTheme } = useThemeStore()
  const [title, setTitle] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useTasks({
    search,
    status: filter,
    category_id: selectedCategoryId
  })

  const { data: serverStats } = useTaskStats()

  // Flatten tasks from pages
  const tasks: Task[] = useMemo(() => {
    return data?.pages.flat() || []
  }, [data])

  const { data: categories = [] } = useCategories()

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 1.0 }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()

  const stats = useMemo(() => {
    const defaultStats = {
      total: 0,
      completed: 0,
      pending: 0,
      percent: 0,
      high: 0,
      overdue: 0,
      dueToday: 0,
      chartData: [] as { date: string, count: number }[]
    }
    if (!serverStats) return defaultStats

    return {
      ...serverStats,
      percent: serverStats.total > 0 ? Math.round((serverStats.completed / serverStats.total) * 100) : 0
    }
  }, [serverStats])

  const filteredTasks = tasks // Already filtered by server

  if (!user) {
    return <AuthPage />
  }

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    createTask.mutate({ title, priority: 'medium', description: '' })
    setTitle('')
  }

  const toggleStatus = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
    updateTask.mutate({ id, status: newStatus })
  }

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString()
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Focus Flow</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">Master your day, one task at a time.</p>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-3"
          >
            <button
              onClick={toggleTheme}
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 shadow-inner">
                <UserIcon className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">User Profile</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-none">{user.username}</p>
              </div>
              <button
                onClick={logout}
                className="ml-2 p-2.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 rounded-xl transition-all active:scale-95"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </header>

        {/* Daily Focus Banner */}
        <AnimatePresence>
          {(stats.overdue > 0 || stats.dueToday > 0) && (
            <motion.section
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: 'auto', opacity: 1, marginBottom: 32 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className={cn(
                "p-6 rounded-[2rem] border flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden",
                stats.overdue > 0
                  ? "bg-red-500 text-white border-red-400 shadow-xl shadow-red-500/20"
                  : "bg-primary-600 text-white border-primary-500 shadow-xl shadow-primary-500/20"
              )}>
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />

                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 border border-white/30">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight leading-tight">
                      {stats.overdue > 0 ? "Immediate Action Required!" : "Your Mission for Today"}
                    </h2>
                    <p className="text-white/80 font-medium text-sm">
                      {stats.overdue > 0
                        ? `You have ${stats.overdue} overdue missions that need your attention.`
                        : `Focus! You have ${stats.dueToday} missions ending before midnight.`}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 relative z-10">
                  <button
                    onClick={() => {
                      setFilter('pending');
                      setSearch('');
                      setSelectedCategoryId(null);
                    }}
                    className="px-6 py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/90 transition-all active:scale-95"
                  >
                    View Missions
                  </button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <main className="grid gap-8">
          {/* Productivity Dashboard */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-500/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
              <div className="flex justify-between items-start relative z-10">
                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-2xl text-primary-600 dark:text-primary-400">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.percent}%</span>
              </div>
              <div className="mt-4 relative z-10 flex-1 flex flex-col justify-end">
                <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Productivity Chart</p>
                <div className="flex items-end gap-1.5 h-12">
                  {stats.chartData.map((d, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${(d.count / (Math.max(...stats.chartData.map(c => c.count)) || 1)) * 100}%` }}
                      className="flex-1 bg-primary-500/20 hover:bg-primary-500 rounded-t-sm transition-colors relative group/bar"
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-900 text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20">
                        {d.count} missions
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="flex justify-between mt-1 px-0.5">
                  {stats.chartData.map((d, i) => (
                    <span key={i} className="text-[8px] font-bold text-slate-300 dark:text-slate-700 uppercase">{d.date[0]}</span>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
              <div className="flex justify-between items-start relative z-10">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600 dark:text-emerald-400">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.completed}/{stats.total}</span>
              </div>
              <div className="mt-4 relative z-10">
                <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Missions Accomplished</p>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mt-1">
                  {stats.pending === 0 ? "All clear!" : `${stats.pending} remaining missions`}
                </p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none sm:col-span-2 lg:col-span-1 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
              <div className="flex justify-between items-start relative z-10">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl text-red-600 dark:text-red-400">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.high}</span>
              </div>
              <div className="mt-4 relative z-10">
                <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">High Alert</p>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mt-1 italic">
                  {stats.high > 0 ? "Immediate attention required" : "No critical threats"}
                </p>
              </div>
            </motion.div>
          </motion.section>

          {/* Create Task Form */}
          <motion.form
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleCreateTask}
            className="relative group"
          >
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Record a new mission..."
              className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] pl-8 pr-48 py-7 text-lg shadow-2xl shadow-slate-200/40 dark:shadow-none focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600 dark:text-white"
            />
            <button
              disabled={createTask.isPending}
              className="absolute right-3 top-3 bottom-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-10 rounded-[1.8rem] font-bold shadow-lg shadow-primary-500/40 transition-all active:scale-95 flex items-center gap-2"
            >
              {createTask.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              <span>Deploy</span>
            </button>
          </motion.form>

          {/* Filtering & Search Bar */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm"
          >
            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-600" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search mission..."
                className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500/20 transition-all dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl w-full md:w-auto">
              {(['all', 'pending', 'completed'] as FilterStatus[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "flex-1 md:flex-none px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all relative",
                    filter === f
                      ? "text-primary-600 dark:text-primary-400"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  {filter === f && (
                    <motion.div
                      layoutId="filter-pill"
                      className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-sm z-0"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{f}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Category Chips Filter */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar px-1"
          >
            <button
              onClick={() => setSelectedCategoryId(null)}
              className={cn(
                "whitespace-nowrap px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0",
                selectedCategoryId === null
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg"
                  : "bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              )}
            >
              All Regions
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id === selectedCategoryId ? null : cat.id)}
                className={cn(
                  "whitespace-nowrap px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 shrink-0",
                  selectedCategoryId === cat.id
                    ? cn(
                      "text-white shadow-lg",
                      cat.color === 'blue' ? 'bg-blue-600 border-blue-600' :
                        cat.color === 'emerald' ? 'bg-emerald-600 border-emerald-600' :
                          cat.color === 'red' ? 'bg-red-600 border-red-600' :
                            cat.color === 'amber' ? 'bg-amber-600 border-amber-600' : 'bg-slate-600 border-slate-600'
                    )
                    : "bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                <div className={cn("w-1.5 h-1.5 rounded-full",
                  cat.color === 'blue' ? 'bg-blue-500' :
                    cat.color === 'emerald' ? 'bg-emerald-500' :
                      cat.color === 'red' ? 'bg-red-500' :
                        cat.color === 'amber' ? 'bg-amber-500' : 'bg-slate-500',
                  selectedCategoryId === cat.id && "bg-white"
                )} />
                {cat.name}
              </button>
            ))}
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="whitespace-nowrap px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary-500 hover:text-primary-500 flex items-center gap-2"
            >
              <Plus className="w-3 h-3" />
              New Label
            </button>
          </motion.div>

          {/* Task List */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden"
          >
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-primary-500 rounded-full" />
                <h2 className="text-xl font-black text-slate-800 dark:text-slate-200 tracking-tight">Objective Journal</h2>
              </div>
              <div className="flex gap-3">
                <span className="px-5 py-2 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                  Active: {filteredTasks.length}
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-50 dark:divide-slate-800 min-h-[200px]">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-24 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-6"
                  >
                    <Loader2 className="w-16 h-16 animate-spin text-primary-500" />
                    <p className="font-bold tracking-tight">Syncing with headquarters...</p>
                  </motion.div>
                ) : filteredTasks.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600"
                  >
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-3xl flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-10 h-10 opacity-20" />
                    </div>
                    <p className="font-bold text-lg">No missions found</p>
                    <p className="text-sm">Try adjusting your filters or search query.</p>
                  </motion.div>
                ) : (
                  filteredTasks.map((task: Task) => (
                    <motion.div
                      layout
                      key={task.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-8 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all flex items-center justify-between group relative overflow-hidden cursor-pointer border-l-4 border-transparent hover:border-primary-500"
                      onClick={() => setSelectedTask(task)}
                    >
                      <div className="flex items-center gap-8">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleStatus(task.id, task.status)
                          }}
                          className={cn(
                            "w-10 h-10 rounded-[1rem] border-2 flex items-center justify-center transition-all transform active:scale-90 shadow-sm",
                            task.status === 'completed'
                              ? 'bg-emerald-500 border-emerald-500 shadow-emerald-200'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary-400 group-hover:scale-105'
                          )}
                        >
                          {task.status === 'completed' ? (
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-slate-50 dark:bg-slate-700" />
                          )}
                        </button>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className={cn(
                              "text-xl font-bold transition-all tracking-tight",
                              task.status === 'completed' ? 'text-slate-400 dark:text-slate-600 line-through' : 'text-slate-800 dark:text-slate-200'
                            )}>
                              {task.title}
                            </h3>
                            {task.description && (
                              <MessageSquare className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                            )}
                          </div>
                          <div className="flex flex-wrap gap-4 mt-2">
                            <span className={cn(
                              "text-[10px] uppercase font-black px-3 py-1.5 rounded-xl shadow-sm border flex items-center gap-2",
                              task.priority === 'high' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30' :
                                task.priority === 'medium' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30' :
                                  'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30'
                            )}>
                              <div className={cn("w-1.5 h-1.5 rounded-full",
                                task.priority === 'high' ? 'bg-red-500' :
                                  task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                              )} />
                              {task.priority}
                            </span>

                            {task.category && (
                              <span className={cn(
                                "text-[10px] uppercase font-black px-3 py-1.5 rounded-xl shadow-sm border flex items-center gap-2",
                                task.category.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100' :
                                  task.category.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100' :
                                    task.category.color === 'red' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100' :
                                      task.category.color === 'amber' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100' :
                                        'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200'
                              )}>
                                <div className={cn("w-1.5 h-1.5 rounded-full",
                                  task.category.color === 'blue' ? 'bg-blue-500' :
                                    task.category.color === 'emerald' ? 'bg-emerald-500' :
                                      task.category.color === 'red' ? 'bg-red-500' :
                                        task.category.color === 'amber' ? 'bg-amber-500' : 'bg-slate-500'
                                )} />
                                {task.category.name}
                              </span>
                            )}

                            {task.due_date && (
                              <span className={cn(
                                "text-[10px] uppercase font-black px-3 py-1.5 rounded-xl shadow-sm border flex items-center gap-2",
                                isOverdue(task.due_date) && task.status !== 'completed'
                                  ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 animate-pulse'
                                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200'
                              )}>
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                {isOverdue(task.due_date) && task.status !== 'completed' && " • OVERDUE"}
                              </span>
                            )}

                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1.5 tracking-wider uppercase">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(task.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>

                            {task.subtasks && task.subtasks.length > 0 && (
                              <div className="flex items-center gap-3 ml-2">
                                <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shrink-0">
                                  <motion.div
                                    className="h-full bg-primary-500"
                                    style={{
                                      width: `${(task.subtasks.filter((s: any) => s.is_completed).length / task.subtasks.length) * 100}%`
                                    }}
                                  />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                                  {task.subtasks.filter((s: any) => s.is_completed).length}/{task.subtasks.length} STEPS
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedTask(task)
                          }}
                          className="p-3 hover:bg-primary-50 dark:hover:bg-primary-900/30 text-slate-300 dark:text-slate-600 hover:text-primary-500 dark:hover:text-primary-400 rounded-[1.2rem]"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteTask.mutate(task.id)
                          }}
                          className="p-3 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-300 dark:text-slate-600 hover:text-red-500 rounded-[1.2rem]"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Load More Observer & Loading State */}
            <div ref={loadMoreRef} className="h-10 flex items-center justify-center mt-4">
              {isFetchingNextPage && (
                <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Charging next missions...
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </div>

      <TaskModal
        key={selectedTask?.id || 'new'}
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        isSaving={updateTask.isPending}
        onSave={(id, data) => {
          updateTask.mutate({ id, ...data }, {
            onSuccess: () => setSelectedTask(null)
          })
        }}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      <Toaster position="top-right" richColors expand={true} closeButton />
    </div>
  )
}

export default App
