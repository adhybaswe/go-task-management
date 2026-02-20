import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "../../lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-4 bg-white dark:bg-slate-900", className)}
            classNames={{
                months: "flex flex-col",
                month: "space-y-4",
                // Header dengan bulan di tengah
                month_caption: "flex items-center justify-center h-10 relative mb-4",
                caption_label: "text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.2em] relative z-10",
                // Navigasi yang menyebar ke ujung kiri & kanan
                nav: "flex items-center justify-between absolute inset-x-0 h-10 z-20 pointer-events-none",
                button_previous: cn(
                    "h-9 w-9 bg-transparent p-0 opacity-50 hover:opacity-100 transition-all flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl active:scale-95 pointer-events-auto"
                ),
                button_next: cn(
                    "h-9 w-9 bg-transparent p-0 opacity-50 hover:opacity-100 transition-all flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl active:scale-95 pointer-events-auto"
                ),
                month_grid: "w-full border-collapse",
                weekdays: "flex justify-between mb-2",
                weekday: "text-slate-400 dark:text-slate-500 rounded-md w-9 font-black text-[10px] uppercase tracking-tighter flex items-center justify-center h-9",
                week: "flex w-full mt-1 justify-between",
                day: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                day_button: cn(
                    "h-9 w-9 p-0 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all flex items-center justify-center text-slate-700 dark:text-slate-300 relative"
                ),
                selected: "bg-primary-600 text-white hover:bg-primary-600 hover:text-white focus:bg-primary-600 focus:text-white dark:bg-primary-500 dark:text-white rounded-xl shadow-lg shadow-primary-500/30",
                today: "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 rounded-xl after:content-[''] after:absolute after:bottom-1 after:w-1 after:h-1 after:bg-primary-500 after:rounded-full",
                outside: "text-slate-300 dark:text-slate-700 opacity-50",
                disabled: "text-slate-300 dark:text-slate-700 opacity-50",
                hidden: "invisible",
                ...classNames,
            }}
            components={{
                Chevron: ({ orientation }) => {
                    const Icon = orientation === "left" ? ChevronLeft : ChevronRight
                    return <Icon className="h-5 w-5" />
                },
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }
