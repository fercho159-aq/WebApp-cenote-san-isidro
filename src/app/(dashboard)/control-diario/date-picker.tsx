'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DailyDatePicker({ currentDate }: { currentDate: string }) {
  const router = useRouter()

  function goToDate(date: string) {
    router.push(`/control-diario?date=${date}`)
  }

  function changeDay(offset: number) {
    const d = new Date(currentDate + 'T12:00:00')
    d.setDate(d.getDate() + offset)
    goToDate(d.toISOString().split('T')[0])
  }

  function goToday() {
    goToDate(new Date().toISOString().split('T')[0])
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={() => changeDay(-1)} className="h-8 w-8">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <input
        type="date"
        value={currentDate}
        onChange={(e) => goToDate(e.target.value)}
        className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground"
      />
      <Button variant="outline" size="icon" onClick={() => changeDay(1)} className="h-8 w-8">
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={goToday}>
        Hoy
      </Button>
    </div>
  )
}
