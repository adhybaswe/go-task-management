import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import * as Popover from "@radix-ui/react-popover"
import { cn } from "../../lib/utils"
import { Calendar } from "./Calendar"

interface DatePickerProps {
    date?: Date
    setDate: (date?: Date) => void
    placeholder?: string
}

export function DatePicker({ date, setDate, placeholder = "Pick a date" }: DatePickerProps) {
    return (
        <Popover.Root>
            <Popover.Trigger asChild>
                <button
                    className={cn(
                        "w-full flex items-center gap-3 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 font-bold text-slate-700 dark:text-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-left",
                        !date && "text-slate-400 dark:text-slate-600"
                    )}
                >
                    <CalendarIcon className="w-5 h-5" />
                    {date ? format(date, "PPP") : <span>{placeholder}</span>}
                </button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    className="z-[70] w-auto bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-0 animate-in fade-in zoom-in duration-200"
                    align="start"
                >
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                    />
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    )
}
