"use client"

import * as React from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onSelect?: (date: Date) => void
}

export function DatePicker({ date, onSelect }: DatePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date)

  // Cập nhật selectedDate khi prop date thay đổi
  React.useEffect(() => {
    if (date && (!selectedDate || date.getTime() !== selectedDate.getTime())) {
      setSelectedDate(date)
    }
  }, [date, selectedDate])

  const handleSelect = React.useCallback(
    (date: Date | undefined) => {
      setSelectedDate(date)
      if (date && onSelect) {
        onSelect(date)
      }
    },
    [onSelect],
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, "PPP", { locale: vi }) : <span>Chọn ngày</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={selectedDate} onSelect={handleSelect} initialFocus locale={vi} />
      </PopoverContent>
    </Popover>
  )
}

