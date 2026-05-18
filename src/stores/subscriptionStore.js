import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { query } from '@/db/sqlite.js'
import { TABLES } from '@/db/schema.js'
import {
  VIP_PLANS,
  VIP_PRIVILEGES,
  isVIPActive,
  getVIPSubscription,
  getBountyTasks,
  getBountyClaims,
  getActiveLimitedRewards
} from '@/services/subscriptionService.js'
import { useBabyStore } from './babyStore'

/**
 * V56 Subscription & Rewards Store
 * Manages VIP subscriptions, bounties, limited rewards
 */
export const useSubscriptionStore = defineStore('subscription', () => {
  // State
  const vipSubscription = ref(null)
  const bountyTasks = ref([])
  const bountyClaims = ref([])
  const limitedRewards = ref([])
  const isLoaded = ref(false)

  // Getters
  const babyStore = useBabyStore()

  // Current baby's VIP status
  const currentBabyVIP = computed(() => {
    const babyId = babyStore.currentBabyId
    if (!babyId) return null
    return getVIPSubscription(babyId)
  })

  // Is current baby VIP active
  const isCurrentBabyVIP = computed(() => {
    const babyId = babyStore.currentBabyId
    if (!babyId) return false
    return isVIPActive(babyId)
  })

  // Current baby's available bounty tasks
  const currentBabyBounties = computed(() => {
    const babyId = babyStore.currentBabyId
    if (!babyId) return []
    return getBountyTasks(babyId)
  })

  // Current baby's bounty claims
  const currentBabyBountyClaims = computed(() => {
    const babyId = babyStore.currentBabyId
    if (!babyId) return []
    return getBountyClaims(babyId)
  })

  // Current baby's active limited rewards
  const currentBabyLimitedRewards = computed(() => {
    const babyId = babyStore.currentBabyId
    if (!babyId) return []
    return getActiveLimitedRewards(babyId)
  })

  // VIP Plans
  const availablePlans = computed(() => Object.values(VIP_PLANS))

  // Get plan by ID
  const getPlanById = (planId) => {
    const plans = Object.values(VIP_PLANS)
    return plans.find(p => p.id === planId)
  }

  // Get privilege details
  const getPrivilegeDetails = (featureId) => {
    return VIP_PRIVILEGES[featureId]
  }

  // Get all privileges
  const allPrivileges = computed(() => Object.values(VIP_PRIVILEGES))

  // Initialize
  const init = async () => {
    if (isLoaded.value) return

    try {
      const babyId = babyStore.currentBabyId
      if (babyId) {
        vipSubscription.value = getVIPSubscription(babyId)
        bountyTasks.value = getBountyTasks(babyId)
        bountyClaims.value = getBountyClaims(babyId)
        limitedRewards.value = getActiveLimitedRewards(babyId)
      }

      isLoaded.value = true
      console.log('[V56] Subscription store initialized')
    } catch (e) {
      console.error('[V56] Subscription store init failed:', e)
    }
  }

  // Refresh all data
  const refresh = () => {
    const babyId = babyStore.currentBabyId
    if (!babyId) return

    vipSubscription.value = getVIPSubscription(babyId)
    bountyTasks.value = getBountyTasks(babyId)
    bountyClaims.value = getBountyClaims(babyId)
    limitedRewards.value = getActiveLimitedRewards(babyId)
  }

  // Get bounty task by ID
  const getBountyById = (taskId) => {
    return bountyTasks.value.find(t => t.id === taskId)
  }

  // Check if bounty is claimed by current baby
  const isBountyClaimed = (taskId) => {
    const babyId = babyStore.currentBabyId
    if (!babyId) return false

    const claims = query(TABLES.BOUNTY_CLAIMS, {
      where: { taskId, babyId }
    })

    return claims.length > 0
  }

  // Check if limited reward is claimed by current baby
  const isLimitedRewardClaimed = (rewardId) => {
    const babyId = babyStore.currentBabyId
    if (!babyId) return false

    const claims = query(TABLES.LIMITED_REWARD_CLAIMS, {
      where: { rewardId, babyId }
    })

    return claims.length > 0
  }

  return {
    // State
    vipSubscription,
    bountyTasks,
    bountyClaims,
    limitedRewards,
    isLoaded,

    // Computed
    currentBabyVIP,
    isCurrentBabyVIP,
    currentBabyBounties,
    currentBabyBountyClaims,
    currentBabyLimitedRewards,
    availablePlans,
    allPrivileges,

    // Methods
    init,
    refresh,
    getPlanById,
    getPrivilegeDetails,
    getBountyById,
    isBountyClaimed,
    isLimitedRewardClaimed
  }
})

export default useSubscriptionStore
