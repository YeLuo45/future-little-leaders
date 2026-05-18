/**
 * Sync Store - 同步状态管理
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSyncStore = defineStore('sync', () => {
  // 状态
  const status = ref('idle') // 'idle' | 'syncing' | 'synced' | 'error' | 'conflict'
  const lastSyncTime = ref(null)
  const pendingCount = ref(0)
  const errorMessage = ref('')
  const conflicts = ref([])

  // 方法
  function setSyncing() {
    status.value = 'syncing'
    errorMessage.value = ''
  }

  function setSynced() {
    status.value = 'synced'
    lastSyncTime.value = new Date()
    pendingCount.value = 0
  }

  function setError(msg) {
    status.value = 'error'
    errorMessage.value = msg
  }

  function setConflict(conflictList) {
    status.value = 'conflict'
    conflicts.value = conflictList || []
  }

  function setIdle() {
    status.value = 'idle'
  }

  function incrementPending() {
    pendingCount.value++
  }

  function clearConflicts() {
    conflicts.value = []
    if (status.value === 'conflict') {
      status.value = 'synced'
    }
  }

  return {
    status,
    lastSyncTime,
    pendingCount,
    errorMessage,
    conflicts,
    setSyncing,
    setSynced,
    setError,
    setConflict,
    setIdle,
    incrementPending,
    clearConflicts
  }
})