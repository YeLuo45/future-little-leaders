<!-- V7 ChannelSwitch — 渠道开关组件 -->
<template>
  <view class="channel-switch">
    <view class="channel-info">
      <text class="icon">{{ channelInfo.icon }}</text>
      <view class="text">
        <text class="name">{{ channelInfo.name }}</text>
        <text class="desc" v-if="channelInfo.desc">{{ channelInfo.desc }}</text>
      </view>
    </view>
    <switch 
      class="switch" 
      :checked="enabled" 
      @change="onToggle"
      :color="channelInfo.color"
    />
  </view>
</template>

<script>
import { computed } from 'vue'

export default {
  props: {
    channel: {
      type: String,
      required: true
    },
    enabled: {
      type: Boolean,
      default: true
    }
  },
  emits: ['change'],
  setup(props, { emit }) {
    const channelInfo = computed(() => {
      const info = {
        task: { icon: '📋', name: '任务通知', desc: '任务分配、审核、打回', color: '#4A90D9' },
        achievement: { icon: '🎉', name: '成就通知', desc: '成就解锁', color: '#52C41A' },
        points: { icon: '💰', name: '积分通知', desc: '积分到账、扣除', color: '#FA8C16' },
        reminder: { icon: '⏰', name: '定时提醒', desc: '每日任务提醒', color: '#1890FF' },
        flow: { icon: '🔄', name: '流程通知', desc: 'Flow 模板执行状态', color: '#722ED1' },
        skill_tree: { icon: '🌱', name: '技能树通知', desc: '技能解锁、进度', color: '#13C2C2' },
        streak: { icon: '🔥', name: '连续打卡', desc: '打卡提醒、中断警告', color: '#F5222D' },
        growth_report: { icon: '📊', name: '成长报告', desc: '日报、周报生成', color: '#EB2F96' },
        family_broadcast: { icon: '📢', name: '家庭广播', desc: '家长发布公告', color: '#7C3AED' },
        system: { icon: '⚙️', name: '系统通知', desc: '系统更新、维护', color: '#999999' },
        sync: { icon: '☁️', name: '同步通知', desc: '多设备同步状态', color: '#2F54EB' },
        collaboration: { icon: '👥', name: '协作通知', desc: '多人协作事件', color: '#FAAD14' }
      }
      return info[props.channel] || { icon: '📌', name: props.channel, desc: '', color: '#999999' }
    })

    const onToggle = (e) => {
      emit('change', {
        channel: props.channel,
        enabled: e.detail.value
      })
    }

    return {
      channelInfo,
      onToggle
    }
  }
}
</script>

<style scoped>
.channel-switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  background: white;
  border-bottom: 1rpx solid #F0F0F0;
}

.channel-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.icon {
  font-size: 48rpx;
}

.text {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.desc {
  font-size: 22rpx;
  color: #999;
}

.switch {
  transform: scale(0.8);
}
</style>