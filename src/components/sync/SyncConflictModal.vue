<template>
  <view v-if="visible" class="sync-conflict-modal">
    <view class="modal-mask"></view>
    <view class="modal-content">
      <view class="modal-header">
        <text class="icon">⚠️</text>
        <text class="title">数据同步冲突</text>
      </view>

      <view class="conflict-list">
        <view
          class="conflict-item"
          v-for="(conflict, index) in conflicts"
          :key="index"
        >
          <text class="field-name">{{ conflict.field }}</text>
          <view class="value-compare">
            <view class="value-box local">
              <text class="label">本地</text>
              <text class="value">{{ conflict.localValue }}</text>
            </view>
            <text class="vs">vs</text>
            <view class="value-box remote">
              <text class="label">远程</text>
              <text class="value">{{ conflict.remoteValue }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="modal-actions">
        <button class="btn btn-cancel" @click="onCancel">取消</button>
        <button class="btn btn-local" @click="onKeepLocal">保留本地</button>
        <button class="btn btn-remote" @click="onKeepRemote">保留远程</button>
      </view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  visible: { type: Boolean, default: false },
  conflicts: { type: Array, default: () => [] },
  entityType: { type: String, default: '' },
  entityId: { type: String, default: '' }
})

const emit = defineEmits(['cancel', 'keep-local', 'keep-remote'])

function onCancel() {
  emit('cancel')
}

function onKeepLocal() {
  emit('keep-local', { entityType: props.entityType, entityId: props.entityId, choice: 'local' })
}

function onKeepRemote() {
  emit('keep-remote', { entityType: props.entityType, entityId: props.entityId, choice: 'remote' })
}
</script>

<style scoped>
.sync-conflict-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 500px;
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.modal-header .icon {
  font-size: 32px;
}

.modal-header .title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.conflict-list {
  margin-bottom: 20px;
}

.conflict-item {
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 12px;
}

.field-name {
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin-bottom: 8px;
  display: block;
}

.value-compare {
  display: flex;
  align-items: center;
  gap: 8px;
}

.value-box {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
}

.value-box.local {
  background: #e8f4ff;
}

.value-box.remote {
  background: #fff3e8;
}

.value-box .label {
  font-size: 11px;
  color: #999;
  display: block;
  margin-bottom: 4px;
}

.value-box .value {
  font-size: 14px;
  color: #333;
  word-break: break-all;
}

.vs {
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  border: none;
  cursor: pointer;
}

.btn-cancel {
  background: #f0f0f0;
  color: #666;
}

.btn-local {
  background: #2196f3;
  color: #fff;
}

.btn-remote {
  background: #ff9800;
  color: #fff;
}
</style>