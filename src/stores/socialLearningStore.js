/**
 * V47 Social Learning Store
 * 社交学习圈 Store - 学习小组、同伴辅导、知识分享、社交挑战
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import socialLearningService from '@/services/socialLearningService.js'

export const useSocialLearningStore = defineStore('socialLearning', () => {
  // =========================================================================
  // 学习小组状态
  // =========================================================================
  const studyGroups = ref([])
  const currentGroup = ref(null)
  const groupDiscussions = ref([])
  const groupTasks = ref([])

  // =========================================================================
  // 同伴辅导状态
  // =========================================================================
  const peerQuestions = ref([])
  const knowledgeExplanations = ref([])

  // =========================================================================
  // 知识分享状态
  // =========================================================================
  const sharingPosts = ref([])

  // =========================================================================
  // 社交挑战状态
  // =========================================================================
  const socialChallenges = ref([])

  // =========================================================================
  // 积分排行榜
  // =========================================================================
  const groupLeaderboard = ref([])

  // =========================================================================
  // 初始化
  // =========================================================================
  const init = () => {
    loadStudyGroups()
    loadPeerQuestions()
    loadKnowledgeExplanations()
    loadSharingPosts()
    loadSocialChallenges()
    loadGroupLeaderboard()
  }

  // =========================================================================
  // 学习小组方法
  // =========================================================================
  const loadStudyGroups = () => {
    studyGroups.value = socialLearningService.getStudyGroups()
  }

  const createStudyGroup = (groupData) => {
    const newGroup = socialLearningService.createStudyGroup(groupData)
    loadStudyGroups()
    return newGroup
  }

  const joinStudyGroup = (groupId) => {
    const success = socialLearningService.joinStudyGroup(groupId)
    if (success) loadStudyGroups()
    return success
  }

  const leaveStudyGroup = (groupId) => {
    const success = socialLearningService.leaveStudyGroup(groupId)
    if (success) loadStudyGroups()
    return success
  }

  const setCurrentGroup = (group) => {
    currentGroup.value = group
    if (group) {
      loadGroupDiscussions(group.id)
      loadGroupTasks(group.id)
    }
  }

  const loadGroupDiscussions = (groupId) => {
    groupDiscussions.value = socialLearningService.getGroupDiscussions(groupId)
  }

  const loadGroupTasks = (groupId) => {
    groupTasks.value = socialLearningService.getGroupTasks(groupId)
  }

  const postDiscussion = (groupId, content, images) => {
    const post = socialLearningService.postDiscussion(groupId, content, images)
    loadGroupDiscussions(groupId)
    return post
  }

  const likeDiscussion = (groupId, discussionId) => {
    socialLearningService.likeDiscussion(groupId, discussionId)
    loadGroupDiscussions(groupId)
  }

  const commentDiscussion = (groupId, discussionId, comment) => {
    socialLearningService.commentDiscussion(groupId, discussionId, comment)
    loadGroupDiscussions(groupId)
  }

  const claimGroupTask = (groupId, taskId) => {
    const success = socialLearningService.claimGroupTask(groupId, taskId)
    if (success) loadGroupTasks(groupId)
    return success
  }

  const completeGroupTask = (groupId, taskId) => {
    const points = socialLearningService.completeGroupTask(groupId, taskId)
    if (points) {
      loadGroupTasks(groupId)
      loadStudyGroups()
    }
    return points
  }

  // =========================================================================
  // 同伴辅导方法
  // =========================================================================
  const loadPeerQuestions = () => {
    peerQuestions.value = socialLearningService.getPeerQuestions()
  }

  const postPeerQuestion = (data) => {
    const question = socialLearningService.postPeerQuestion(data)
    loadPeerQuestions()
    return question
  }

  const answerPeerQuestion = (questionId, content) => {
    const success = socialLearningService.answerPeerQuestion(questionId, content)
    if (success) loadPeerQuestions()
    return success
  }

  const acceptAnswer = (questionId, answerId) => {
    const success = socialLearningService.acceptAnswer(questionId, answerId)
    if (success) loadPeerQuestions()
    return success
  }

  const likeAnswer = (questionId, answerId) => {
    socialLearningService.likeAnswer(questionId, answerId)
    loadPeerQuestions()
  }

  const loadKnowledgeExplanations = () => {
    knowledgeExplanations.value = socialLearningService.getKnowledgeExplanations()
  }

  const postKnowledgeExplanation = (data) => {
    const exp = socialLearningService.postKnowledgeExplanation(data)
    loadKnowledgeExplanations()
    return exp
  }

  // =========================================================================
  // 知识分享方法
  // =========================================================================
  const loadSharingPosts = () => {
    sharingPosts.value = socialLearningService.getSharingPosts()
  }

  const postSharing = (data) => {
    const post = socialLearningService.postSharing(data)
    loadSharingPosts()
    return post
  }

  const likeSharing = (postId) => {
    socialLearningService.likeSharing(postId)
    loadSharingPosts()
  }

  // =========================================================================
  // 社交挑战方法
  // =========================================================================
  const loadSocialChallenges = () => {
    socialChallenges.value = socialLearningService.getSocialChallenges()
  }

  const joinChallenge = (challengeId) => {
    const success = socialLearningService.joinChallenge(challengeId)
    if (success) loadSocialChallenges()
    return success
  }

  const updateChallengeProgress = (challengeId, progress) => {
    const success = socialLearningService.updateChallengeProgress(challengeId, progress)
    if (success) loadSocialChallenges()
    return success
  }

  // =========================================================================
  // 排行榜方法
  // =========================================================================
  const loadGroupLeaderboard = () => {
    groupLeaderboard.value = socialLearningService.getGroupLeaderboard()
  }

  // =========================================================================
  // 计算属性
  // =========================================================================
  const joinedGroups = computed(() => studyGroups.value.filter(g => g.isJoined))
  const activeChallenges = computed(() => socialChallenges.value.filter(c => c.status === 'active'))
  const unsolvedQuestions = computed(() => peerQuestions.value.filter(q => !q.solved))
  const topGroups = computed(() => groupLeaderboard.value.slice(0, 5))

  return {
    // 状态
    studyGroups,
    currentGroup,
    groupDiscussions,
    groupTasks,
    peerQuestions,
    knowledgeExplanations,
    sharingPosts,
    socialChallenges,
    groupLeaderboard,

    // 方法 - 学习小组
    init,
    loadStudyGroups,
    createStudyGroup,
    joinStudyGroup,
    leaveStudyGroup,
    setCurrentGroup,
    loadGroupDiscussions,
    loadGroupTasks,
    postDiscussion,
    likeDiscussion,
    commentDiscussion,
    claimGroupTask,
    completeGroupTask,

    // 方法 - 同伴辅导
    loadPeerQuestions,
    postPeerQuestion,
    answerPeerQuestion,
    acceptAnswer,
    likeAnswer,
    loadKnowledgeExplanations,
    postKnowledgeExplanation,

    // 方法 - 知识分享
    loadSharingPosts,
    postSharing,
    likeSharing,

    // 方法 - 社交挑战
    loadSocialChallenges,
    joinChallenge,
    updateChallengeProgress,

    // 方法 - 排行榜
    loadGroupLeaderboard,

    // 计算属性
    joinedGroups,
    activeChallenges,
    unsolvedQuestions,
    topGroups
  }
})
