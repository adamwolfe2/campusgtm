"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./button"

export interface CalendarProps {
  mode?: "single" | "multiple" | "range"
  selected?: Date | Date[] | { from: Date; to?: Date }
  onSelect?: (date: Date | Date[] | { from: Date; to?: Date } | undefined) => void
  className?: string
  disabled?: (date: Date) => boolean
  fromDate?: Date
  toDate?: Date
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function Calendar({
  mode = "single",
  selected,
  onSelect,
  className = "",
  disabled,
  fromDate,
  toDate,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()

  const previousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const isSelected = (day: number) => {
    const date = new Date(year, month, day)
    if (!selected) return false

    if (mode === "single") {
      return (
        selected instanceof Date &&
        date.toDateString() === selected.toDateString()
      )
    }

    if (mode === "multiple") {
      return (
        Array.isArray(selected) &&
        selected.some((d) => date.toDateString() === d.toDateString())
      )
    }

    if (mode === "range") {
      const range = selected as { from: Date; to?: Date }
      if (!range.to) {
        return date.toDateString() === range.from.toDateString()
      }
      return date >= range.from && date <= range.to
    }

    return false
  }

  const isDisabled = (day: number) => {
    const date = new Date(year, month, day)
    if (disabled && disabled(date)) return true
    if (fromDate && date < fromDate) return true
    if (toDate && date > toDate) return true
    return false
  }

  const handleDayClick = (day: number) => {
    const date = new Date(year, month, day)

    if (isDisabled(day)) return

    if (!onSelect) return

    if (mode === "single") {
      onSelect(date)
    } else if (mode === "multiple") {
      const currentSelected = (selected as Date[]) || []
      const isAlreadySelected = currentSelected.some(
        (d) => d.toDateString() === date.toDateString()
      )
      if (isAlreadySelected) {
        onSelect(currentSelected.filter((d) => d.toDateString() !== date.toDateString()))
      } else {
        onSelect([...currentSelected, date])
      }
    } else if (mode === "range") {
      const range = (selected as { from: Date; to?: Date }) || { from: date }
      if (!range.to) {
        if (date > range.from) {
          onSelect({ from: range.from, to: date })
        } else {
          onSelect({ from: date })
        }
      } else {
        onSelect({ from: date })
      }
    }
  }

  const days = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="p-2" />)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const selected = isSelected(day)
    const disabled = isDisabled(day)

    days.push(
      <button
        key={day}
        onClick={() => handleDayClick(day)}
        disabled={disabled}
        className={`
          p-2 text-sm rounded-lg transition-all duration-200
          hover:bg-white/10
          ${selected ? "bg-purple-600 text-white font-bold rdp-day_selected" : "text-gray-300"}
          ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
          ${!selected && !disabled ? "hover:scale-105" : ""}
        `}
      >
        {day}
      </button>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Month/Year Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={previousMonth}
          className="text-white hover:bg-white/10"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className="text-lg font-bold text-white">
          {MONTHS[month]} {year}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={nextMonth}
          className="text-white hover:bg-white/10"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-400 p-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">{days}</div>
    </div>
  )
}
