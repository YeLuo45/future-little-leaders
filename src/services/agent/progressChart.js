/**
 * Progress Chart — SVG-based charts for learning analytics
 * V103: Radar chart, bar chart, line chart rendering
 */

// Radar Chart Renderer
class RadarChart {
  constructor(container, options = {}) {
    this.container = container
    this.options = {
      size: options.size || 300,
      centerX: options.size / 2 || 150,
      centerY: options.size / 2 || 150,
      radius: options.radius || 120,
      levels: options.levels || 5,
      labelOffset: options.labelOffset || 25,
      ...options
    }
  }

  render(data) {
    const { size, centerX, centerY, radius, levels, labelOffset } = this.options
    const labels = data.labels || []
    const datasets = data.datasets || []
    const angleStep = (2 * Math.PI) / labels.length

    let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`

    // Draw background circles
    for (let i = 1; i <= levels; i++) {
      const r = (radius * i) / levels
      svg += `<circle cx="${centerX}" cy="${centerY}" r="${r}" fill="none" stroke="#e5e7eb" stroke-width="1"/>`
    }

    // Draw axes
    labels.forEach((label, i) => {
      const angle = i * angleStep - Math.PI / 2
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      svg += `<line x1="${centerX}" y1="${centerY}" x2="${x}" y2="${y}" stroke="#e5e7eb" stroke-width="1"/>`
      // Labels
      const labelX = centerX + (radius + labelOffset) * Math.cos(angle)
      const labelY = centerY + (radius + labelOffset) * Math.sin(angle)
      svg += `<text x="${labelX}" y="${labelY}" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="#374151">${label}</text>`
    })

    // Draw data polygons
    datasets.forEach((dataset, di) => {
      let points = dataset.data.map((value, i) => {
        const angle = i * angleStep - Math.PI / 2
        const r = (value || 0) * radius
        return {
          x: centerX + r * Math.cos(angle),
          y: centerY + r * Math.sin(angle)
        }
      })

      const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
      svg += `<path d="${pathData}" fill="${dataset.color || '#4f46e5'}20" stroke="${dataset.color || '#4f46e5'}" stroke-width="2" fill-opacity="0.2"/>`

      // Data points
      points.forEach(p => {
        svg += `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${dataset.color || '#4f46e5'}"/>`
      })
    })

    svg += '</svg>'
    return svg
  }
}

// Bar Chart Renderer
class BarChart {
  constructor(container, options = {}) {
    this.container = container
    this.options = {
      width: options.width || 400,
      height: options.height || 200,
      barWidth: options.barWidth || 30,
      gap: options.gap || 10,
      ...options
    }
  }

  render(data) {
    const { width, height, barWidth, gap } = this.options
    const labels = data.labels || []
    const datasets = data.datasets || []
    const maxValue = Math.max(...datasets.flatMap(d => d.data), 1)

    const chartHeight = height - 40 // Leave space for labels
    const totalWidth = labels.length * (barWidth + gap) * datasets.length + gap * (labels.length - 1)
    const startX = (width - totalWidth) / 2

    let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`

    // Y axis labels
    for (let i = 0; i <= 4; i++) {
      const y = chartHeight - (chartHeight * i) / 4
      const value = Math.round(maxValue * i / 4)
      svg += `<text x="10" y="${y + 4}" font-size="10" fill="#9ca3af">${value}</text>`
      svg += `<line x1="40" y1="${y}" x2="${width - 10}" y2="${y}" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4"/>`
    }

    // Bars
    datasets.forEach((dataset, di) => {
      const color = dataset.color || '#4f46e5'
      dataset.data.forEach((value, i) => {
        const barHeight = (value / maxValue) * chartHeight
        const x = startX + i * (datasets.length * (barWidth + gap)) + di * (barWidth + gap)
        const y = chartHeight - barHeight

        svg += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${color}" rx="4"/>`
        svg += `<text x="${x + barWidth / 2}" y="${chartHeight + 15}" text-anchor="middle" font-size="10" fill="#374151">${labels[i] || ''}</text>`
      })
    })

    // Legend
    datasets.forEach((dataset, di) => {
      const legendX = width - 100 + di * 80
      svg += `<rect x="${legendX}" y="${height - 8}" width="12" height="12" fill="${dataset.color || '#4f46e5'}" rx="2"/>`
      svg += `<text x="${legendX + 16}" y="${height + 2}" font-size="10" fill="#374151">${dataset.label || ''}</text>`
    })

    svg += '</svg>'
    return svg
  }
}

// Line Chart Renderer
class LineChart {
  constructor(container, options = {}) {
    this.container = container
    this.options = {
      width: options.width || 400,
      height: options.height || 200,
      ...options
    }
  }

  render(data) {
    const { width, height } = this.options
    const labels = data.labels || []
    const datasets = data.datasets || []
    const allValues = datasets.flatMap(d => d.data)
    const maxValue = Math.max(...allValues, 1)
    const minValue = Math.min(...allValues, 0)
    const range = maxValue - minValue || 1

    const chartHeight = height - 40
    const chartWidth = width - 40
    const stepX = chartWidth / Math.max(labels.length - 1, 1)

    let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`

    // Grid lines
    for (let i = 0; i <= 4; i++) {
      const y = (chartHeight * i) / 4
      svg += `<line x1="30" y1="${y}" x2="${width - 10}" y2="${y}" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4"/>`
    }

    // Lines
    datasets.forEach((dataset, di) => {
      const points = dataset.data.map((value, i) => {
        const x = 30 + i * stepX
        const y = chartHeight - ((value - minValue) / range) * chartHeight
        return { x, y }
      })

      const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
      svg += `<path d="${pathData}" fill="none" stroke="${dataset.color || '#4f46e5'}" stroke-width="2"/>`

      // Points
      points.forEach((p, i) => {
        svg += `<circle cx="${p.x}" cy="${p.y}" r="3" fill="${dataset.color || '#4f46e5'}"/>`
        if (i % 2 === 0) {
          svg += `<text x="${p.x}" y="${height - 5}" text-anchor="middle" font-size="9" fill="#6b7280">${labels[i] || ''}</text>`
        }
      })
    })

    svg += '</svg>'
    return svg
  }
}

// Heatmap Renderer
class HeatmapChart {
  constructor(container, options = {}) {
    this.container = container
    this.options = {
      cellSize: options.cellSize || 40,
      gap: options.gap || 4,
      ...options
    }
  }

  render(data) {
    const { cellSize, gap } = this.options
    const items = data || []
    const width = items.length * (cellSize + gap)
    const height = cellSize + 30

    let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`

    items.forEach((item, i) => {
      const x = i * (cellSize + gap)
      const intensity = item.intensity || 0
      // Color gradient: light (low) to dark (high)
      const color = this.getHeatColor(intensity)
      svg += `<rect x="${x}" y="0" width="${cellSize}" height="${cellSize}" fill="${color}" rx="6"/>`
      svg += `<text x="${x + cellSize / 2}" y="${cellSize + 15}" text-anchor="middle" font-size="11" fill="#374151">${item.dayName || item.date?.slice(5) || ''}</text>`
      svg += `<text x="${x + cellSize / 2}" y="${cellSize / 2 + 4}" text-anchor="middle" font-size="12" fill="#1f2937" font-weight="600">${item.minutes || 0}m</text>`
    })

    svg += '</svg>'
    return svg
  }

  getHeatColor(intensity) {
    // Light yellow to deep red
    const r = Math.round(255 - intensity * 200)
    const g = Math.round(235 - intensity * 180)
    const b = Math.round(200 - intensity * 150)
    return `rgb(${r}, ${g}, ${b})`
  }
}

export { RadarChart, BarChart, LineChart, HeatmapChart }