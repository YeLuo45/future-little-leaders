/**
 * V85 Reading Club Service
 * 读书会服务层
 * 读书俱乐部、书评分享、精彩摘录、读书圈子
 */

// ==================== 常量定义 ====================

// 俱乐部状态
export const CLUB_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BANNED: 'banned'
}

// 俱乐部成员角色
export const CLUB_MEMBER_ROLE = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member'
}

// 阅读方式
export const READING_STYLE = {
  INDEPENDENT: 'independent',
  PARENT_CHILD: 'parent_child',
  GROUP: 'group'
}

// localStorage keys
const CLUBS_KEY = 'reading_clubs'
const CLUB_MEMBERS_KEY = 'reading_club_members'
const CLUB_ACTIVITIES_KEY = 'reading_club_activities'
const REVIEWS_KEY = 'reading_reviews'
const REVIEW_COMMENTS_KEY = 'reading_review_comments'
const EXCERPTS_KEY = 'reading_excerpts'
const CLUB_BOOKS_KEY = 'reading_club_books'
const DISCUSSIONS_KEY = 'reading_discussions'
const DISCUSSION_REPLIES_KEY = 'reading_discussion_replies'

// ==================== 辅助函数 ====================

function generateId(prefix = 'rc') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`
}

function now() {
  return new Date().toISOString()
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// ==================== 内置俱乐部数据 ====================

const BUILT_IN_CLUBS = [
  {
    id: 'club_1',
    name: '小小阅读者',
    description: '适合3-6岁宝宝的绘本阅读俱乐部',
    coverImage: '/static/images/club-reading-1.jpg',
    category: 'picture_book',
    ageRange: '3-6',
    memberCount: 128,
    bookCount: 45,
    createdAt: '2024-01-15T08:00:00.000Z',
    ownerId: 'system',
    ownerName: '系统',
    status: 'active',
    tags: ['绘本', '亲子阅读', '习惯培养'],
    isPublic: true
  },
  {
    id: 'club_2',
    name: '童话探险家',
    description: '6-9岁儿童的经典童话阅读俱乐部',
    coverImage: '/static/images/club-reading-2.jpg',
    category: 'fairy_tale',
    ageRange: '6-9',
    memberCount: 86,
    bookCount: 32,
    createdAt: '2024-02-20T08:00:00.000Z',
    ownerId: 'system',
    ownerName: '系统',
    status: 'active',
    tags: ['童话', '想象力', '冒险'],
    isPublic: true
  },
  {
    id: 'club_3',
    name: '科学小读者',
    description: '培养科学思维的科学科普读物俱乐部',
    coverImage: '/static/images/club-reading-3.jpg',
    category: 'science',
    ageRange: '8-12',
    memberCount: 65,
    bookCount: 28,
    createdAt: '2024-03-10T08:00:00.000Z',
    ownerId: 'system',
    ownerName: '系统',
    status: 'active',
    tags: ['科普', '科学', '探索'],
    isPublic: true
  }
]

// 内置俱乐部成员
const BUILT_IN_MEMBERS = {
  club_1: [
    { id: 'm1', clubId: 'club_1', babyId: 'baby_1', babyName: '小明', role: 'owner', joinedAt: '2024-01-15T08:00:00.000Z', readingDays: 45, booksRead: 12 },
    { id: 'm2', clubId: 'club_1', babyId: 'baby_2', babyName: '小红', role: 'admin', joinedAt: '2024-01-20T08:00:00.000Z', readingDays: 38, booksRead: 10 },
    { id: 'm3', clubId: 'club_1', babyId: 'baby_3', babyName: '小华', role: 'member', joinedAt: '2024-02-01T08:00:00.000Z', readingDays: 25, booksRead: 7 }
  ],
  club_2: [
    { id: 'm4', clubId: 'club_2', babyId: 'baby_4', babyName: '小刚', role: 'owner', joinedAt: '2024-02-20T08:00:00.000Z', readingDays: 30, booksRead: 8 }
  ],
  club_3: [
    { id: 'm5', clubId: 'club_3', babyId: 'baby_5', babyName: '小丽', role: 'owner', joinedAt: '2024-03-10T08:00:00.000Z', readingDays: 20, booksRead: 5 }
  ]
}

// 内置俱乐部活动
const BUILT_IN_ACTIVITIES = [
  {
    id: 'act_1',
    clubId: 'club_1',
    type: 'reading',
    title: '本周共读《猜猜我有多爱你》',
    description: '一起阅读经典绘本，讨论爱与亲情',
    startDate: formatDate(now()),
    endDate: formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
    participantCount: 45,
    status: 'active'
  },
  {
    id: 'act_2',
    clubId: 'club_1',
    type: 'discussion',
    title: '周末读书分享会',
    description: '分享你最喜欢的一本书',
    startDate: formatDate(now()),
    endDate: formatDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)),
    participantCount: 28,
    status: 'active'
  }
]

// 内置讨论话题
const BUILT_IN_DISCUSSIONS = [
  {
    id: 'disc_1',
    clubId: 'club_1',
    babyId: 'baby_1',
    babyName: '小明',
    title: '你们最喜欢哪本绘本？',
    content: '我最喜欢《好饿的毛毛虫》，因为可以学到很多食物的名字和数字！你们呢？',
    createdAt: now(),
    replyCount: 12,
    likes: 25
  },
  {
    id: 'disc_2',
    clubId: 'club_1',
    babyId: 'baby_2',
    babyName: '小红',
    title: '推荐《爷爷一定有办法》',
    content: '这本书讲了一个非常温暖的故事，关于爷爷对孙子的爱。非常推荐！',
    createdAt: now(),
    replyCount: 8,
    likes: 18
  }
]

// ==================== 俱乐部服务 ====================

/**
 * 获取所有俱乐部
 */
export function getClubs() {
  try {
    const stored = uni.getStorageSync(CLUBS_KEY)
    if (stored) {
      const customClubs = JSON.parse(stored)
      return [...BUILT_IN_CLUBS, ...customClubs]
    }
    return BUILT_IN_CLUBS
  } catch (e) {
    console.error('[ReadingClubService] 获取俱乐部列表失败:', e)
    return BUILT_IN_CLUBS
  }
}

/**
 * 根据ID获取俱乐部
 */
export function getClubById(clubId) {
  const clubs = getClubs()
  return clubs.find(c => c.id === clubId) || null
}

/**
 * 创建俱乐部
 */
export function createClub(clubData) {
  try {
    const stored = uni.getStorageSync(CLUBS_KEY)
    const customClubs = stored ? JSON.parse(stored) : []
    
    const newClub = {
      id: generateId('club'),
      name: clubData.name,
      description: clubData.description || '',
      coverImage: clubData.coverImage || '',
      category: clubData.category || 'general',
      ageRange: clubData.ageRange || '',
      memberCount: 1,
      bookCount: 0,
      createdAt: now(),
      ownerId: clubData.ownerId,
      ownerName: clubData.ownerName || '我',
      status: 'active',
      tags: clubData.tags || [],
      isPublic: clubData.isPublic !== false
    }
    
    customClubs.unshift(newClub)
    uni.setStorageSync(CLUBS_KEY, JSON.stringify(customClubs))
    
    // 添加创建者为成员
    addClubMember(newClub.id, {
      babyId: clubData.ownerId,
      babyName: clubData.ownerName,
      role: 'owner'
    })
    
    return newClub
  } catch (e) {
    console.error('[ReadingClubService] 创建俱乐部失败:', e)
    return null
  }
}

/**
 * 添加俱乐部成员
 */
function addClubMember(clubId, memberData) {
  try {
    const membersKey = `${CLUB_MEMBERS_KEY}_${clubId}`
    const stored = uni.getStorageSync(membersKey)
    const members = stored ? JSON.parse(stored) : []
    
    // 检查是否已是成员
    if (members.some(m => m.babyId === memberData.babyId)) {
      return members.find(m => m.babyId === memberData.babyId)
    }
    
    const newMember = {
      id: generateId('mbr'),
      clubId,
      babyId: memberData.babyId,
      babyName: memberData.babyName,
      role: memberData.role || 'member',
      joinedAt: now(),
      readingDays: 0,
      booksRead: 0
    }
    
    members.push(newMember)
    uni.setStorageSync(membersKey, JSON.stringify(members))
    
    // 更新俱乐部成员数
    updateClubMemberCount(clubId, 1)
    
    return newMember
  } catch (e) {
    console.error('[ReadingClubService] 添加成员失败:', e)
    return null
  }
}

/**
 * 获取俱乐部成员
 */
export function getClubMembers(clubId) {
  try {
    const membersKey = `${CLUB_MEMBERS_KEY}_${clubId}`
    const stored = uni.getStorageSync(membersKey)
    
    if (stored) {
      return JSON.parse(stored)
    }
    
    return BUILT_IN_MEMBERS[clubId] || []
  } catch (e) {
    console.error('[ReadingClubService] 获取成员失败:', e)
    return BUILT_IN_MEMBERS[clubId] || []
  }
}

/**
 * 加入俱乐部
 */
export function joinClub(clubId, babyId, babyName) {
  return addClubMember(clubId, { babyId, babyName, role: 'member' })
}

/**
 * 退出俱乐部
 */
export function leaveClub(clubId, babyId) {
  try {
    const membersKey = `${CLUB_MEMBERS_KEY}_${clubId}`
    const stored = uni.getStorageSync(membersKey)
    
    if (!stored) return false
    
    const members = JSON.parse(stored)
    const filtered = members.filter(m => m.babyId !== babyId)
    uni.setStorageSync(membersKey, JSON.stringify(filtered))
    
    // 更新俱乐部成员数
    updateClubMemberCount(clubId, -1)
    
    return true
  } catch (e) {
    console.error('[ReadingClubService] 退出俱乐部失败:', e)
    return false
  }
}

/**
 * 更新俱乐部成员数
 */
function updateClubMemberCount(clubId, delta) {
  try {
    const clubs = getClubs()
    const index = clubs.findIndex(c => c.id === clubId)
    if (index !== -1) {
      clubs[index].memberCount = Math.max(0, (clubs[index].memberCount || 0) + delta)
      // 只更新自定义俱乐部
      const stored = uni.getStorageSync(CLUBS_KEY)
      if (stored) {
        const customClubs = JSON.parse(stored)
        const customIndex = customClubs.findIndex(c => c.id === clubId)
        if (customIndex !== -1) {
          customClubs[customIndex] = clubs[index]
          uni.setStorageSync(CLUBS_KEY, JSON.stringify(customClubs))
        }
      }
    }
  } catch (e) {
    console.error('[ReadingClubService] 更新成员数失败:', e)
  }
}

/**
 * 获取俱乐部活动
 */
export function getClubActivities(clubId) {
  try {
    const stored = uni.getStorageSync(`${CLUB_ACTIVITIES_KEY}_${clubId}`)
    if (stored) {
      return JSON.parse(stored)
    }
    return BUILT_IN_ACTIVITIES.filter(a => a.clubId === clubId)
  } catch (e) {
    console.error('[ReadingClubService] 获取活动失败:', e)
    return BUILT_IN_ACTIVITIES.filter(a => a.clubId === clubId)
  }
}

// ==================== 书评服务 ====================

/**
 * 获取书评列表
 */
export function getReviews(filter = {}) {
  try {
    const stored = uni.getStorageSync(REVIEWS_KEY)
    if (!stored) return []
    
    let reviews = JSON.parse(stored)
    
    // 筛选
    if (filter.babyId) {
      reviews = reviews.filter(r => r.babyId === filter.babyId)
    }
    if (filter.bookId) {
      reviews = reviews.filter(r => r.bookId === filter.bookId)
    }
    if (filter.clubId) {
      reviews = reviews.filter(r => r.clubId === filter.clubId)
    }
    
    // 按时间排序
    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    return reviews
  } catch (e) {
    console.error('[ReadingClubService] 获取书评失败:', e)
    return []
  }
}

/**
 * 获取书评详情
 */
export function getReviewById(reviewId) {
  try {
    const stored = uni.getStorageSync(REVIEWS_KEY)
    if (!stored) return null
    const reviews = JSON.parse(stored)
    return reviews.find(r => r.id === reviewId) || null
  } catch (e) {
    console.error('[ReadingClubService] 获取书评详情失败:', e)
    return null
  }
}

/**
 * 发布书评
 */
export function createReview(reviewData) {
  try {
    const stored = uni.getStorageSync(REVIEWS_KEY)
    const reviews = stored ? JSON.parse(stored) : []
    
    const newReview = {
      id: generateId('rev'),
      babyId: reviewData.babyId,
      babyName: reviewData.babyName,
      babyAvatar: reviewData.babyAvatar || '',
      bookId: reviewData.bookId || '',
      bookTitle: reviewData.bookTitle || '',
      clubId: reviewData.clubId || '',
      clubName: reviewData.clubName || '',
      title: reviewData.title || '',
      content: reviewData.content,
      rating: reviewData.rating || 5,
      readingStyle: reviewData.readingStyle || 'independent',
      likes: 0,
      isLiked: false,
      commentCount: 0,
      createdAt: now(),
      updatedAt: now()
    }
    
    reviews.unshift(newReview)
    uni.setStorageSync(REVIEWS_KEY, JSON.stringify(reviews))
    
    return newReview
  } catch (e) {
    console.error('[ReadingClubService] 发布书评失败:', e)
    return null
  }
}

/**
 * 更新书评
 */
export function updateReview(reviewId, updates) {
  try {
    const stored = uni.getStorageSync(REVIEWS_KEY)
    if (!stored) return null
    
    const reviews = JSON.parse(stored)
    const index = reviews.findIndex(r => r.id === reviewId)
    
    if (index !== -1) {
      reviews[index] = {
        ...reviews[index],
        ...updates,
        updatedAt: now()
      }
      uni.setStorageSync(REVIEWS_KEY, JSON.stringify(reviews))
      return reviews[index]
    }
    
    return null
  } catch (e) {
    console.error('[ReadingClubService] 更新书评失败:', e)
    return null
  }
}

/**
 * 删除书评
 */
export function deleteReview(reviewId) {
  try {
    const stored = uni.getStorageSync(REVIEWS_KEY)
    if (!stored) return false
    
    const reviews = JSON.parse(stored)
    const filtered = reviews.filter(r => r.id !== reviewId)
    uni.setStorageSync(REVIEWS_KEY, JSON.stringify(filtered))
    
    // 同时删除相关评论
    const commentsStored = uni.getStorageSync(REVIEW_COMMENTS_KEY)
    if (commentsStored) {
      const comments = JSON.parse(commentsStored)
      const filteredComments = comments.filter(c => c.reviewId !== reviewId)
      uni.setStorageSync(REVIEW_COMMENTS_KEY, JSON.stringify(filteredComments))
    }
    
    return true
  } catch (e) {
    console.error('[ReadingClubService] 删除书评失败:', e)
    return false
  }
}

/**
 * 点赞书评
 */
export function likeReview(reviewId, babyId) {
  try {
    const stored = uni.getStorageSync(REVIEWS_KEY)
    if (!stored) return null
    
    const reviews = JSON.parse(stored)
    const index = reviews.findIndex(r => r.id === reviewId)
    
    if (index !== -1) {
      if (!reviews[index].likedBy) {
        reviews[index].likedBy = []
      }
      
      if (!reviews[index].likedBy.includes(babyId)) {
        reviews[index].likedBy.push(babyId)
        reviews[index].likes = (reviews[index].likes || 0) + 1
        reviews[index].isLiked = true
      }
      
      uni.setStorageSync(REVIEWS_KEY, JSON.stringify(reviews))
      
      return {
        likes: reviews[index].likes,
        isLiked: reviews[index].isLiked
      }
    }
    
    return null
  } catch (e) {
    console.error('[ReadingClubService] 点赞失败:', e)
    return null
  }
}

/**
 * 取消点赞
 */
export function unlikeReview(reviewId, babyId) {
  try {
    const stored = uni.getStorageSync(REVIEWS_KEY)
    if (!stored) return null
    
    const reviews = JSON.parse(stored)
    const index = reviews.findIndex(r => r.id === reviewId)
    
    if (index !== -1) {
      if (reviews[index].likedBy) {
        const likedIndex = reviews[index].likedBy.indexOf(babyId)
        if (likedIndex !== -1) {
          reviews[index].likedBy.splice(likedIndex, 1)
          reviews[index].likes = Math.max(0, (reviews[index].likes || 0) - 1)
          reviews[index].isLiked = false
        }
      }
      
      uni.setStorageSync(REVIEWS_KEY, JSON.stringify(reviews))
      
      return {
        likes: reviews[index].likes,
        isLiked: reviews[index].isLiked
      }
    }
    
    return null
  } catch (e) {
    console.error('[ReadingClubService] 取消点赞失败:', e)
    return null
  }
}

/**
 * 获取书评评论
 */
export function getReviewComments(reviewId) {
  try {
    const stored = uni.getStorageSync(REVIEW_COMMENTS_KEY)
    if (!stored) return []
    
    const comments = JSON.parse(stored)
    return comments
      .filter(c => c.reviewId === reviewId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch (e) {
    console.error('[ReadingClubService] 获取评论失败:', e)
    return []
  }
}

/**
 * 添加书评评论
 */
export function addReviewComment(reviewId, commentData) {
  try {
    const stored = uni.getStorageSync(REVIEW_COMMENTS_KEY)
    const comments = stored ? JSON.parse(stored) : []
    
    const newComment = {
      id: generateId('cmt'),
      reviewId,
      babyId: commentData.babyId,
      babyName: commentData.babyName,
      content: commentData.content,
      createdAt: now()
    }
    
    comments.unshift(newComment)
    uni.setStorageSync(REVIEW_COMMENTS_KEY, JSON.stringify(comments))
    
    // 更新书评评论数
    updateReviewCommentCount(reviewId, 1)
    
    return newComment
  } catch (e) {
    console.error('[ReadingClubService] 添加评论失败:', e)
    return null
  }
}

/**
 * 更新书评评论数
 */
function updateReviewCommentCount(reviewId, delta) {
  try {
    const stored = uni.getStorageSync(REVIEWS_KEY)
    if (!stored) return
    
    const reviews = JSON.parse(stored)
    const index = reviews.findIndex(r => r.id === reviewId)
    
    if (index !== -1) {
      reviews[index].commentCount = Math.max(0, (reviews[index].commentCount || 0) + delta)
      uni.setStorageSync(REVIEWS_KEY, JSON.stringify(reviews))
    }
  } catch (e) {
    console.error('[ReadingClubService] 更新评论数失败:', e)
  }
}

// ==================== 精彩摘录服务 ====================

/**
 * 获取摘录列表
 */
export function getExcerpts(filter = {}) {
  try {
    const stored = uni.getStorageSync(EXCERPTS_KEY)
    if (!stored) return []
    
    let excerpts = JSON.parse(stored)
    
    if (filter.babyId) {
      excerpts = excerpts.filter(e => e.babyId === filter.babyId)
    }
    if (filter.bookId) {
      excerpts = excerpts.filter(e => e.bookId === filter.bookId)
    }
    
    return excerpts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch (e) {
    console.error('[ReadingClubService] 获取摘录失败:', e)
    return []
  }
}

/**
 * 获取书籍的所有摘录
 */
export function getBookExcerpts(bookId) {
  return getExcerpts({ bookId })
}

/**
 * 添加摘录
 */
export function createExcerpt(excerptData) {
  try {
    const stored = uni.getStorageSync(EXCERPTS_KEY)
    const excerpts = stored ? JSON.parse(stored) : []
    
    const newExcerpt = {
      id: generateId('exc'),
      babyId: excerptData.babyId,
      babyName: excerptData.babyName,
      bookId: excerptData.bookId || '',
      bookTitle: excerptData.bookTitle || '',
      chapter: excerptData.chapter || '',
      page: excerptData.page || '',
      content: excerptData.content,
      mood: excerptData.mood || '', // 读书心情
      tags: excerptData.tags || [],
      likes: 0,
      createdAt: now()
    }
    
    excerpts.unshift(newExcerpt)
    uni.setStorageSync(EXCERPTS_KEY, JSON.stringify(excerpts))
    
    return newExcerpt
  } catch (e) {
    console.error('[ReadingClubService] 添加摘录失败:', e)
    return null
  }
}

/**
 * 更新摘录
 */
export function updateExcerpt(excerptId, updates) {
  try {
    const stored = uni.getStorageSync(EXCERPTS_KEY)
    if (!stored) return null
    
    const excerpts = JSON.parse(stored)
    const index = excerpts.findIndex(e => e.id === excerptId)
    
    if (index !== -1) {
      excerpts[index] = { ...excerpts[index], ...updates }
      uni.setStorageSync(EXCERPTS_KEY, JSON.stringify(excerpts))
      return excerpts[index]
    }
    
    return null
  } catch (e) {
    console.error('[ReadingClubService] 更新摘录失败:', e)
    return null
  }
}

/**
 * 删除摘录
 */
export function deleteExcerpt(excerptId) {
  try {
    const stored = uni.getStorageSync(EXCERPTS_KEY)
    if (!stored) return false
    
    const excerpts = JSON.parse(stored)
    const filtered = excerpts.filter(e => e.id !== excerptId)
    uni.setStorageSync(EXCERPTS_KEY, JSON.stringify(filtered))
    
    return true
  } catch (e) {
    console.error('[ReadingClubService] 删除摘录失败:', e)
    return false
  }
}

// ==================== 俱乐部藏书服务 ====================

/**
 * 获取俱乐部藏书
 */
export function getClubBooks(clubId) {
  try {
    const stored = uni.getStorageSync(`${CLUB_BOOKS_KEY}_${clubId}`)
    if (!stored) return []
    return JSON.parse(stored)
  } catch (e) {
    console.error('[ReadingClubService] 获取藏书失败:', e)
    return []
  }
}

/**
 * 添加图书到俱乐部
 */
export function addBookToClub(clubId, bookData) {
  try {
    const stored = uni.getStorageSync(`${CLUB_BOOKS_KEY}_${clubId}`)
    const books = stored ? JSON.parse(stored) : []
    
    const newBook = {
      id: generateId('cb'),
      clubId,
      title: bookData.title,
      author: bookData.author || '',
      cover: bookData.cover || '',
      description: bookData.description || '',
      addedBy: bookData.addedBy || '',
      addedAt: now()
    }
    
    books.unshift(newBook)
    uni.setStorageSync(`${CLUB_BOOKS_KEY}_${clubId}`, JSON.stringify(books))
    
    // 更新俱乐部藏书数
    updateClubBookCount(clubId, 1)
    
    return newBook
  } catch (e) {
    console.error('[ReadingClubService] 添加藏书失败:', e)
    return null
  }
}

/**
 * 从俱乐部移除图书
 */
export function removeBookFromClub(clubId, bookId) {
  try {
    const stored = uni.getStorageSync(`${CLUB_BOOKS_KEY}_${clubId}`)
    if (!stored) return false
    
    const books = JSON.parse(stored)
    const filtered = books.filter(b => b.id !== bookId)
    uni.setStorageSync(`${CLUB_BOOKS_KEY}_${clubId}`, JSON.stringify(filtered))
    
    updateClubBookCount(clubId, -1)
    
    return true
  } catch (e) {
    console.error('[ReadingClubService] 移除藏书失败:', e)
    return false
  }
}

/**
 * 更新俱乐部藏书数
 */
function updateClubBookCount(clubId, delta) {
  try {
    const clubs = getClubs()
    const index = clubs.findIndex(c => c.id === clubId)
    if (index !== -1) {
      clubs[index].bookCount = Math.max(0, (clubs[index].bookCount || 0) + delta)
    }
  } catch (e) {
    console.error('[ReadingClubService] 更新藏书数失败:', e)
  }
}

// ==================== 读书讨论服务 ====================

/**
 * 获取俱乐部讨论列表
 */
export function getDiscussions(clubId) {
  try {
    const stored = uni.getStorageSync(`${DISCUSSIONS_KEY}_${clubId}`)
    if (stored) {
      return JSON.parse(stored).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
    return BUILT_IN_DISCUSSIONS.filter(d => d.clubId === clubId)
  } catch (e) {
    console.error('[ReadingClubService] 获取讨论失败:', e)
    return BUILT_IN_DISCUSSIONS.filter(d => d.clubId === clubId)
  }
}

/**
 * 创建讨论话题
 */
export function createDiscussion(clubId, discussionData) {
  try {
    const stored = uni.getStorageSync(`${DISCUSSIONS_KEY}_${clubId}`)
    const discussions = stored ? JSON.parse(stored) : []
    
    const newDiscussion = {
      id: generateId('disc'),
      clubId,
      babyId: discussionData.babyId,
      babyName: discussionData.babyName,
      title: discussionData.title,
      content: discussionData.content,
      createdAt: now(),
      replyCount: 0,
      likes: 0
    }
    
    discussions.unshift(newDiscussion)
    uni.setStorageSync(`${DISCUSSIONS_KEY}_${clubId}`, JSON.stringify(discussions))
    
    return newDiscussion
  } catch (e) {
    console.error('[ReadingClubService] 创建讨论失败:', e)
    return null
  }
}

/**
 * 获取讨论回复
 */
export function getDiscussionReplies(discussionId) {
  try {
    const stored = uni.getStorageSync(`${DISCUSSION_REPLIES_KEY}_${discussionId}`)
    if (!stored) return []
    return JSON.parse(stored).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  } catch (e) {
    console.error('[ReadingClubService] 获取回复失败:', e)
    return []
  }
}

/**
 * 添加讨论回复
 */
export function addDiscussionReply(discussionId, replyData) {
  try {
    const stored = uni.getStorageSync(`${DISCUSSION_REPLIES_KEY}_${discussionId}`)
    const replies = stored ? JSON.parse(stored) : []
    
    const newReply = {
      id: generateId('rep'),
      discussionId,
      babyId: replyData.babyId,
      babyName: replyData.babyName,
      content: replyData.content,
      createdAt: now()
    }
    
    replies.push(newReply)
    uni.setStorageSync(`${DISCUSSION_REPLIES_KEY}_${discussionId}`, JSON.stringify(replies))
    
    // 更新讨论回复数
    updateDiscussionReplyCount(discussionId, 1)
    
    return newReply
  } catch (e) {
    console.error('[ReadingClubService] 添加回复失败:', e)
    return null
  }
}

/**
 * 更新讨论回复数
 */
function updateDiscussionReplyCount(discussionId, delta) {
  // 遍历所有俱乐部的讨论来更新
  const clubs = getClubs()
  for (const club of clubs) {
    const stored = uni.getStorageSync(`${DISCUSSIONS_KEY}_${club.id}`)
    if (stored) {
      const discussions = JSON.parse(stored)
      const index = discussions.findIndex(d => d.id === discussionId)
      if (index !== -1) {
        discussions[index].replyCount = Math.max(0, (discussions[index].replyCount || 0) + delta)
        uni.setStorageSync(`${DISCUSSIONS_KEY}_${club.id}`, JSON.stringify(discussions))
        break
      }
    }
  }
}

// ==================== 俱乐部排行榜 ====================

/**
 * 获取俱乐部排行榜
 */
export function getClubLeaderboard(clubId) {
  const members = getClubMembers(clubId)
  return [...members]
    .sort((a, b) => {
      // 按阅读天数排序
      if (b.readingDays !== a.readingDays) return b.readingDays - a.readingDays
      // 再按读书数量排序
      return b.booksRead - a.booksRead
    })
    .slice(0, 10)
}

/**
 * 获取俱乐部成员统计
 */
export function getClubMemberStats(clubId, babyId) {
  const members = getClubMembers(clubId)
  const member = members.find(m => m.babyId === babyId)
  
  if (!member) {
    return {
      readingDays: 0,
      booksRead: 0,
      rank: 0,
      totalMembers: members.length
    }
  }
  
  const sorted = [...members].sort((a, b) => b.readingDays - a.readingDays)
  const rank = sorted.findIndex(m => m.babyId === babyId) + 1
  
  return {
    readingDays: member.readingDays || 0,
    booksRead: member.booksRead || 0,
    rank,
    totalMembers: members.length
  }
}

// ==================== 导出 ====================

export default {
  // Constants
  CLUB_STATUS,
  CLUB_MEMBER_ROLE,
  READING_STYLE,
  
  // Club functions
  getClubs,
  getClubById,
  createClub,
  joinClub,
  leaveClub,
  getClubMembers,
  getClubActivities,
  
  // Review functions
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  likeReview,
  unlikeReview,
  getReviewComments,
  addReviewComment,
  
  // Excerpt functions
  getExcerpts,
  createExcerpt,
  updateExcerpt,
  deleteExcerpt,
  getBookExcerpts,
  
  // Club books
  getClubBooks,
  addBookToClub,
  removeBookFromClub,
  
  // Discussion functions
  getDiscussions,
  createDiscussion,
  getDiscussionReplies,
  addDiscussionReply,
  
  // Stats
  getClubLeaderboard,
  getClubMemberStats
}
