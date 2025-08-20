import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

export function formatDate(date: string | Date, pattern = 'dd MMMM yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, pattern, { locale: id })
}

export function formatDateTime(date: string | Date, pattern = 'dd MMMM yyyy HH:mm'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, pattern, { locale: id })
}

export function formatTime(date: string | Date, pattern = 'HH:mm'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, pattern)
}