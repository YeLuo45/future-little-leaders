/**
 * V85 Reading Club Store
 * 读书会系统状态管理
 * 读书俱乐部、书评分享、精彩摘录、读书笔记
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useBabyStore } from './babyStore.js'
import {
  // Club functions
  getClubs,
  getClubById,
  createClub,
  joinClub,
  leaveClub,
  getClubMembers,
  getClubActivities,
  
  // Book review functions
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  likeReview,
  unlikeReview,
  addReviewComment,
  getReviewComments,
  
  // Book excerpt functions
  getExcerpts,
  createExcerpt,
  updateExcerpt,
  deleteExcerpt,
  getBookExcerpts,
  
  // Book club books
  getClubBooks,
  addBookToClub,
  removeBookFromClub,
  
  // Reading circle / book discussion
  getDiscussions,
  createDiscussion,
  addDiscussionReply,
  
  // Reading stats for club
  getClubMemberStats,
  getClubLeaderboard
} from '@/services/readingClubService.js'

export const CLUB_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BANNED: 'banned'
}

export const CLUB_MEMBER_ROLE = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member'
}

export const READING_STYLE = {
  INDEPENDENT: 'independent',   // 独立阅读
  PARENT_CHILD: 'parent_child', // 亲子共读
  GROUP: 'group'                 // 小组共读
}

export const useReadingClubStore = defineStore('readingClub', () => {
  // ==================== 状态 ====================
  
  // 读书俱乐部列表
  const clubs = ref([])
  
  // 当前选中的俱乐部
  const currentClub = ref(null)
  
  // 俱乐部成员列表
  const clubMembers = ref([])
  
  // 俱乐部活动列表
  const clubActivities = ref([])
  
  // 书评列表
  const reviews = ref([])
  
  // 我的书评
  const myReviews = ref([])
  
  // 当前书评详情
  const currentReview = ref(null)
  
  // 书评评论列表
  const reviewComments = ref([])
  
  // 精彩摘录列表
  const excerpts = ref([])
  
  // 我的摘录
  const myExcerpts = ref([])
  
  // 俱乐部藏书
  const clubBooks = ref([])
  
  // 读书圈子讨论
  const discussions = ref([])
  
  // 俱乐部排行榜
  const clubLeaderboard = ref([])
  
  // 加载状态
  const isLoading = ref(false)
  
  // 错误信息
  const errorMessage = ref('')
  
  // ==================== 计算属性 ====================
  
  const babyStore = useBabyStore()
  const currentBabyId = computed(() => babyStore.currentBabyId)
  const currentBaby = computed(() => babyStore.currentBaby)
  
  // 我加入的俱乐部
  const myClubs = computed(() => {
    if (!currentBabyId.value) return []
    return clubs.value.filter(club => {
      const members = getClubMembers(club.id)
      return members.some(m => m.babyId === currentBabyId.value)
    })
  })
  
  // 推荐俱乐部
  const recommendedClubs = computed(() => {
    if (!currentBabyId.value) return clubs.value
    const myClubIds = myClubs.value.map(c => c.id)
    return clubs.value.filter(c => !myClubIds.includes(c.id)).slice(0, 5)
  })
  
  // ==================== 初始化 ====================
  
  const init = () => {
    if (!currentBabyId.value) return
    loadClubs()
    loadMyReviews()
    loadMyExcerpts()
  }
  
  // ==================== 俱乐部管理 ====================
  
  /**
   * 加载俱乐部列表
   */
  const loadClubs = () => {
    clubs.value = getClubs()
  }
  
  /**
   * 加载俱乐部详情
   */
  const loadClubDetail = (clubId) => {
    currentClub.value = getClubById(clubId)
    if (currentClub.value) {
      clubMembers.value = getClubMembers(clubId)
      clubActivities.value = getClubActivities(clubId)
      clubBooks.value = getClubBooks(clubId)
      discussions.value = getDiscussions(clubId)
      clubLeaderboard.value = getClubLeaderboard(clubId)
    }
    return currentClub.value
  }
  
  /**
   * 创建读书俱乐部
   */
  const createNewClub = (clubData) => {
    if (!currentBabyId.value) {
      errorMessage.value = '请先选择宝宝'
      return null
    }
    
    isLoading.value = true
    errorMessage.value = ''
    
    try {
      const club = createClub({
        ...clubData,
        ownerId: currentBabyId.value,
        ownerName: currentBaby.value?.name || '我'
      })
      
      if (club) {
        clubs.value.unshift(club)
      }
      
      return club
    } catch (e) {
      errorMessage.value = e.message
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 加入俱乐部
   */
  const joinNewClub = (clubId) => {
    if (!currentBabyId.value) {
      errorMessage.value = '请先选择宝宝'
      return null
    }
    
    const result = joinClub(clubId, currentBabyId.value, currentBaby.value?.name || '我')
    if (result) {
      // Refresh club data
      loadClubDetail(clubId)
    }
    return result
  }
  
  /**
   * 退出俱乐部
   */
  const leaveCurrentClub = (clubId) => {
    if (!currentBabyId.value) return false
    
    const result = leaveClub(clubId, currentBabyId.value)
    if (result) {
      loadClubDetail(clubId)
    }
    return result
  }
  
  // ==================== 书评管理 ====================
  
  /**
   * 加载书评列表
   */
  const loadReviews = (filter = {}) => {
    reviews.value = getReviews(filter)
  }
  
  /**
   * 加载我的书评
   */
  const loadMyReviews = () => {
    if (!currentBabyId.value) return
    myReviews.value = getReviews({ babyId: currentBabyId.value })
  }
  
  /**
   * 加载书评详情
   */
  const loadReviewDetail = (reviewId) => {
    currentReview.value = getReviewById(reviewId)
    if (currentReview.value) {
      reviewComments.value = getReviewComments(reviewId)
    }
    return currentReview.value
  }
  
  /**
   * 发布书评
   */
  const publishReview = (reviewData) => {
    if (!currentBabyId.value) {
      errorMessage.value = '请先选择宝宝'
      return null
    }
    
    isLoading.value = true
    errorMessage.value = ''
    
    try {
      const review = createReview({
        ...reviewData,
        babyId: currentBabyId.value,
        babyName: currentBaby.value?.name || '我',
        babyAvatar: currentBaby.value?.avatar || ''
      })
      
      if (review) {
        reviews.value.unshift(review)
        myReviews.value.unshift(review)
      }
      
      return review
    } catch (e) {
      errorMessage.value = e.message
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 编辑书评
   */
  const editMyReview = (id, updates) => {
    const review = updateReview(id, updates)
    if (review) {
      const index = reviews.value.findIndex(r => r.id === id)
      if (index !== -1) reviews.value[index] = review
      
      const myIndex = myReviews.value.findIndex(r => r.id === id)
      if (myIndex !== -1) myReviews.value[myIndex] = review
    }
    return review
  }
  
  /**
   * 删除书评
   */
  const removeReview = (id) => {
    const success = deleteReview(id)
    if (success) {
      reviews.value = reviews.value.filter(r => r.id !== id)
      myReviews.value = myReviews.value.filter(r => r.id !== id)
    }
    return success
  }
  
  /**
   * 点赞书评
   */
  const likeMyReview = (reviewId) => {
    if (!currentBabyId.value) return null
    
    const result = likeReview(reviewId, currentBabyId.value)
    if (result) {
      // Update local state
      const review = reviews.value.find(r => r.id === reviewId)
      if (review) {
        review.likes = result.likes
        review.isLiked = true
      }
    }
    return result
  }
  
  /**
   * 取消点赞
   */
  const unlikeMyReview = (reviewId) => {
    if (!currentBabyId.value) return null
    
    const result = unlikeReview(reviewId, currentBabyId.value)
    if (result) {
      const review = reviews.value.find(r => r.id === reviewId)
      if (review) {
        review.likes = result.likes
        review.isLiked = false
      }
    }
    return result
  }
  
  /**
   * 发表评论
   */
  const commentOnReview = (reviewId, content) => {
    if (!currentBabyId.value) {
      errorMessage.value = '请先选择宝宝'
      return null
    }
    
    const comment = addReviewComment(reviewId, {
      babyId: currentBabyId.value,
      babyName: currentBaby.value?.name || '我',
      content
    })
    
    if (comment) {
      reviewComments.value.unshift(comment)
    }
    
    return comment
  }
  
  // ==================== 精彩摘录 ====================
  
  /**
   * 加载摘录列表
   */
  const loadExcerpts = (filter = {}) => {
    excerpts.value = getExcerpts(filter)
  }
  
  /**
   * 加载我的摘录
   */
  const loadMyExcerpts = () => {
    if (!currentBabyId.value) return
    myExcerpts.value = getExcerpts({ babyId: currentBabyId.value })
  }
  
  /**
   * 添加摘录
   */
  const addNewExcerpt = (excerptData) => {
    if (!currentBabyId.value) {
      errorMessage.value = '请先选择宝宝'
      return null
    }
    
    try {
      const excerpt = createExcerpt({
        ...excerptData,
        babyId: currentBabyId.value,
        babyName: currentBaby.value?.name || '我'
      })
      
      if (excerpt) {
        excerpts.value.unshift(excerpt)
        myExcerpts.value.unshift(excerpt)
      }
      
      return excerpt
    } catch (e) {
      errorMessage.value = e.message
      return null
    }
  }
  
  /**
   * 编辑摘录
   */
  const editMyExcerpt = (id, updates) => {
    const excerpt = updateExcerpt(id, updates)
    if (excerpt) {
      const index = excerpts.value.findIndex(e => e.id === id)
      if (index !== -1) excerpts.value[index] = excerpt
      
      const myIndex = myExcerpts.value.findIndex(e => e.id === id)
      if (myIndex !== -1) myExcerpts.value[myIndex] = excerpt
    }
    return excerpt
  }
  
  /**
   * 删除摘录
   */
  const removeExcerpt = (id) => {
    const success = deleteExcerpt(id)
    if (success) {
      excerpts.value = excerpts.value.filter(e => e.id !== id)
      myExcerpts.value = myExcerpts.value.filter(e => e.id !== id)
    }
    return success
  }
  
  /**
   * 获取某本书的摘录
   */
  const getBookExcerptsList = (bookId) => {
    return getBookExcerpts(bookId)
  }
  
  // ==================== 俱乐部藏书 ====================
  
  /**
   * 添加图书到俱乐部
   */
  const addClubBook = (clubId, bookData) => {
    const book = addBookToClub(clubId, bookData)
    if (book) {
      clubBooks.value.unshift(book)
    }
    return book
  }
  
  /**
   * 从俱乐部移除图书
   */
  const removeClubBook = (clubId, bookId) => {
    const success = removeBookFromClub(clubId, bookId)
    if (success) {
      clubBooks.value = clubBooks.value.filter(b => b.id !== bookId)
    }
    return success
  }
  
  // ==================== 读书讨论 ====================
  
  /**
   * 创建讨论话题
   */
  const createNewDiscussion = (clubId, discussionData) => {
    if (!currentBabyId.value) {
      errorMessage.value = '请先选择宝宝'
      return null
    }
    
    const discussion = createDiscussion(clubId, {
      ...discussionData,
      babyId: currentBabyId.value,
      babyName: currentBaby.value?.name || '我'
    })
    
    if (discussion) {
      discussions.value.unshift(discussion)
    }
    
    return discussion
  }
  
  /**
   * 回复讨论
   */
  const replyToDiscussion = (discussionId, content) => {
    if (!currentBabyId.value) {
      errorMessage.value = '请先选择宝宝'
      return null
    }
    
    const reply = addDiscussionReply(discussionId, {
      babyId: currentBabyId.value,
      babyName: currentBaby.value?.name || '我',
      content
    })
    
    return reply
  }
  
  // ==================== 俱乐部成员统计 ====================
  
  /**
   * 获取俱乐部成员统计
   */
  const getMemberStats = (clubId, babyId) => {
    return getClubMemberStats(clubId, babyId)
  }
  
  /**
   * 宝宝切换时重新加载
   */
  const onBabyChange = (babyId) => {
    loadMyReviews()
    loadMyExcerpts()
  }
  
  // ==================== 暴露 ====================
  
  return {
    // 状态
    clubs,
    currentClub,
    clubMembers,
    clubActivities,
    reviews,
    myReviews,
    currentReview,
    reviewComments,
    excerpts,
    myExcerpts,
    clubBooks,
    discussions,
    clubLeaderboard,
    isLoading,
    errorMessage,
    
    // 计算属性
    currentBabyId,
    currentBaby,
    myClubs,
    recommendedClubs,
    
    // 俱乐部方法
    init,
    loadClubs,
    loadClubDetail,
    createNewClub,
    joinNewClub,
    leaveCurrentClub,
    
    // 书评方法
    loadReviews,
    loadMyReviews,
    loadReviewDetail,
    publishReview,
    editMyReview,
    removeReview,
    likeMyReview,
    unlikeMyReview,
    commentOnReview,
    
    // 摘录方法
    loadExcerpts,
    loadMyExcerpts,
    addNewExcerpt,
    editMyExcerpt,
    removeExcerpt,
    getBookExcerptsList,
    
    // 俱乐部藏书
    addClubBook,
    removeClubBook,
    
    // 讨论方法
    createNewDiscussion,
    replyToDiscussion,
    
    // 统计方法
    getMemberStats,
    onBabyChange
  }
})
