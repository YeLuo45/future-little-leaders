/**
 * Flow Importer - Import flow from JSON/YAML with validation
 */
import yaml from 'js-yaml'

/**
 * Parse JSON text to flow object
 * @param {string} text - JSON string
 * @returns {object} Flow object
 */
export function importFromJSON(text) {
  try {
    const flow = JSON.parse(text)
    return flow
  } catch (err) {
    throw new Error(`JSON解析失败: ${err.message}`)
  }
}

/**
 * Parse YAML text to flow object
 * @param {string} text - YAML string
 * @returns {object} Flow object
 */
export function importFromYAML(text) {
  try {
    const flow = yaml.load(text)
    return flow
  } catch (err) {
    throw new Error(`YAML解析失败: ${err.message}`)
  }
}

/**
 * Validate flow structure
 * @param {object} flow - Flow object to validate
 * @returns {object} { valid: boolean, errors: string[] }
 */
export function validateFlow(flow) {
  const errors = []
  
  if (!flow) {
    errors.push('Flow对象不能为空')
    return { valid: false, errors }
  }
  
  if (!flow.name || typeof flow.name !== 'string') {
    errors.push('流程名称不能为空')
  }
  
  if (!Array.isArray(flow.nodes)) {
    errors.push('nodes必须为数组')
  } else {
    // Validate each node
    flow.nodes.forEach((node, index) => {
      if (!node.id) {
        errors.push(`节点${index + 1}: 缺少id`)
      }
      if (!node.type) {
        errors.push(`节点${index + 1}: 缺少type`)
      }
      if (typeof node.x !== 'number') {
        errors.push(`节点${index + 1}: x坐标必须为数字`)
      }
      if (typeof node.y !== 'number') {
        errors.push(`节点${index + 1}: y坐标必须为数字`)
      }
    })
  }
  
  if (!Array.isArray(flow.connections)) {
    errors.push('connections必须为数组')
  } else {
    // Validate connections reference valid nodes
    const nodeIds = new Set((flow.nodes || []).map(n => n.id))
    flow.connections.forEach((conn, index) => {
      if (!conn.id) {
        errors.push(`连接${index + 1}: 缺少id`)
      }
      if (!conn.source) {
        errors.push(`连接${index + 1}: 缺少source`)
      } else if (!nodeIds.has(conn.source)) {
        errors.push(`连接${index + 1}: source节点不存在`)
      }
      if (!conn.target) {
        errors.push(`连接${index + 1}: 缺少target`)
      } else if (!nodeIds.has(conn.target)) {
        errors.push(`连接${index + 1}: target节点不存在`)
      }
    })
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Read file as text promise
 * @param {File} file - File object
 * @returns {Promise<string>} File content
 */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      resolve(e.target.result)
    }
    
    reader.onerror = (e) => {
      reject(new Error('读取文件失败'))
    }
    
    reader.readAsText(file)
  })
}

/**
 * Auto-detect format and import flow
 * @param {string} text - Raw text content
 * @returns {object} Flow object
 */
export function importFlow(text) {
  const trimmed = text.trim()
  
  // Try JSON first
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return importFromJSON(trimmed)
    } catch (e) {
      // Not valid JSON, try YAML
    }
  }
  
  // Try YAML
  try {
    return importFromYAML(trimmed)
  } catch (e) {
    throw new Error('无法解析内容格式，请确保是有效的JSON或YAML')
  }
}