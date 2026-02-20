import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLogin, useRegister } from '../hooks/useAuth'
import { Loader2, LogIn, UserPlus, Mail, Lock, User as UserIcon } from 'lucide-react'
import { useThemeObserver } from '../hooks/useThemeObserver'

export function AuthPage() {
    useThemeObserver()
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')

    const login = useLogin()
    const register = useRegister()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (isLogin) {
            login.mutate({ email, password })
        } else {
            register.mutate({ username, email, password }, {
                onSuccess: () => setIsLogin(true) // Switch to login on successful register
            })
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden"
            >
                <div className="p-8 pb-4">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary-200 mx-auto"
                    >
                        {isLogin ? <LogIn className="w-8 h-8 text-white" /> : <UserPlus className="w-8 h-8 text-white" />}
                    </motion.div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isLogin ? 'login-head' : 'register-head'}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h2 className="text-3xl font-black text-center text-slate-900 dark:text-white tracking-tight">
                                {isLogin ? 'Welcome Back' : 'Create Account'}
                            </h2>
                            <p className="text-center text-slate-500 dark:text-slate-400 mt-2 font-medium italic">
                                {isLogin ? 'Sign in to manage your tasks' : 'Start organizing your life today'}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-4">
                    <AnimatePresence mode="popLayout">
                        {!isLogin && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-1 overflow-hidden"
                            >
                                <label className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Username</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-600" />
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white transition-all font-medium"
                                        placeholder="johndoe"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-1">
                        <label className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-600" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white transition-all font-medium"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-600" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white transition-all font-medium"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={login.isPending || register.isPending}
                        className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white py-4 rounded-2xl font-black shadow-lg shadow-primary-500/30 transition-all flex items-center justify-center gap-2 mt-4"
                    >
                        {(login.isPending || register.isPending) ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : isLogin ? (
                            <>
                                <LogIn className="w-5 h-5" />
                                SIGN IN
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-5 h-5" />
                                GET STARTED
                            </>
                        )}
                    </motion.button>

                    {(login.isError || register.isError) && (
                        <motion.p
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center text-red-500 text-xs font-black uppercase tracking-tighter mt-2"
                        >
                            Authentication failed. Please check your credentials.
                        </motion.p>
                    )}

                    <div className="pt-4 text-center">
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-xs font-black text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors uppercase tracking-widest"
                        >
                            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
