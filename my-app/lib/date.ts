export function toMonthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

// YYYY-MM-DD usando componentes locales (no UTC), para que la fecha que ve el
// usuario coincida con la que se guarda en la DB independientemente de la
// zona horaria.
export function toIsoDateLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

// Genera el rango YYYY-MM-DD [first, last] del mes indicado por monthKey
// ("YYYY-MM") sin pasar por Date — TZ-independiente.
export function monthRange(monthKey: string): { from: string; to: string } {
  const [yearStr, monthStr] = monthKey.split("-")
  const year = Number(yearStr)
  const month = Number(monthStr)
  // Día 0 del siguiente mes = último día del mes pedido
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return {
    from: `${monthKey}-01`,
    to: `${monthKey}-${String(lastDay).padStart(2, "0")}`,
  }
}

export function addMonthsToKey(monthKey: string, n: number): string {
  const [yearStr, monthStr] = monthKey.split("-")
  const year = Number(yearStr)
  const month = Number(monthStr)
  const total = year * 12 + (month - 1) + n
  const newYear = Math.floor(total / 12)
  const newMonth = (total % 12) + 1
  return `${newYear}-${String(newMonth).padStart(2, "0")}`
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1)
}

export function isSameMonth(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
  )
}
