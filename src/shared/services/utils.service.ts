import { Injectable } from '@nestjs/common'

@Injectable()
export class UtilService {
  formatLastSeen (date: Date): string {
    const now = new Date()
    const d = new Date(date)

    const isToday =
      now.toDateString() === d.toDateString()

    const yesterday = new Date()
    yesterday.setDate(now.getDate() - 1)
    const isYesterday =
      yesterday.toDateString() === d.toDateString()

    const optionsTime: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit'
    }

    const time = d.toLocaleTimeString('es-ES', optionsTime)

    if (isToday) return `hoy a las ${time}`
    if (isYesterday) return `ayer a las ${time}`

    const optionsDate: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long'
    }

    const datePart = d.toLocaleDateString('es-ES', optionsDate)

    if (now.getFullYear() === d.getFullYear()) {
      return `${datePart} a las ${time}`
    }

    return `${datePart} de ${d.getFullYear()} a las ${time}`
  }
}
