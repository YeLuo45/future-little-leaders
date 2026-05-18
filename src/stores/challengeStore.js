import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { useBabyStore } from './babyStore'
import { usePointsStore } from './pointsStore'

export const useChallengeStore = defineStore('challenge', () => {
  const babyStore = useBabyStore()
  const pointsStore = usePointsStore()

  const challenges = ref([])
  const participants = ref([])

  const activeChallenges = computed(() => {
    const now = new Date().toISOString()
    return challenges.value.filter(c => c.status === 'active' && c.end_date > now)
  })

  const myParticipations = computed(() => {
    const babyId = babyStore.currentBabyId
    return participants.value.filter(p => p.baby_id === babyId)
  })

  const loadChallenges = () => {
    try {
      const stored = uni.getStorageSync('social_challenges')
      if (stored) {
        challenges.value = JSON.parse(stored)
      }
    } catch (e) {
      console.error('加载挑战列表失败:', e)
      challenges.value = []
    }
  }

  const saveChallenges = () => {
    try {
      uni.setStorageSync('social_challenges', JSON.stringify(challenges.value))
      return true
    } catch (e) {
      console.error('保存挑战列表失败:', e)
      return false
    }
  }

  const loadParticipants = () => {
    try {
      const stored = uni.getStorageSync('challenge_participants')
      if (stored) {
        participants.value = JSON.parse(stored)
      }
    } catch (e) {
      console.error('加载挑战参与者失败:', e)
      participants.value = []
    }
  }

  const saveParticipants = () => {
    try {
      uni.setStorageSync('challenge_participants', JSON.stringify(participants.value))
      return true
    } catch (e) {
      console.error('保存挑战参与者失败:', e)
      return false
    }
  }

  const createChallenge = (name, type, targetValue, durationDays = 7) => {
    const now = new Date()
    const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000)

    const challenge = {
      id: uuidv4(),
      name,
      type,
      target_value: parseInt(targetValue),
      start_date: now.toISOString(),
      end_date: endDate.toISOString(),
      status: 'active',
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    }

    challenges.value.push(challenge)
    saveChallenges()
    return challenge
  }

  const joinChallenge = (challengeId) => {
    const babyId = babyStore.currentBabyId
    if (!babyId) return null

    const existing = participants.value.find(
      p => p.challenge_id === challengeId && p.baby_id === babyId
    )
    if (existing) return existing

    const participation = {
      id: uuidv4(),
      challenge_id: challengeId,
      baby_id: babyId,
      current_value: 0,
      rank: 0,
      joined_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    participants.value.push(participation)
    saveParticipants()
    return participation
  }

  const updateProgress = (challengeId, babyId, increment) => {
    const participation = participants.value.find(
      p => p.challenge_id === challengeId && p.baby_id === babyId
    )
    if (!participation) return false

    participation.current_value += parseInt(increment)
    participation.updated_at = new Date().toISOString()

    const challenge = challenges.value.find(c => c.id === challengeId)
    if (challenge && participation.current_value >= challenge.target_value) {
      pointsStore.addBabyPoints(babyId, challenge.target_value * 10, '挑战完成奖励')
      uni.showToast({ title: '挑战完成！', icon: 'success' })
    }

    saveParticipants()
    updateRankings(challengeId)
    return true
  }

  const updateRankings = (challengeId) => {
    const challengeParticipants = participants.value
      .filter(p => p.challenge_id === challengeId)
      .sort((a, b) => b.current_value - a.current_value)

    challengeParticipants.forEach((p, index) => {
      p.rank = index + 1
    })
    saveParticipants()
  }

  const getLeaderboard = (challengeId) => {
    return participants.value
      .filter(p => p.challenge_id === challengeId)
      .sort((a, b) => a.rank - b.rank)
      .map(p => ({
        ...p,
        baby: babyStore.babies.find(b => b.id === p.baby_id)
      }))
  }

  const getChallengeById = (challengeId) => {
    return challenges.value.find(c => c.id === challengeId)
  }

  const getMyProgress = (challengeId) => {
    const babyId = babyStore.currentBabyId
    return participants.value.find(
      p => p.challenge_id === challengeId && p.baby_id === babyId
    )
  }

  const getWeeklyChallenges = () => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return challenges.value.filter(c => {
      const start = new Date(c.start_date)
      return start >= weekAgo && c.status === 'active'
    })
  }

  const init = () => {
    loadChallenges()
    loadParticipants()
  }

  return {
    challenges,
    participants,
    activeChallenges,
    myParticipations,
    loadChallenges,
    saveChallenges,
    loadParticipants,
    createChallenge,
    joinChallenge,
    updateProgress,
    getLeaderboard,
    getChallengeById,
    getMyProgress,
    getWeeklyChallenges,
    init
  }
})
