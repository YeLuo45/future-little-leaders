/**
 * Smart Home Service - V40 Smart Home Integration
 * 智能家居服务：设备控制、自动化规则、环境自适应
 */

import { getCurrentMemberId } from './familyService'

// Storage keys
const DEVICES_KEY = 'smart_home_devices'
const RULES_KEY = 'smart_home_rules'
const HA_CONFIG_KEY = 'home_assistant_config'

// Device types
export const DEVICE_TYPES = {
  LIGHT: 'light',
  SOCKET: 'socket',
  AC: 'ac',
  SPEAKER: 'speaker',
  SENSOR: 'sensor',
  SWITCH: 'switch'
}

// Device status
export const DEVICE_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  ON: 'on',
  OFF: 'off'
}

// Trigger types for automation
export const TRIGGER_TYPES = {
  TASK_COMPLETE: 'task_complete',
  TIME_RANGE: 'time_range',
  LOCATION_ARRIVE: 'location_arrive',
  LOCATION_LEAVE: 'location_leave',
  WEATHER_CONDITION: 'weather_condition'
}

// Actions for automation
export const ACTION_TYPES = {
  TURN_ON: 'turn_on',
  TURN_OFF: 'turn_off',
  TOGGLE: 'toggle',
  SET_BRIGHTNESS: 'set_brightness',
  SET_TEMPERATURE: 'set_temperature',
  PLAY_MUSIC: 'play_music',
  STOP_MUSIC: 'stop_music'
}

// Generate unique ID
const generateId = () => 'sm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9)

// Get Home Assistant config
export const getHAConfig = () => {
  try {
    const stored = uni.getStorageSync(HA_CONFIG_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (e) {
    console.error('[smartHomeService] Get HA config failed:', e)
    return null
  }
}

// Save Home Assistant config
export const saveHAConfig = (config) => {
  uni.setStorageSync(HA_CONFIG_KEY, JSON.stringify(config))
}

// Get all devices
export const getDevices = () => {
  try {
    const stored = uni.getStorageSync(DEVICES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('[smartHomeService] Get devices failed:', e)
    return []
  }
}

// Save devices
export const saveDevices = (devices) => {
  uni.setStorageSync(DEVICES_KEY, JSON.stringify(devices))
}

// Get device by ID
export const getDeviceById = (deviceId) => {
  const devices = getDevices()
  return devices.find(d => d.id === deviceId) || null
}

// Get devices by room
export const getDevicesByRoom = (room) => {
  const devices = getDevices()
  return devices.filter(d => d.room === room)
}

// Get devices by type
export const getDevicesByType = (type) => {
  const devices = getDevices()
  return devices.filter(d => d.type === type)
}

// Add device
export const addDevice = (deviceData) => {
  const device = {
    id: generateId(),
    name: deviceData.name || '新设备',
    type: deviceData.type || DEVICE_TYPES.LIGHT,
    room: deviceData.room || '客厅',
    status: DEVICE_STATUS.OFFLINE,
    state: deviceData.state || { on: false },
    haEntityId: deviceData.haEntityId || null,
    manufacturer: deviceData.manufacturer || '未知',
    model: deviceData.model || '',
    capabilities: deviceData.capabilities || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  const devices = getDevices()
  devices.push(device)
  saveDevices(devices)
  
  return device
}

// Update device
export const updateDevice = (deviceId, updates) => {
  const devices = getDevices()
  const index = devices.findIndex(d => d.id === deviceId)
  
  if (index === -1) {
    throw new Error('设备不存在')
  }
  
  devices[index] = {
    ...devices[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  saveDevices(devices)
  
  return devices[index]
}

// Delete device
export const deleteDevice = (deviceId) => {
  const devices = getDevices()
  const filtered = devices.filter(d => d.id !== deviceId)
  saveDevices(filtered)
}

// Control device
export const controlDevice = async (deviceId, action, params = {}) => {
  const device = getDeviceById(deviceId)
  if (!device) {
    throw new Error('设备不存在')
  }
  
  // Check Home Assistant connection
  const haConfig = getHAConfig()
  if (haConfig && device.haEntityId) {
    return await controlViaHA(device, action, params)
  }
  
  // Local control (mock)
  return localControl(device, action, params)
}

// Local device control
const localControl = (device, action, params) => {
  let newState = { ...device.state }
  
  switch (action) {
    case ACTION_TYPES.TURN_ON:
      newState.on = true
      break
    case ACTION_TYPES.TURN_OFF:
      newState.on = false
      break
    case ACTION_TYPES.TOGGLE:
      newState.on = !device.state.on
      break
    case ACTION_TYPES.SET_BRIGHTNESS:
      newState.brightness = params.brightness || 100
      break
    case ACTION_TYPES.SET_TEMPERATURE:
      newState.temperature = params.temperature || 26
      break
    case ACTION_TYPES.PLAY_MUSIC:
      newState.playing = true
      newState.track = params.track || '默认音乐'
      break
    case ACTION_TYPES.STOP_MUSIC:
      newState.playing = false
      break
  }
  
  updateDevice(device.id, { state: newState })
  
  return {
    success: true,
    deviceId: device.id,
    action,
    newState
  }
}

// Home Assistant API control
const controlViaHA = async (device, action, params) => {
  const haConfig = getHAConfig()
  if (!haConfig) {
    throw new Error('Home Assistant 未配置')
  }
  
  const url = `${haConfig.url}/api/services/${getDomain(device.type)}/turn_${action === ACTION_TYPES.TURN_ON ? 'on' : 'off'}`
  
  try {
    const response = await new Promise((resolve, reject) => {
      uni.request({
        url,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${haConfig.token}`,
          'Content-Type': 'application/json'
        },
        data: {
          entity_id: device.haEntityId,
          ...params
        },
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data)
          } else {
            reject(new Error(`HA API error: ${res.statusCode}`))
          }
        },
        fail: reject
      })
    })
    
    // Update local state
    let newState = { ...device.state }
    if (action === ACTION_TYPES.TURN_ON) newState.on = true
    if (action === ACTION_TYPES.TURN_OFF) newState.on = false
    if (action === ACTION_TYPES.SET_BRIGHTNESS) newState.brightness = params.brightness
    if (action === ACTION_TYPES.SET_TEMPERATURE) newState.temperature = params.temperature
    
    updateDevice(device.id, { state: newState })
    
    return {
      success: true,
      deviceId: device.id,
      action,
      haResponse: response
    }
  } catch (error) {
    console.error('[smartHomeService] HA control failed:', error)
    throw error
  }
}

// Get Home Assistant domain for device type
const getDomain = (deviceType) => {
  const domains = {
    [DEVICE_TYPES.LIGHT]: 'light',
    [DEVICE_TYPES.SOCKET]: 'switch',
    [DEVICE_TYPES.AC]: 'climate',
    [DEVICE_TYPES.SPEAKER]: 'media_player',
    [DEVICE_TYPES.SWITCH]: 'switch'
  }
  return domains[deviceType] || 'homeassistant'
}

// Sync devices from Home Assistant
export const syncDevicesFromHA = async () => {
  const haConfig = getHAConfig()
  if (!haConfig) {
    throw new Error('Home Assistant 未配置')
  }
  
  try {
    const response = await new Promise((resolve, reject) => {
      uni.request({
        url: `${haConfig.url}/api/states`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${haConfig.token}`
        },
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data)
          } else {
            reject(new Error(`HA API error: ${res.statusCode}`))
          }
        },
        fail: reject
      })
    })
    
    // Process and save devices
    const haDevices = response.filter(entity => 
      entity.entity_id.startsWith('light.') ||
      entity.entity_id.startsWith('switch.') ||
      entity.entity_id.startsWith('climate.') ||
      entity.entity_id.startsWith('media_player.')
    )
    
    const devices = haDevices.map(entity => {
      const type = getDeviceTypeFromEntity(entity.entity_id)
      const room = extractRoomFromEntity(entity.entity_id)
      
      return {
        id: generateId(),
        name: entity.attributes.friendly_name || entity.entity_id,
        type,
        room,
        status: entity.state !== 'unavailable' ? DEVICE_STATUS.ONLINE : DEVICE_STATUS.OFFLINE,
        state: parseEntityState(entity),
        haEntityId: entity.entity_id,
        manufacturer: entity.attributes.manufacturer || '',
        model: entity.attributes.model || '',
        capabilities: getCapabilities(type),
        lastSync: new Date().toISOString()
      }
    })
    
    saveDevices(devices)
    return devices
  } catch (error) {
    console.error('[smartHomeService] HA sync failed:', error)
    throw error
  }
}

// Parse HA entity state
const parseEntityState = (entity) => {
  const state = {
    on: entity.state !== 'off' && entity.state !== 'unavailable'
  }
  
  if (entity.attributes.brightness !== undefined) {
    state.brightness = Math.round((entity.attributes.brightness / 255) * 100)
  }
  if (entity.attributes.temperature !== undefined) {
    state.temperature = entity.attributes.temperature
  }
  if (entity.attributes.media_title !== undefined) {
    state.track = entity.attributes.media_title
    state.playing = entity.state === 'playing'
  }
  
  return state
}

// Get device type from HA entity ID
const getDeviceTypeFromEntity = (entityId) => {
  if (entityId.startsWith('light.')) return DEVICE_TYPES.LIGHT
  if (entityId.startsWith('switch.')) return DEVICE_TYPES.SWITCH
  if (entityId.startsWith('climate.')) return DEVICE_TYPES.AC
  if (entityId.startsWith('media_player.')) return DEVICE_TYPES.SPEAKER
  return DEVICE_TYPES.SENSOR
}

// Extract room from entity ID (e.g., light.living_room -> living_room)
const extractRoomFromEntity = (entityId) => {
  const parts = entityId.split('.')
  if (parts.length >= 2) {
    return parts[1].replace(/_/g, ' ')
  }
  return '未知'
}

// Get device capabilities
const getCapabilities = (type) => {
  const capabilities = {
    [DEVICE_TYPES.LIGHT]: ['turn_on', 'turn_off', 'toggle', 'set_brightness'],
    [DEVICE_TYPES.SOCKET]: ['turn_on', 'turn_off', 'toggle'],
    [DEVICE_TYPES.AC]: ['turn_on', 'turn_off', 'set_temperature'],
    [DEVICE_TYPES.SPEAKER]: ['turn_on', 'turn_off', 'play_music', 'stop_music'],
    [DEVICE_TYPES.SWITCH]: ['turn_on', 'turn_off', 'toggle']
  }
  return capabilities[type] || []
}

// ============ Automation Rules ============

// Get all rules
export const getRules = () => {
  try {
    const stored = uni.getStorageSync(RULES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    console.error('[smartHomeService] Get rules failed:', e)
    return []
  }
}

// Save rules
export const saveRules = (rules) => {
  uni.setStorageSync(RULES_KEY, JSON.stringify(rules))
}

// Get rule by ID
export const getRuleById = (ruleId) => {
  const rules = getRules()
  return rules.find(r => r.id === ruleId) || null
}

// Get rules by trigger type
export const getRulesByTrigger = (triggerType) => {
  const rules = getRules()
  return rules.filter(r => r.trigger.type === triggerType)
}

// Create automation rule
export const createRule = (ruleData) => {
  const rule = {
    id: generateId(),
    name: ruleData.name || '新规则',
    description: ruleData.description || '',
    enabled: ruleData.enabled !== false,
    trigger: ruleData.trigger || { type: TRIGGER_TYPES.TASK_COMPLETE },
    conditions: ruleData.conditions || [],
    actions: ruleData.actions || [],
    createdBy: getCurrentMemberId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  const rules = getRules()
  rules.push(rule)
  saveRules(rules)
  
  return rule
}

// Update rule
export const updateRule = (ruleId, updates) => {
  const rules = getRules()
  const index = rules.findIndex(r => r.id === ruleId)
  
  if (index === -1) {
    throw new Error('规则不存在')
  }
  
  rules[index] = {
    ...rules[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  saveRules(rules)
  
  return rules[index]
}

// Delete rule
export const deleteRule = (ruleId) => {
  const rules = getRules()
  const filtered = rules.filter(r => r.id !== ruleId)
  saveRules(filtered)
}

// Toggle rule enabled
export const toggleRule = (ruleId) => {
  const rule = getRuleById(ruleId)
  if (!rule) {
    throw new Error('规则不存在')
  }
  return updateRule(ruleId, { enabled: !rule.enabled })
}

// Execute rule actions
export const executeRule = async (ruleId, context = {}) => {
  const rule = getRuleById(ruleId)
  if (!rule) {
    throw new Error('规则不存在')
  }
  
  if (!rule.enabled) {
    return { success: false, reason: '规则已禁用' }
  }
  
  // Check conditions
  const conditionsMet = await checkConditions(rule.conditions, context)
  if (!conditionsMet) {
    return { success: false, reason: '条件不满足' }
  }
  
  // Execute actions
  const results = []
  for (const action of rule.actions) {
    try {
      const result = await executeAction(action, context)
      results.push(result)
    } catch (error) {
      console.error(`[smartHomeService] Action execution failed:`, error)
      results.push({ success: false, error: error.message })
    }
  }
  
  return {
    success: results.every(r => r.success),
    results
  }
}

// Check if conditions are met
const checkConditions = async (conditions, context) => {
  if (!conditions || conditions.length === 0) return true
  
  for (const condition of conditions) {
    const met = await evaluateCondition(condition, context)
    if (!met) return false
  }
  return true
}

// Evaluate single condition
const evaluateCondition = async (condition, context) => {
  switch (condition.type) {
    case 'time_range':
      return evaluateTimeRange(condition)
    case 'location':
      return evaluateLocation(condition, context)
    case 'weather':
      return evaluateWeather(condition, context)
    case 'device_state':
      return evaluateDeviceState(condition)
    default:
      return true
  }
}

// Evaluate time range condition
const evaluateTimeRange = (condition) => {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTime = currentHour * 60 + currentMinute
  
  const startTime = parseTime(condition.startTime || '08:00')
  const endTime = parseTime(condition.endTime || '22:00')
  
  if (startTime <= endTime) {
    return currentTime >= startTime && currentTime <= endTime
  } else {
    // Overnight range
    return currentTime >= startTime || currentTime <= endTime
  }
}

// Parse time string to minutes
const parseTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

// Evaluate location condition
const evaluateLocation = (condition, context) => {
  if (!context.location) return false
  
  // Simplified location check
  const distance = context.location.distance || 0
  if (condition.operator === 'near') {
    return distance <= (condition.distance || 100)
  } else if (condition.operator === 'far') {
    return distance > (condition.distance || 500)
  }
  return false
}

// Evaluate weather condition (mock)
const evaluateWeather = (condition, context) => {
  const weather = context.weather || {}
  switch (condition.weatherType) {
    case 'sunny':
      return weather.type === 'sunny' || weather.type === 'clear'
    case 'rainy':
      return weather.type === 'rainy' || weather.type === 'rain'
    case 'cloudy':
      return weather.type === 'cloudy'
    default:
      return true
  }
}

// Evaluate device state condition
const evaluateDeviceState = (condition) => {
  const device = getDeviceById(condition.deviceId)
  if (!device) return false
  
  if (condition.stateKey === 'on') {
    return device.state.on === condition.expectedValue
  }
  return true
}

// Execute single action
const executeAction = async (action, context) => {
  switch (action.actionType) {
    case 'control_device':
      return controlDevice(action.deviceId, action.deviceAction, action.params)
    case 'delay':
      return new Promise(resolve => {
        setTimeout(() => resolve({ success: true }), action.delay || 1000)
      })
    case 'notify':
      return sendNotification(action.message)
    default:
      return { success: false, reason: 'Unknown action type' }
  }
}

// Send notification (uses notification service if available)
const sendNotification = (message) => {
  try {
    const notificationService = require('./notificationService')
    if (notificationService && notificationService.show) {
      notificationService.show({ title: '智能家居', content: message })
    }
  } catch (e) {
    // Notification service not available
    console.log('[smartHomeService] Notification:', message)
  }
  return { success: true }
}

// ============ Task-Device Linking ============

// Link task completion to device action
export const linkTaskToDevice = (taskId, ruleId) => {
  const rules = getRules()
  const rule = rules.find(r => r.id === ruleId)
  
  if (!rule) {
    throw new Error('规则不存在')
  }
  
  // Update rule trigger to include task ID
  updateRule(ruleId, {
    trigger: {
      ...rule.trigger,
      taskId
    }
  })
  
  return { success: true }
}

// Handle task completion event
export const onTaskCompleted = async (taskId, taskData) => {
  // Find rules triggered by this task
  const rules = getRules()
  const triggeredRules = rules.filter(r => 
    r.enabled && 
    r.trigger.type === TRIGGER_TYPES.TASK_COMPLETE &&
    r.trigger.taskId === taskId
  )
  
  const results = []
  for (const rule of triggeredRules) {
    const result = await executeRule(rule.id, {
      taskId,
      taskData,
      timestamp: new Date().toISOString()
    })
    results.push({ ruleId: rule.id, result })
  }
  
  return results
}

// ============ Environment Adaptation ============

// Get current time period
export const getTimePeriod = () => {
  const hour = new Date().getHours()
  
  if (hour >= 6 && hour < 9) return 'morning'
  if (hour >= 9 && hour < 12) return 'forenoon'
  if (hour >= 12 && hour < 14) return 'noon'
  if (hour >= 14 && hour < 18) return 'afternoon'
  if (hour >= 18 && hour < 22) return 'evening'
  return 'night'
}

// Check if should enable night mode
export const shouldEnableNightMode = () => {
  const hour = new Date().getHours()
  return hour >= 22 || hour < 6
}

// Get environment context
export const getEnvironmentContext = () => {
  const now = new Date()
  
  return {
    timePeriod: getTimePeriod(),
    hour: now.getHours(),
    isNight: shouldEnableNightMode(),
    dayOfWeek: now.getDay(),
    isWeekend: now.getDay() === 0 || now.getDay() === 6
  }
}

// Apply environment-based settings
export const applyEnvironmentSettings = (settings) => {
  const env = getEnvironmentContext()
  
  const result = {
    theme: 'light',
    brightness: 100,
    volume: 80
  }
  
  // Apply night mode settings
  if (env.isNight) {
    if (settings.nightMode) {
      result.theme = settings.nightMode.theme || 'dark'
      result.brightness = settings.nightMode.brightness || 30
    }
  }
  
  // Apply time-based volume
  if (env.timePeriod === 'night') {
    result.volume = settings.nightVolume || 30
  } else if (env.timePeriod === 'morning') {
    result.volume = settings.morningVolume || 60
  }
  
  return result
}

// Get available rooms from devices
export const getRooms = () => {
  const devices = getDevices()
  const rooms = [...new Set(devices.map(d => d.room))]
  return rooms.sort()
}

// Mock device discovery
export const discoverDevices = () => {
  // Return mock devices for demo
  return [
    {
      id: 'mock_light_1',
      name: '儿童房灯',
      type: DEVICE_TYPES.LIGHT,
      room: '儿童房',
      status: DEVICE_STATUS.ONLINE,
      manufacturer: '小米',
      model: '吸顶灯'
    },
    {
      id: 'mock_socket_1',
      name: '儿童房插座',
      type: DEVICE_TYPES.SOCKET,
      room: '儿童房',
      status: DEVICE_STATUS.ONLINE,
      manufacturer: '小米',
      model: '智能插座'
    },
    {
      id: 'mock_ac_1',
      name: '客厅空调',
      type: DEVICE_TYPES.AC,
      room: '客厅',
      status: DEVICE_STATUS.ONLINE,
      manufacturer: '格力',
      model: '变频空调'
    },
    {
      id: 'mock_speaker_1',
      name: '小爱音箱',
      type: DEVICE_TYPES.SPEAKER,
      room: '客厅',
      status: DEVICE_STATUS.ONLINE,
      manufacturer: '小米',
      model: '小爱音箱 Pro'
    }
  ]
}

export default {
  // Constants
  DEVICE_TYPES,
  DEVICE_STATUS,
  TRIGGER_TYPES,
  ACTION_TYPES,
  
  // HA Config
  getHAConfig,
  saveHAConfig,
  
  // Devices
  getDevices,
  getDeviceById,
  getDevicesByRoom,
  getDevicesByType,
  addDevice,
  updateDevice,
  deleteDevice,
  controlDevice,
  syncDevicesFromHA,
  getRooms,
  discoverDevices,
  
  // Rules
  getRules,
  getRuleById,
  getRulesByTrigger,
  createRule,
  updateRule,
  deleteRule,
  toggleRule,
  executeRule,
  
  // Task linking
  linkTaskToDevice,
  onTaskCompleted,
  
  // Environment
  getTimePeriod,
  shouldEnableNightMode,
  getEnvironmentContext,
  applyEnvironmentSettings
}
