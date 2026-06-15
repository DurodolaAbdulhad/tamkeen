import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, parseISO } from 'date-fns'

export const todayStr  = () => format(new Date(), 'yyyy-MM-dd')
export const todayDisp = () => format(new Date(), 'EEEE, MMMM d')

export const getWeekDates = (referenceDate = new Date()) => {
  const start = startOfWeek(referenceDate, { weekStartsOn: 1 }) // Monday
  const end   = endOfWeek(referenceDate,   { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end }).map((d) => ({
    date:     format(d, 'yyyy-MM-dd'),
    dayShort: format(d, 'EEE'),
    dayNum:   format(d, 'd'),
    isToday:  isToday(d),
  }))
}

export const formatDateDisplay = (dateStr) => {
  return format(parseISO(dateStr), 'MMMM d, yyyy')
}

export const getWeekStart = (date = new Date()) => {
  return format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd')
}

export const getDayName = (dateStr) => {
  return format(parseISO(dateStr), 'EEEE')
}

export const isMondayOrThursday = (date = new Date()) => {
  const day = date.getDay()
  return day === 1 || day === 4 // 1=Monday, 4=Thursday
}
