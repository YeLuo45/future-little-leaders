/**
 * Smart Home Store - V40 Smart Home Integration
 * 智能家居状态管理
 */

import { reactive, computed } from 'vue'
import smartHomeService from '../services/smartHomeService'

// State
const state = reactive({
  devices: [],
  rules: [],
  rooms: [],
  isLoading: false,
  isScanning: false,
  error: null,
  haConfig: null,
  environmentContext: {
    timePeriod: 'day',
    isNight: false,
    hour: new Date().getHours()
  }
})

// Computed
const onlineDevices = computed(() => {
  return state.devices.filter(d => d.status === 'online')
})

const devicesByRoom = computed(() => {
  const grouped = {}
  for (const device of state.devices) {
    if (!grouped[device.room]) {
      grouped[device.room] = []
    }
    grouped[device.room].push(device)
  }
  return grouped
})

const devicesByType = computed(() => {
  const grouped = {}
  for (const device of state.devices) {
    if (!grouped[device.type]) {
      grouped[device.type] = []
    }
    grouped[device.type].push(device)
  }
  return grouped
})

const enabledRules = computed(() => {
  return state.rules.filter(r => r.enabled)
})

const isHAConfigured = computed(() => {
  return state.haConfig !== null && state.haConfig.url && state.haConfig.token
})

// Actions
function loadDevices() {
  state.devices = smartHomeService.getDevices()
  state.rooms = smartHomeService.getRooms()
}

function loadRules() {
  state.rules = smartHomeService.getRules()
}

function loadHAConfig() {
  state.haConfig = smartHomeService.getHAConfig()
}

function updateEnvironmentContext() {
  state.environmentContext = smartHomeService.getEnvironmentContext()
}

async function refreshDevices() {
  state.isLoading = true
  state.error = null
  
  try {
    if (state.haConfig) {
      state.devices = await smartHomeService.syncDevicesFromHA()
    } else {
      loadDevices()
    }
    state.rooms = smartHomeService.getRooms()
  } catch (error) {
    state.error = error.message
    console.error('[smartHomeStore] Refresh devices failed:', error)
  } finally {
    state.isLoading = false
  }
}

async function addDevice(deviceData) {
  state.isLoading = true
  state.error = null
  
  try {
    const device = smartHomeService.addDevice(deviceData)
    state.devices.push(device)
    state.rooms = smartHomeService.getRooms()
    return device
  } catch (error) {
    state.error = error.message
    throw error
  } finally {
    state.isLoading = false
  }
}

async function controlDevice(deviceId, action, params = {}) {
  state.error = null
  
  try {
    const result = await smartHomeService.controlDevice(deviceId, action, params)
    
    // Update local state
    const device = state.devices.find(d => d.id === deviceId)
    if (device) {
      Object.assign(device, smartHomeService.getDeviceById(deviceId))
    }
    
    return result
  } catch (error) {
    state.error = error.message
    throw error
  }
}

async function createRule(ruleData) {
  state.error = null
  
  try {
    const rule = smartHomeService.createRule(ruleData)
    state.rules.push(rule)
    return rule
  } catch (error) {
    state.error = error.message
    throw error
  }
}

async function updateRule(ruleId, updates) {
  state.error = null
  
  try {
    const rule = smartHomeService.updateRule(ruleId, updates)
    const index = state.rules.findIndex(r => r.id === ruleId)
    if (index !== -1) {
      state.rules[index] = rule
    }
    return rule
  } catch (error) {
    state.error = error.message
    throw error
  }
}

async function deleteRule(ruleId) {
  state.error = null
  
  try {
    smartHomeService.deleteRule(ruleId)
    state.rules = state.rules.filter(r => r.id !== ruleId)
  } catch (error) {
    state.error = error.message
    throw error
  }
}

async function toggleRule(ruleId) {
  state.error = null
  
  try {
    const rule = smartHomeService.toggleRule(ruleId)
    const index = state.rules.findIndex(r => r.id === ruleId)
    if (index !== -1) {
      state.rules[index] = rule
    }
    return rule
  } catch (error) {
    state.error = error.message
    throw error
  }
}

async function executeRule(ruleId, context = {}) {
  state.error = null
  
  try {
    return await smartHomeService.executeRule(ruleId, context)
  } catch (error) {
    state.error = error.message
    throw error
  }
}

function saveHAConfig(config) {
  smartHomeService.saveHAConfig(config)
  state.haConfig = config
}

function applyEnvironmentSettings(settings) {
  return smartHomeService.applyEnvironmentSettings(settings)
}

// Initialize store
function initSmartHomeStore() {
  loadDevices()
  loadRules()
  loadHAConfig()
  updateEnvironmentContext()
}

export function useSmartHomeStore() {
  return {
    state,
    onlineDevices,
    devicesByRoom,
    devicesByType,
    enabledRules,
    isHAConfigured,
    loadDevices,
    loadRules,
    loadHAConfig,
    updateEnvironmentContext,
    refreshDevices,
    addDevice,
    controlDevice,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    executeRule,
    saveHAConfig,
    applyEnvironmentSettings,
    initSmartHomeStore,
    
    // Service references for direct access
    service: smartHomeService
  }
}
