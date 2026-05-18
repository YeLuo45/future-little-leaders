<template>
  <view class="export-wizard">
    <!-- Step indicator -->
    <view class="step-indicator">
      <view 
        v-for="(step, index) in steps" 
        :key="index"
        :class="['step', { active: currentStep === index, completed: currentStep > index }]"
      >
        <view class="step-number">{{ index + 1 }}</view>
        <view class="step-label">{{ step.label }}</view>
      </view>
    </view>

    <!-- Step 1: Select Data Types -->
    <view v-if="currentStep === 0" class="step-content">
      <view class="step-title">{{ $t('dataExport.selectData') }}</view>
      <view class="data-types">
        <view 
          v-for="type in dataTypeOptions" 
          :key="type.key"
          :class="['data-type-item', { selected: selectedDataTypes.includes(type.key) }]"
          @click="toggleDataType(type.key)"
        >
          <view class="checkbox">
            <text v-if="selectedDataTypes.includes(type.key)" class="check-icon">✓</text>
          </view>
          <view class="type-info">
            <view class="type-name">{{ type.label }}</view>
            <view class="type-desc">{{ type.description }}</view>
          </view>
        </view>
      </view>
    </view>

    <!-- Step 2: Select Format -->
    <view v-if="currentStep === 1" class="step-content">
      <view class="step-title">{{ $t('dataExport.selectFormat') }}</view>
      <view class="format-options">
        <view 
          v-for="format in formatOptions" 
          :key="format.key"
          :class="['format-item', { selected: selectedFormat === format.key }]"
          @click="selectedFormat = format.key"
        >
          <view class="format-icon">{{ format.icon }}</view>
          <view class="format-name">{{ format.label }}</view>
          <view class="format-desc">{{ format.description }}</view>
        </view>
      </view>
    </view>

    <!-- Step 3: Set Date Range (Optional) -->
    <view v-if="currentStep === 2" class="step-content">
      <view class="step-title">{{ $t('dataExport.dateRange') }}</view>
      <view class="date-range-info">{{ $t('dataExport.dateRangeHint') }}</view>
      <view class="date-inputs">
        <view class="date-field">
          <text class="date-label">{{ $t('dataExport.startDate') }}</text>
          <input 
            type="date" 
            v-model="startDate" 
            class="date-input"
          />
        </view>
        <view class="date-field">
          <text class="date-label">{{ $t('dataExport.endDate') }}</text>
          <input 
            type="date" 
            v-model="endDate" 
            class="date-input"
          />
        </view>
      </view>
      <view class="quick-ranges">
        <view 
          v-for="range in quickDateRanges" 
          :key="range.key"
          class="quick-range-btn"
          @click="applyQuickRange(range)"
        >
          {{ range.label }}
        </view>
      </view>
    </view>

    <!-- Step 4: Export Preview -->
    <view v-if="currentStep === 3" class="step-content">
      <view class="step-title">{{ $t('dataExport.preview') }}</view>
      <view class="preview-summary">
        <view class="summary-item">
          <text class="summary-label">{{ $t('dataExport.dataTypes') }}</text>
          <text class="summary-value">{{ selectedDataTypes.join(', ') }}</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">{{ $t('dataExport.format') }}</text>
          <text class="summary-value">{{ selectedFormat.toUpperCase() }}</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">{{ $t('dataExport.dateRange') }}</text>
          <text class="summary-value">{{ dateRangeDisplay }}</text>
        </view>
      </view>
      <view class="export-privacy">
        <view class="privacy-icon">🔒</view>
        <view class="privacy-text">{{ $t('dataExport.privacyNote') }}</view>
      </view>
    </view>

    <!-- Step 5: Export Complete -->
    <view v-if="currentStep === 4" class="step-content">
      <view class="complete-icon">✅</view>
      <view class="complete-title">{{ $t('dataExport.exportComplete') }}</view>
      <view class="complete-subtitle">{{ $t('dataExport.exportSuccess') }}</view>
      
      <view v-if="exportResult" class="export-result">
        <view class="result-hash">
          <text class="hash-label">{{ $t('dataExport.contentHash') }}</text>
          <text class="hash-value">{{ exportResult.meta.contentHash }}</text>
        </view>
        <view class="result-size">
          {{ $t('dataExport.dataSize') }}: {{ exportSizeDisplay }}
        </view>
      </view>

      <view class="export-actions">
        <button class="action-btn primary" @click="downloadExport">
          {{ $t('dataExport.download') }}
        </button>
        <button class="action-btn secondary" @click="shareExport">
          {{ $t('dataExport.share') }}
        </button>
      </view>
    </view>

    <!-- Navigation buttons -->
    <view v-if="currentStep < 4" class="nav-buttons">
      <button 
        v-if="currentStep > 0" 
        class="nav-btn back" 
        @click="prevStep"
      >
        {{ $t('common.back') }}
      </button>
      <button 
        class="nav-btn next" 
        :disabled="!canProceed"
        @click="nextStep"
      >
        {{ currentStep === 3 ? $t('dataExport.export') : $t('common.next') }}
      </button>
    </view>

    <!-- Loading overlay -->
    <view v-if="isExporting" class="loading-overlay">
      <view class="loading-spinner"></view>
      <text class="loading-text">{{ $t('dataExport.exporting') }}</text>
    </view>
  </view>
</template>

<script>
import { useI18n } from '@/plugins/i18n'
import { DATA_TYPES, EXPORT_FORMATS, collectExportData, exportAsJSON, exportAsCSV, generateExportFilename } from '@/services/dataExportService'

const { t } = useI18n()

export default {
  data() {
    return {
      currentStep: 0,
      steps: [
        { label: t('dataExport.stepSelectData') },
        { label: t('dataExport.stepSelectFormat') },
        { label: t('dataExport.stepDateRange') },
        { label: t('dataExport.stepPreview') }
      ],
      selectedDataTypes: [DATA_TYPES.TASKS, DATA_TYPES.ACHIEVEMENTS, DATA_TYPES.POINTS],
      selectedFormat: EXPORT_FORMATS.JSON,
      startDate: '',
      endDate: '',
      isExporting: false,
      exportResult: null,
      exportContent: null,
      dataTypeOptions: [
        { key: DATA_TYPES.TASKS, label: t('dataExport.tasks'), description: t('dataExport.tasksDesc') },
        { key: DATA_TYPES.ACHIEVEMENTS, label: t('dataExport.achievements'), description: t('dataExport.achievementsDesc') },
        { key: DATA_TYPES.POINTS, label: t('dataExport.points'), description: t('dataExport.pointsDesc') },
        { key: DATA_TYPES.GROWTH_RECORDS, label: t('dataExport.growthRecords'), description: t('dataExport.growthRecordsDesc') },
        { key: DATA_TYPES.FAMILY_DATA, label: t('dataExport.familyData'), description: t('dataExport.familyDataDesc') },
        { key: DATA_TYPES.PROFILE, label: t('dataExport.profile'), description: t('dataExport.profileDesc') }
      ],
      formatOptions: [
        { key: EXPORT_FORMATS.JSON, icon: '{ }', label: 'JSON', description: t('dataExport.jsonDesc') },
        { key: EXPORT_FORMATS.CSV, icon: '📊', label: 'CSV', description: t('dataExport.csvDesc') }
      ],
      quickDateRanges: [
        { key: 'all', label: t('dataExport.allTime') },
        { key: 'month', label: t('dataExport.lastMonth') },
        { key: '3months', label: t('dataExport.last3Months') },
        { key: 'year', label: t('dataExport.lastYear') }
      ]
    }
  },
  computed: {
    canProceed() {
      if (this.currentStep === 0) {
        return this.selectedDataTypes.length > 0
      }
      if (this.currentStep === 1) {
        return !!this.selectedFormat
      }
      return true
    },
    dateRangeDisplay() {
      if (!this.startDate && !this.endDate) {
        return t('dataExport.allTime')
      }
      return `${this.startDate || 'N/A'} - ${this.endDate || 'N/A'}`
    },
    exportSizeDisplay() {
      if (!this.exportContent) return '0 KB'
      const bytes = new Blob([this.exportContent]).size
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    }
  },
  methods: {
    toggleDataType(type) {
      const index = this.selectedDataTypes.indexOf(type)
      if (index > -1) {
        this.selectedDataTypes.splice(index, 1)
      } else {
        this.selectedDataTypes.push(type)
      }
    },
    applyQuickRange(range) {
      const now = new Date()
      if (range.key === 'all') {
        this.startDate = ''
        this.endDate = ''
      } else if (range.key === 'month') {
        const d = new Date(now)
        d.setMonth(d.getMonth() - 1)
        this.startDate = d.toISOString().split('T')[0]
        this.endDate = now.toISOString().split('T')[0]
      } else if (range.key === '3months') {
        const d = new Date(now)
        d.setMonth(d.getMonth() - 3)
        this.startDate = d.toISOString().split('T')[0]
        this.endDate = now.toISOString().split('T')[0]
      } else if (range.key === 'year') {
        const d = new Date(now)
        d.setFullYear(d.getFullYear() - 1)
        this.startDate = d.toISOString().split('T')[0]
        this.endDate = now.toISOString().split('T')[0]
      }
    },
    async nextStep() {
      if (this.currentStep === 3) {
        await this.performExport()
      } else {
        this.currentStep++
      }
    },
    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--
      }
    },
    async performExport() {
      this.isExporting = true
      try {
        // Collect data
        const data = await collectExportData({
          dataTypes: this.selectedDataTypes,
          startDate: this.startDate || null,
          endDate: this.endDate || null,
          format: this.selectedFormat
        })

        // Format content
        if (this.selectedFormat === EXPORT_FORMATS.JSON) {
          this.exportContent = exportAsJSON(data)
        } else if (this.selectedFormat === EXPORT_FORMATS.CSV) {
          this.exportContent = exportAsCSV(data)
        }

        this.exportResult = data
        this.currentStep = 4
      } catch (e) {
        console.error('Export failed:', e)
        uni.showToast({
          title: t('dataExport.exportFailed'),
          icon: 'none'
        })
      } finally {
        this.isExporting = false
      }
    },
    downloadExport() {
      if (!this.exportContent) return
      
      const filename = generateExportFilename(this.selectedFormat)
      const mimeType = this.selectedFormat === 'json' ? 'application/json' : 'text/csv'
      
      // For uni-app, use uni.downloadFile or save to local
      const blob = new Blob([this.exportContent], { type: mimeType })
      const url = URL.createObjectURL(blob)
      
      // Note: Actual download implementation depends on platform
      uni.showToast({
        title: t('dataExport.downloadStarted'),
        icon: 'success'
      })
    },
    shareExport() {
      if (!this.exportContent) return
      
      uni.share({
        provider: 'weixin',
        type: 0,
        title: t('dataExport.shareTitle'),
        content: t('dataExport.shareContent'),
        success: () => {
          uni.showToast({
            title: t('dataExport.shareSuccess'),
            icon: 'success'
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.export-wizard {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.step-indicator {
  display: flex;
  justify-content: space-between;
  padding: 20rpx;
  background: white;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
}

.step {
  flex: 1;
  text-align: center;
  position: relative;
}

.step.active .step-number {
  background: #8477fa;
  color: white;
}

.step.completed .step-number {
  background: #52c41a;
  color: white;
}

.step-number {
  width: 48rpx;
  height: 48rpx;
  line-height: 48rpx;
  border-radius: 50%;
  background: #ddd;
  color: #666;
  margin: 0 auto 8rpx;
  font-size: 24rpx;
}

.step-label {
  font-size: 22rpx;
  color: #666;
}

.step-content {
  background: white;
  border-radius: 12rpx;
  padding: 30rpx;
  min-height: 600rpx;
}

.step-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
  color: #333;
}

.data-type-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
  cursor: pointer;
}

.data-type-item.selected {
  border-color: #8477fa;
  background: #f8f7ff;
}

.checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #ddd;
  border-radius: 8rpx;
  margin-right: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.data-type-item.selected .checkbox {
  background: #8477fa;
  border-color: #8477fa;
  color: white;
}

.check-icon {
  color: white;
  font-size: 24rpx;
}

.type-info {
  flex: 1;
}

.type-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 4rpx;
}

.type-desc {
  font-size: 22rpx;
  color: #999;
}

.format-options {
  display: flex;
  gap: 20rpx;
}

.format-item {
  flex: 1;
  padding: 30rpx;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  text-align: center;
  cursor: pointer;
}

.format-item.selected {
  border-color: #8477fa;
  background: #f8f7ff;
}

.format-icon {
  font-size: 48rpx;
  margin-bottom: 16rpx;
}

.format-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.format-desc {
  font-size: 22rpx;
  color: #999;
}

.date-range-info {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 30rpx;
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
}

.date-inputs {
  margin-bottom: 30rpx;
}

.date-field {
  margin-bottom: 20rpx;
}

.date-label {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.date-input {
  width: 100%;
  padding: 16rpx;
  border: 2rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.quick-ranges {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.quick-range-btn {
  padding: 12rpx 24rpx;
  background: #f0f0f0;
  border-radius: 30rpx;
  font-size: 24rpx;
  color: #666;
}

.preview-summary {
  background: #f9f9f9;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 30rpx;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #eee;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-label {
  font-size: 26rpx;
  color: #666;
}

.summary-value {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}

.export-privacy {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #e8f5e9;
  border-radius: 8rpx;
}

.privacy-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
}

.privacy-text {
  font-size: 24rpx;
  color: #2e7d32;
}

.complete-icon {
  text-align: center;
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.complete-title {
  text-align: center;
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.complete-subtitle {
  text-align: center;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 40rpx;
}

.export-result {
  background: #f9f9f9;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 40rpx;
}

.result-hash {
  margin-bottom: 16rpx;
}

.hash-label {
  display: block;
  font-size: 22rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.hash-value {
  font-size: 20rpx;
  color: #8477fa;
  word-break: break-all;
  font-family: monospace;
}

.result-size {
  font-size: 24rpx;
  color: #666;
}

.export-actions {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  text-align: center;
}

.action-btn.primary {
  background: #8477fa;
  color: white;
}

.action-btn.secondary {
  background: white;
  color: #8477fa;
  border: 2rpx solid #8477fa;
}

.nav-buttons {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}

.nav-btn {
  flex: 1;
  padding: 24rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  text-align: center;
}

.nav-btn.back {
  background: white;
  color: #666;
}

.nav-btn.next {
  background: #8477fa;
  color: white;
}

.nav-btn.next[disabled] {
  background: #ccc;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #fff;
  border-top-color: #8477fa;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: white;
  font-size: 28rpx;
  margin-top: 20rpx;
}
</style>
