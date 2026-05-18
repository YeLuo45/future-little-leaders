/**
 * Flow Exporter - Export flow to JSON/YAML/Clipboard/Download
 */
import yaml from 'js-yaml'

/**
 * Export flow to JSON string
 * @param {object} flow - Flow object with nodes and connections
 * @returns {string} JSON string
 */
export function exportToJSON(flow) {
  return JSON.stringify(flow, null, 2)
}

/**
 * Export flow to YAML string
 * @param {object} flow - Flow object with nodes and connections
 * @returns {string} YAML string
 */
export function exportToYAML(flow) {
  return yaml.dump(flow, { indent: 2, skipInvalid: true })
}

/**
 * Download content as a file
 * @param {string} content - File content
 * @param {string} filename - File name
 * @param {string} mimeType - MIME type
 */
export function downloadAsFile(content, filename, mimeType = 'application/json') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, 100)
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
    
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    
    const success = document.execCommand('copy')
    document.body.removeChild(textarea)
    return success
  } catch (err) {
    console.error('[FlowExporter] Copy to clipboard failed:', err)
    return false
  }
}

/**
 * Export flow as JSON and download
 * @param {object} flow - Flow object
 */
export function downloadAsJSON(flow) {
  const content = exportToJSON(flow)
  const filename = `${flow.name || 'flow'}_${Date.now()}.json`
  downloadAsFile(content, filename, 'application/json')
}

/**
 * Export flow as YAML and download
 * @param {object} flow - Flow object
 */
export function downloadAsYAML(flow) {
  const content = exportToYAML(flow)
  const filename = `${flow.name || 'flow'}_${Date.now()}.yaml`
  downloadAsFile(content, filename, 'application/x-yaml')
}

/**
 * Copy flow as JSON to clipboard
 * @param {object} flow - Flow object
 * @returns {Promise<boolean>} Success status
 */
export async function copyAsJSON(flow) {
  const content = exportToJSON(flow)
  return copyToClipboard(content)
}

/**
 * Copy flow as YAML to clipboard
 * @param {object} flow - Flow object
 * @returns {Promise<boolean>} Success status
 */
export async function copyAsYAML(flow) {
  const content = exportToYAML(flow)
  return copyToClipboard(content)
}