import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface TimeEntry {
  id: string
  title: string
  startTime: Date
  endTime: Date | null
  duration: number // 持续时间（秒）
  category: string
  description?: string
  valueEvaluation?: number // 价值评估（金额）
  actualValue?: number // 实际价值（金额）
  aiEmpowerment?: number // AI赋能比例（1-10）
  status?: number // 状态（1-10）
  workload?: number // 工作量
  workloadUnit?: string // 工作量单位
  createdAt: Date
  icon?: string // 图标
  statusRating?: number // 状态打分（1-10）
  aiEnablementRating?: number // AI赋能比例打分（1-10）
}

// 序列化 Date 对象
const serializeDate = (obj: any): any => {
  if (obj instanceof Date) {
    return { $date: obj.toISOString() }
  }
  if (Array.isArray(obj)) {
    return obj.map(serializeDate)
  }
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, serializeDate(value)])
    )
  }
  return obj
}

// 反序列化 Date 对象
const deserializeDate = (obj: any): any => {
  if (obj && typeof obj === 'object' && '$date' in obj) {
    return new Date(obj.$date)
  }
  if (Array.isArray(obj)) {
    return obj.map(deserializeDate)
  }
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, deserializeDate(value)])
    )
  }
  return obj
}

export const useTimerStore = defineStore('timer', () => {
  // 从 localStorage 加载数据
  const loadFromStorage = () => {
    try {
      const savedTimeEntries = localStorage.getItem('timeEntries')
      const savedActiveTimer = localStorage.getItem('activeTimer')

      if (savedTimeEntries) {
        return deserializeDate(JSON.parse(savedTimeEntries))
      }
    } catch (error) {
      console.error('Failed to load data from storage:', error)
    }
    return []
  }

  // 保存数据到 localStorage
  const saveToStorage = () => {
    try {
      localStorage.setItem('timeEntries', JSON.stringify(serializeDate(timeEntries.value)))
      if (activeTimer.value) {
        localStorage.setItem('activeTimer', JSON.stringify(serializeDate(activeTimer.value)))
      } else {
        localStorage.removeItem('activeTimer')
      }
    } catch (error) {
      console.error('Failed to save data to storage:', error)
    }
  }

  // 从 localStorage 加载活动计时器
  const loadActiveTimer = () => {
    try {
      const saved = localStorage.getItem('activeTimer')
      return saved ? deserializeDate(JSON.parse(saved)) : null
    } catch {
      return null
    }
  }

  const activeTimer = ref<{
    id: string,
    title: string,
    startTime: Date,
    category: string,
    description?: string,
    valueEvaluation?: number,
    icon?: any,
    pauseDuration?: number // 暂停总时长（秒）
    lastPauseTime?: Date | null // 上次暂停的时间
  } | null>(loadActiveTimer())

  const timeEntries = ref<TimeEntry[]>(loadFromStorage())
  const totalDuration = computed(() => {
    return timeEntries.value.reduce((total, entry) => total + (entry.duration || 0), 0)
  })

  // 开始计时
  function startTimer(title: string, category: string, description?: string, icon?: any, valueEvaluation?: number, customStartTime?: Date) {
    if (activeTimer.value) {
      stopTimer()
    }

    const timerId = Date.now().toString()
    activeTimer.value = {
      id: timerId,
      title,
      startTime: customStartTime || new Date(),
      category,
      description,
      icon,
      valueEvaluation,
      pauseDuration: 0,
      lastPauseTime: null as Date | null
    }
    saveToStorage()
  }

  // 暂停计时
  function pauseTimer() {
    if (activeTimer.value && !activeTimer.value.lastPauseTime) {
      activeTimer.value.lastPauseTime = new Date()
      saveToStorage()
    }
  }

  // 恢复计时
  function resumeTimer() {
    if (activeTimer.value && activeTimer.value.lastPauseTime) {
      const pauseDuration = Math.floor((new Date().getTime() - activeTimer.value.lastPauseTime!.getTime()) / 1000)
      activeTimer.value.pauseDuration = (activeTimer.value.pauseDuration || 0) + pauseDuration
      activeTimer.value.lastPauseTime = null
      saveToStorage()
    }
  }

  // 停止计时
  function stopTimer() {
    if (!activeTimer.value) return

    // 如果处于暂停状态，先计算最后的暂停时间
    if (activeTimer.value.lastPauseTime) {
      const pauseDuration = Math.floor((new Date().getTime() - activeTimer.value.lastPauseTime!.getTime()) / 1000)
      activeTimer.value.pauseDuration = (activeTimer.value.pauseDuration || 0) + pauseDuration
      activeTimer.value.lastPauseTime = null
    }

    const now = new Date()
    const rawDuration = Math.floor((now.getTime() - activeTimer.value.startTime.getTime()) / 1000) // 秒
    const duration = rawDuration - (activeTimer.value.pauseDuration || 0) // 减去暂停时间

    const newEntry: TimeEntry = {
      id: activeTimer.value.id,
      title: activeTimer.value.title,
      startTime: activeTimer.value.startTime,
      endTime: now,
      duration,
      category: activeTimer.value.category,
      description: activeTimer.value.description,
      valueEvaluation: activeTimer.value.valueEvaluation,
      createdAt: new Date()
    }

    timeEntries.value.unshift(newEntry)
    activeTimer.value = null
    saveToStorage()
  }

  // 添加已有时间段
  function addTimeEntry(entry: Omit<TimeEntry, 'id' | 'createdAt'>) {
    const newEntry: TimeEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date()
    }

    // 如果有duration则计算，否则根据开始和结束时间计算
    if (!newEntry.duration && newEntry.startTime && newEntry.endTime) {
      newEntry.duration = Math.floor((newEntry.endTime.getTime() - newEntry.startTime.getTime()) / 1000)
    }

    timeEntries.value.unshift(newEntry)
    saveToStorage()
  }

  // 删除时间条目
  function removeTimeEntry(id: string) {
    timeEntries.value = timeEntries.value.filter(entry => entry.id !== id)
    saveToStorage()
  }

  // 更新时间条目
  function updateTimeEntry(id: string, updates: Partial<TimeEntry>) {
    const index = timeEntries.value.findIndex(entry => entry.id === id)
    if (index !== -1) {
      timeEntries.value[index] = { ...timeEntries.value[index], ...updates } as TimeEntry
      saveToStorage()
    }
  }

  // 获取指定日期范围内的条目
  function getTimeEntriesByDateRange(startDate: Date, endDate: Date) {
    return timeEntries.value.filter(entry => {
      const entryDate = new Date(entry.startTime)
      return entryDate >= startDate && entryDate <= endDate
    })
  }

  // 获取按类别分组的统计数据
  function getStatsByCategory() {
    const stats: Record<string, { totalTime: number, count: number }> = {}

    timeEntries.value.forEach(entry => {
      const category = entry.category
      if (!stats[category]) {
        stats[category] = { totalTime: 0, count: 0 }
      }
      const categoryStats = stats[category]
      if (categoryStats) {
        categoryStats.totalTime += entry.duration || 0
        categoryStats.count += 1
      }
    })

    return stats
  }

  // 获取今日总计时间
  function getTodayTotal() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return getTimeEntriesByDateRange(today, tomorrow).reduce(
      (sum, entry) => sum + (entry.duration || 0),
      0
    )
  }

  // 清空所有历史记录
  function clearAllEntries() {
    timeEntries.value = []
    saveToStorage()
  }

  return {
    activeTimer,
    timeEntries,
    totalDuration,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    addTimeEntry,
    removeTimeEntry,
    updateTimeEntry,
    getTimeEntriesByDateRange,
    getStatsByCategory,
    getTodayTotal,
    clearAllEntries
  }
})