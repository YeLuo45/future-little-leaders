/**
 * Flow Templates - 5 Preset Flow Templates
 * Generated with uuid v4 format
 */

const templates = [
  {
    id: 'template-early-sleep',
    name: '早睡早起',
    description: '培养孩子良好的作息习惯，包含晚间准备和晨间活动',
    icon: '🌙',
    nodes: [
      {
        id: 'node-1',
        type: 'checkin',
        x: 100,
        y: 50,
        label: '洗漱准备',
        config: {
          title: '洗漱准备',
          description: '刷牙、洗脸、准备睡衣',
          points: 5
        }
      },
      {
        id: 'node-2',
        type: 'habit',
        x: 300,
        y: 50,
        label: '晚餐时间',
        config: {
          title: '晚餐时间',
          description: '健康晚餐，避免过度饮食',
          points: 5
        }
      },
      {
        id: 'node-3',
        type: 'study',
        x: 500,
        y: 50,
        label: '亲子阅读',
        config: {
          title: '亲子阅读',
          description: '一起阅读绘本故事',
          points: 10
        }
      },
      {
        id: 'node-4',
        type: 'habit',
        x: 700,
        y: 50,
        label: '睡前仪式',
        config: {
          title: '睡前仪式',
          description: '听轻音乐、整理明天衣物',
          points: 5
        }
      },
      {
        id: 'node-5',
        type: 'checkin',
        x: 100,
        y: 200,
        label: '起床整理',
        config: {
          title: '起床整理',
          description: '自己穿衣服、整理床铺',
          points: 5
        }
      },
      {
        id: 'node-6',
        type: 'exercise',
        x: 300,
        y: 200,
        label: '晨练活动',
        config: {
          title: '晨练活动',
          description: '简单拉伸或户外活动',
          points: 10
        }
      }
    ],
    connections: [
      { id: 'conn-1', source: 'node-1', target: 'node-2' },
      { id: 'conn-2', source: 'node-2', target: 'node-3' },
      { id: 'conn-3', source: 'node-3', target: 'node-4' },
      { id: 'conn-4', source: 'node-5', target: 'node-6' }
    ],
    tags: ['作息', '习惯', '早起'],
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'template-reading-habit',
    name: '阅读习惯',
    description: '培养每日阅读的好习惯，从选书到分享形成完整闭环',
    icon: '📚',
    nodes: [
      {
        id: 'node-1',
        type: 'study',
        x: 100,
        y: 50,
        label: '选书环节',
        config: {
          title: '选书环节',
          description: '选择今天想读的书籍',
          points: 3
        }
      },
      {
        id: 'node-2',
        type: 'study',
        x: 300,
        y: 50,
        label: '阅读时间',
        config: {
          title: '阅读时间',
          description: '专注阅读30分钟',
          points: 10
        }
      },
      {
        id: 'node-3',
        type: 'checkin',
        x: 500,
        y: 50,
        label: '笔记记录',
        config: {
          title: '笔记记录',
          description: '记录好词好句或感想',
          points: 5
        }
      },
      {
        id: 'node-4',
        type: 'habit',
        x: 700,
        y: 50,
        label: '分享故事',
        config: {
          title: '分享故事',
          description: '向家人讲述读到的内容',
          points: 8
        }
      },
      {
        id: 'node-5',
        type: 'checkin',
        x: 400,
        y: 200,
        label: '阅读奖励',
        config: {
          title: '阅读奖励',
          description: '获得积分或小贴纸',
          points: 5
        }
      }
    ],
    connections: [
      { id: 'conn-1', source: 'node-1', target: 'node-2' },
      { id: 'conn-2', source: 'node-2', target: 'node-3' },
      { id: 'conn-3', source: 'node-3', target: 'node-4' },
      { id: 'conn-4', source: 'node-4', target: 'node-5' }
    ],
    tags: ['阅读', '学习', '习惯'],
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'template-exercise-plan',
    name: '运动计划',
    description: '科学运动流程，包含热身到拉伸的完整环节',
    icon: '🏃',
    nodes: [
      {
        id: 'node-1',
        type: 'exercise',
        x: 100,
        y: 50,
        label: '热身运动',
        config: {
          title: '热身运动',
          description: '5分钟关节活动',
          points: 5
        }
      },
      {
        id: 'node-2',
        type: 'exercise',
        x: 300,
        y: 50,
        label: '体能训练',
        config: {
          title: '体能训练',
          description: '跑步、跳跃等体能练习',
          points: 10
        }
      },
      {
        id: 'node-3',
        type: 'habit',
        x: 500,
        y: 50,
        label: '休息补水',
        config: {
          title: '休息补水',
          description: '适当休息，补充水分',
          points: 3
        }
      },
      {
        id: 'node-4',
        type: 'exercise',
        x: 700,
        y: 50,
        label: '技能训练',
        config: {
          title: '技能训练',
          description: '学习运动技能或技巧',
          points: 10
        }
      },
      {
        id: 'node-5',
        type: 'exercise',
        x: 400,
        y: 200,
        label: '拉伸放松',
        config: {
          title: '拉伸放松',
          description: '运动后拉伸肌肉',
          points: 5
        }
      }
    ],
    connections: [
      { id: 'conn-1', source: 'node-1', target: 'node-2' },
      { id: 'conn-2', source: 'node-2', target: 'node-3' },
      { id: 'conn-3', source: 'node-3', target: 'node-4' },
      { id: 'conn-4', source: 'node-4', target: 'node-5' }
    ],
    tags: ['运动', '健康', '体能'],
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'template-study-plan',
    name: '学习计划',
    description: '完整的学习流程，从复习到错题整理',
    icon: '📖',
    nodes: [
      {
        id: 'node-1',
        type: 'study',
        x: 100,
        y: 50,
        label: '复习旧知',
        config: {
          title: '复习旧知',
          description: '回顾之前学过的内容',
          points: 5
        }
      },
      {
        id: 'node-2',
        type: 'study',
        x: 300,
        y: 50,
        label: '新课预习',
        config: {
          title: '新课预习',
          description: '提前了解新知识',
          points: 8
        }
      },
      {
        id: 'node-3',
        type: 'checkin',
        x: 500,
        y: 50,
        label: '完成作业',
        config: {
          title: '完成作业',
          description: '认真完成当日作业',
          points: 10
        }
      },
      {
        id: 'node-4',
        type: 'study',
        x: 700,
        y: 50,
        label: '错题整理',
        config: {
          title: '错题整理',
          description: '整理错题，分析原因',
          points: 8
        }
      },
      {
        id: 'node-5',
        type: 'checkin',
        x: 400,
        y: 200,
        label: '学习奖励',
        config: {
          title: '学习奖励',
          description: '完成学习获得奖励',
          points: 5
        }
      }
    ],
    connections: [
      { id: 'conn-1', source: 'node-1', target: 'node-2' },
      { id: 'conn-2', source: 'node-2', target: 'node-3' },
      { id: 'conn-3', source: 'node-3', target: 'node-4' },
      { id: 'conn-4', source: 'node-4', target: 'node-5' }
    ],
    tags: ['学习', '作业', '计划'],
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'template-habit-formation',
    name: '习惯养成',
    description: '目标驱动的习惯养成体系，形成目标-执行-回顾-总结-成就的完整闭环',
    icon: '🌱',
    nodes: [
      {
        id: 'node-1',
        type: 'habit',
        x: 100,
        y: 50,
        label: '目标设定',
        config: {
          title: '目标设定',
          description: '明确要养成的好习惯',
          points: 5
        }
      },
      {
        id: 'node-2',
        type: 'checkin',
        x: 300,
        y: 50,
        label: '每日打卡',
        config: {
          title: '每日打卡',
          description: '坚持完成每日任务',
          points: 10
        }
      },
      {
        id: 'node-3',
        type: 'study',
        x: 500,
        y: 50,
        label: '周回顾',
        config: {
          title: '周回顾',
          description: '每周总结习惯执行情况',
          points: 8
        }
      },
      {
        id: 'node-4',
        type: 'study',
        x: 700,
        y: 50,
        label: '月度总结',
        config: {
          title: '月度总结',
          description: '每月评估习惯养成效果',
          points: 10
        }
      },
      {
        id: 'node-5',
        type: 'checkin',
        x: 400,
        y: 200,
        label: '成就感',
        config: {
          title: '成就感',
          description: '达成目标获得成就徽章',
          points: 15
        }
      }
    ],
    connections: [
      { id: 'conn-1', source: 'node-1', target: 'node-2' },
      { id: 'conn-2', source: 'node-2', target: 'node-3' },
      { id: 'conn-3', source: 'node-3', target: 'node-4' },
      { id: 'conn-4', source: 'node-4', target: 'node-5' }
    ],
    tags: ['习惯', '目标', '成长'],
    createdAt: '2026-01-01T00:00:00.000Z'
  }
]

/**
 * Get all flow templates
 * @returns {Array} Array of template objects
 */
export function getFlowTemplates() {
  return templates
}

/**
 * Get template by ID
 * @param {string} id - Template ID
 * @returns {object|null} Template object or null
 */
export function getTemplateById(id) {
  return templates.find(t => t.id === id) || null
}

/**
 * Get templates by tag
 * @param {string} tag - Tag to filter
 * @returns {Array} Filtered templates
 */
export function getTemplatesByTag(tag) {
  return templates.filter(t => t.tags && t.tags.includes(tag))
}

export default templates