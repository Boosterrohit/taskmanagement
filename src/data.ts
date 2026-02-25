import { Bell, Calendar, FileUser, NotepadText, Shell, ShelvingUnit, ShieldCheck, ShoppingBag, Smartphone, Workflow, Zap } from "lucide-react";

export const FEATURE_LIST = [
    {
        id: 1,
        icons: Zap,
        title: "Lightning Fast",
        description: "Add tasks in seconds with our intuitive quick-add feature. No friction, just flow.",
    },
    {
        id: 2,
        icons: Calendar,
        title: "Smart Scheduling",
        description: "Set due dates, recurring tasks, and let AI suggest the best time to tackle your work.",
    },
    {
        id: 3,
        icons: Bell,
        title: "Gentle Reminders",
        description: "Never miss a deadline with customizable notifications that respect your focus time.",
    },
    {
        id: 4,
        icons: ShelvingUnit,
        title: "Organized Projects",
        description: "Group related tasks into projects. Use tags and filters to find anything instantly.",
    },
    {
        id: 5,
        icons: ShieldCheck,
        title: "Private & Secure",
        description: "Your data is encrypted end-to-end. We never sell your information. Ever.",
    },
    {
        id: 6,
        icons: Smartphone,
        title: "Works Everywhere",
        description: "Seamlessly sync across all your devices. Start on desktop, finish on mobile.",
    },

]

export const SIDE_BAR_MENU = [
    {
        id: 1,
        title: "Personal Tasks",
        SUBMENU: [
            {
                id:1,
                name: "My Day",
                slug: "my-day",
                icon: Shell
            },
            {
                id:2,
                name: "All My Tasks",
                slug: "all-my-tasks",
                icon: NotepadText,
            },
            {
                id:3,
                name: "My Calender",
                slug: "my-calender",
                icon: Calendar,
            },
            
        ]
    },
    {
        id: 2,
        title: "My Lists",
        SUBMENU: [
            {
                id:5,
                name: "Personal",
                slug: "personal",
                icon: FileUser,
            },
            {
                id:6,
                name: "Work",
                slug: "work",
                icon: Workflow
            },
            {
                id:7,
                name: "Groceries",
                slug: "groceries",
                icon: ShoppingBag
            }
        ]
    },
    {
        id: 3,
        title: "Boards",
        SUBMENU: [
            {
                id:8,
                name: "Calendar",
                slug: "board-calendar",
                icon: Calendar,
            },
        ]
    },
]