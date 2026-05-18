import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { useBabyStore } from './babyStore'
import { usePointsStore } from './pointsStore'
import { TABLES } from '../db/schema'

const DAILY_GIFT_LIMIT = 50

export const useFriendStore = defineStore('friend', () => {
  const babyStore = useBabyStore()
  const pointsStore = usePointsStore()

  const friends = ref([])
  const pointGifts = ref([])
  const dailyGiftSent = ref(0)
  const lastGiftDate = ref('')

  const currentBabyFriends = computed(() => {
    const babyId = babyStore.currentBabyId
    return friends.value.filter(f => f.owner_baby_id === babyId && f.status === 'accepted')
  })

  const pendingFriendRequests = computed(() => {
    const babyId = babyStore.currentBabyId
    return friends.value.filter(f => f.friend_baby_id === babyId && f.status === 'pending')
  })

  const sentGifts = computed(() => {
    const babyId = babyStore.currentBabyId
    return pointGifts.value.filter(g => g.from_baby_id === babyId)
  })

  const receivedGifts = computed(() => {
    const babyId = babyStore.currentBabyId
    return pointGifts.value.filter(g => g.to_baby_id === babyId)
  })

  const loadFriends = () => {
    try {
      const stored = uni.getStorageSync('social_friends')
      if (stored) {
        friends.value = JSON.parse(stored)
      }
    } catch (e) {
      console.error('加载好友列表失败:', e)
      friends.value = []
    }
  }

  const saveFriends = () => {
    try {
      uni.setStorageSync('social_friends', JSON.stringify(friends.value))
      return true
    } catch (e) {
      console.error('保存好友列表失败:', e)
      return false
    }
  }

  const loadPointGifts = () => {
    try {
      const stored = uni.getStorageSync('point_gifts')
      if (stored) {
        pointGifts.value = JSON.parse(stored)
      }
    } catch (e) {
      console.error('加载积分赠送记录失败:', e)
      pointGifts.value = []
    }
  }

  const savePointGifts = () => {
    try {
      uni.setStorageSync('point_gifts', JSON.stringify(pointGifts.value))
      return true
    } catch (e) {
      console.error('保存积分赠送记录失败:', e)
      return false
    }
  }

  const checkDailyLimit = () => {
    const today = new Date().toDateString()
    if (lastGiftDate.value !== today) {
      dailyGiftSent.value = 0
      lastGiftDate.value = today
    }
    return dailyGiftSent.value < DAILY_GIFT_LIMIT
  }

  const getRemainingDailyGift = () => {
    checkDailyLimit()
    return DAILY_GIFT_LIMIT - dailyGiftSent.value
  }

  const generateInviteCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const addFriend = async (friendBabyId, status = 'pending') => {
    const babyId = babyStore.currentBabyId
    if (!babyId || !friendBabyId) return null

    const existing = friends.value.find(
      f => f.owner_baby_id === babyId && f.friend_baby_id === friendBabyId
    )
    if (existing) return existing

    const newFriend = {
      id: uuidv4(),
      owner_baby_id: babyId,
      friend_baby_id: friendBabyId,
      status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    friends.value.push(newFriend)
    saveFriends()
    return newFriend
  }

  const removeFriend = (friendId) => {
    const index = friends.value.findIndex(f => f.id === friendId)
    if (index !== -1) {
      friends.value.splice(index, 1)
      saveFriends()
      return true
    }
    return false
  }

  const acceptFriend = (friendId) => {
    const friend = friends.value.find(f => f.id === friendId)
    if (friend) {
      friend.status = 'accepted'
      friend.updated_at = new Date().toISOString()
      saveFriends()
      return true
    }
    return false
  }

  const getFriends = () => {
    return currentBabyFriends.value
  }

  const getFriendById = (friendId) => {
    return friends.value.find(f => f.id === friendId)
  }

  const getFriendBabyInfo = (friendBabyId) => {
    return babyStore.babies.find(b => b.id === friendBabyId)
  }

  const sendGift = async (toBabyId, points, message = '') => {
    const fromBabyId = babyStore.currentBabyId
    if (!fromBabyId || !toBabyId) return false

    if (!checkDailyLimit()) {
      uni.showToast({ title: '今日赠送积分已达上限', icon: 'none' })
      return false
    }

    const currentPoints = pointsStore.getBabyPoints(fromBabyId)
    if (currentPoints < points) {
      uni.showToast({ title: '积分不足', icon: 'none' })
      return false
    }

    const gift = {
      id: uuidv4(),
      from_baby_id: fromBabyId,
      to_baby_id: toBabyId,
      points: parseInt(points),
      message,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    pointsStore.deductBabyPoints(fromBabyId, points, `赠送积分给好友`)
    pointGifts.value.push(gift)
    savePointGifts()

    dailyGiftSent.value += points
    lastGiftDate.value = new Date().toDateString()

    uni.showToast({ title: '赠送成功', icon: 'success' })
    uni.$emit('friendGiftSent', gift)

    return true
  }

  const receiveGifts = () => {
    return receivedGifts.value
  }

  const getTodaySentGifts = () => {
    const today = new Date().toDateString()
    return sentGifts.value.filter(g => {
      const giftDate = new Date(g.created_at).toDateString()
      return giftDate === today
    })
  }

  const init = () => {
    loadFriends()
    loadPointGifts()
    checkDailyLimit()
  }

  return {
    friends,
    pointGifts,
    currentBabyFriends,
    pendingFriendRequests,
    sentGifts,
    receivedGifts,
    loadFriends,
    saveFriends,
    addFriend,
    removeFriend,
    acceptFriend,
    getFriends,
    getFriendById,
    getFriendBabyInfo,
    sendGift,
    receiveGifts,
    getRemainingDailyGift,
    generateInviteCode,
    init
  }
})
