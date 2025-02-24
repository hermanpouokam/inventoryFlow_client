"use client"

import * as React from "react"
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Checked = DropdownMenuCheckboxItemProps["checked"]

export function DropdownMenuPaper({ children, title, Btn }:
    Readonly<{ children: React.ReactNode, title: string | null | undefined, Btn?: React.JSX.Element }>) {
    const [showStatusBar, setShowStatusBar] = React.useState<Checked>(true)
    const [showActivityBar, setShowActivityBar] = React.useState<Checked>(false)
    const [showPanel, setShowPanel] = React.useState<Checked>(false)

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="relative rounded-full p-1 text-slate-800 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                >
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">View notifications</span>
                    <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                        />
                    </svg>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mr-5">
                {/* <DropdownMenuLabel>{title}</DropdownMenuLabel>
                <DropdownMenuSeparator /> */}
                {children}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
