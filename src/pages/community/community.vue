<template>
	<view class="page-container" :class="{'dark-mode': isDarkMode}">
		<view class="community-header">
			<view class="header-content">
				<view class="title-section">
					<text class="title">育儿社区</text>
					<text class="subtitle">分享育儿经验，交流成长心得</text>
				</view>
			</view>
		</view>
		
		<view class="search-box" :class="{'dark-mode': isDarkMode}">
			<text class="search-icon">🔍</text>
			<input 
				type="text" 
				v-model="searchKeyword" 
				placeholder="搜索话题" 
				class="search-input"
				confirm-type="search"
				@confirm="searchTopics"
			/>
			<text class="search-clear" v-if="searchKeyword" @tap="clearSearch">✕</text>
		</view>
		
		<!-- 分类选择区 -->
		<view class="category-tabs" :class="{'dark-mode': isDarkMode}">
			<scroll-view scroll-x class="category-scroll">
				<view 
					class="category-item" 
					:class="[activeCategory === category.id ? 'active' : '', {'dark-mode': isDarkMode}]" 
					v-for="category in categories" 
					:key="category.id"
					@tap="selectCategory(category.id)"
				>
					<text>{{category.name}}</text>
				</view>
			</scroll-view>
		</view>
		
		<!-- 主题列表区域 -->
		<scroll-view scroll-y class="topics-list" @scrolltolower="loadMoreTopics">
			<view class="topics-grid">
				<view class="topic-card" :class="{'dark-mode': isDarkMode}" v-for="(item, index) in filteredTopics" :key="index" @tap="viewTopicDetail(item)">
					<view class="topic-header">
						<view class="topic-icon" :class="{'dark-mode': isDarkMode}">{{item.icon}}</view>
						<view class="topic-title" :class="{'dark-mode': isDarkMode}">{{item.title}}</view>
					</view>
					<view class="topic-content">
						<view class="topic-brief" :class="{'dark-mode': isDarkMode}">{{item.brief}}</view>
						<view class="topic-info">
							<text class="comment-count">评论 {{item.comments}}</text>
							<text class="dot-separator">·</text>
							<text class="like-count">点赞 {{item.likes}}</text>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 加载更多或无数据提示 -->
			<view class="loading-more" v-if="hasMoreTopics && filteredTopics.length > 0">
				<text class="loading-text" :class="{'dark-mode': isDarkMode}">加载更多...</text>
			</view>
			<view class="empty-state" :class="{'dark-mode': isDarkMode}" v-if="filteredTopics.length === 0">
				<text class="empty-text" :class="{'dark-mode': isDarkMode}">暂无相关内容</text>
			</view>
		</scroll-view>

		<!-- 悬浮添加按钮 -->
		<view class="float-btn" @tap="showAddTopicModal">
      		<text>＋</text>
    	</view>
	</view>
</template>

<script>
import { isDarkTheme } from '@/utils/themeUtils.js';

export default {
	data() {
		return {
			isDarkMode: false,
			searchKeyword: '',
			activeCategory: 'all',
			categories: [
				{ id: 'all', name: '全部' },
				{ id: 'parenting', name: '育儿经验' },
				{ id: 'education', name: '教育方法' },
				{ id: 'nutrition', name: '营养健康' },
				{ id: 'games', name: '亲子游戏' },
				{ id: 'psychology', name: '儿童心理' },
				{ id: 'books', name: '阅读推荐' }
			],
			topics: [
				{
					id: 1,
					title: '如何培养孩子的阅读习惯?',
					brief: '分享一下大家的经验，我家孩子对图书不太感兴趣...',
					category: 'education',
					comments: 23,
					likes: 45,
					icon: '📚'
				},
				{
					id: 2,
					title: '推荐几个培养财商的小游戏',
					brief: '最近发现几个很不错的...',
					category: 'games',
					comments: 15,
					likes: 38,
					icon: '🎮'
				},
				{
					id: 3,
					title: '孩子不爱吃蔬菜怎么办',
					brief: '有什么好方法让孩子爱上蔬菜水果？分享一下经验...',
					category: 'nutrition',
					comments: 42,
					likes: 67,
					icon: '🥦'
				},
				{
					id: 4,
					title: '如何应对孩子的分离焦虑',
					brief: '上幼儿园第一周，孩子每天都哭，该怎么做比较好...',
					category: 'psychology',
					comments: 33,
					likes: 56,
					icon: '🧠'
				},
				{
					id: 5,
					title: '分享几本特别好的绘本',
					brief: '这几本绘本故事性强，画风精美，特别适合3-6岁...',
					category: 'books',
					comments: 27,
					likes: 72,
					icon: '📖'
				},
				{
					id: 6,
					title: '宝宝睡前故事有哪些推荐',
					brief: '求推荐一些适合睡前讲的小故事，最好能有助眠效果...',
					category: 'parenting',
					comments: 19,
					likes: 34,
					icon: '🌙'
				}
			],
			currentPage: 1,
			hasMoreTopics: true
		}
	},
	computed: {
		// 过滤主题列表
		filteredTopics() {
			let result = this.topics;
			
			// 按分类筛选
			if (this.activeCategory !== 'all') {
				result = result.filter(topic => topic.category === this.activeCategory);
			}
			
			// 按关键词搜索
			if (this.searchKeyword) {
				const keyword = this.searchKeyword.toLowerCase();
				result = result.filter(topic => 
					topic.title.toLowerCase().includes(keyword) || 
					topic.brief.toLowerCase().includes(keyword)
				);
			}
			
			return result;
		}
	},
	onLoad() {
		// 获取当前主题模式
		this.isDarkMode = isDarkTheme();
		
		// 从本地存储加载主题数据
		this.loadTopicsFromStorage();
	},
	onShow() {
		// 每次显示页面时更新主题状态
		this.isDarkMode = isDarkTheme();
		
		// 刷新主题数据
		this.loadTopicsFromStorage();
	},


	methods: {
		// 从本地存储加载主题数据
		loadTopicsFromStorage() {
			const storedTopics = uni.getStorageSync('communityTopics');
			if (storedTopics && storedTopics.length > 0) {
				// 将本地存储的主题与默认主题合并
				const defaultTopics = this.topics;
				// 确保不重复添加已有主题
				const existingIds = defaultTopics.map(topic => topic.id);
				const newTopics = storedTopics.filter(topic => !existingIds.includes(topic.id));
				this.topics = [...newTopics, ...defaultTopics];
			}
		},
		
		// 清除搜索内容
		clearSearch() {
			this.searchKeyword = '';
		},
		
		// 搜索主题
		searchTopics() {
			// 实际项目中应该调用API获取搜索结果
			uni.showToast({
				title: '搜索: ' + this.searchKeyword,
				icon: 'none',
				duration: 1000
			});
		},
		
		// 选择分类
		selectCategory(categoryId) {
			this.activeCategory = categoryId;
			this.currentPage = 1;
			this.hasMoreTopics = true;
			
			// 实际项目中应该重新加载数据
			uni.showToast({
				title: '切换分类: ' + categoryId,
				icon: 'none',
				duration: 1000
			});
		},
		
		// 加载更多主题
		loadMoreTopics() {
			// 模拟加载更多数据
			if (this.hasMoreTopics) {
				// 实际项目中应该调用API获取更多数据
				setTimeout(() => {
					// 模拟没有更多数据了
					this.hasMoreTopics = false;
					uni.showToast({
						title: '已加载全部内容',
						icon: 'none'
					});
				}, 1000);
			}
		},
		
		// 查看主题详情
		viewTopicDetail(topic) {
			// 跳转到详情页，并传递主题ID
			uni.navigateTo({
				url: '/pages/community/detail?id=' + topic.id
			});
		},
		
		// 显示添加主题模态框
		showAddTopicModal() {
			uni.navigateTo({
				url: '/pages/community/publish',
				fail: (err) => {
					console.error('跳转失败:', err);
					uni.showToast({
						title: '跳转失败，请重试',
						icon: 'none'
					});
				}
			});
		}
	}
}
</script>

<style scoped>
.page-container {
	min-height: 100vh;
	padding-bottom: 50px; /* 调整底部内边距，为原生tabBar留出空间 */
	background-color: #f8f8f8;
}

.page-container.dark-mode {
	background-color: #121212;
}

.community-header {
	padding: 40rpx 30rpx 30rpx;
	/* background-color: #8477fa; */
	background: linear-gradient(135deg, #8B5CF6, #7C3AED);
	color: white;
	position: relative;
	box-shadow: 0 6rpx 16rpx rgba(132, 119, 250, 0.2);
}

.dark-mode .community-header {
	/* background-color: #5e52c9; */
	background: linear-gradient(135deg, #8B5CF6, #7C3AED);
	box-shadow: 0 6rpx 16rpx rgba(94, 82, 201, 0.3);
}

.header-content {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.title-section {
	display: flex;
	flex-direction: column;
}

.title {
	font-size: 48rpx;
	font-weight: bold;
	margin-bottom: 10rpx;
	text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.subtitle {
	font-size: 28rpx;
	opacity: 0.9;
}

.search-box {
	margin: 30rpx;
	height: 80rpx;
	background-color: white;
	border-radius: 40rpx;
	display: flex;
	align-items: center;
	padding: 0 30rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.dark-mode .search-box {
	background-color: #1f1f1f;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
}

.search-icon {
	margin-right: 20rpx;
	font-size: 32rpx;
	color: #999;
}

.dark-mode .search-icon {
	color: #777;
}

.search-input {
	flex: 1;
	height: 80rpx;
	font-size: 28rpx;
	color: #333;
}

.dark-mode .search-input {
	color: #e0e0e0;
}

.search-clear {
	width: 40rpx;
	height: 40rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	color: #999;
}

.dark-mode .search-clear {
	color: #777;
}

/* 分类标签 */
.category-tabs {
	padding: 0 20rpx;
	background-color: white;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
	margin-bottom: 20rpx;
}

.dark-mode .category-tabs {
	background-color: #1a1a1a;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.category-scroll {
	width: 100%;
	white-space: nowrap;
}

.category-item {
	display: inline-block;
	padding: 20rpx 30rpx;
	font-size: 28rpx;
	color: #666;
	position: relative;
}

.dark-mode .category-item {
	color: #999;
}

.category-item.active {
	color: #8477fa;
	font-weight: 500;
}

.dark-mode .category-item.active {
	color: #9f8eff;
}

.category-item.active::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 50%;
	transform: translateX(-50%);
	width: 40rpx;
	height: 6rpx;
	background-color: #8477fa;
	border-radius: 3rpx;
}

.dark-mode .category-item.active::after {
	background-color: #9f8eff;
}

/* 主题列表 */
.topics-list {
	padding: 0 20rpx;
	margin-bottom: 160rpx;
	height: calc(100vh - 380rpx);
}

.topics-grid {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	padding: 10rpx;
}

.topic-card {
	background-color: white;
	border-radius: 24rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.06);
	position: relative;
	transition: transform 0.2s, box-shadow 0.2s;
	overflow: hidden;
	width: 48%; /* 一行两列，留出间隔 */
	padding: 20rpx;
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	height: 340rpx; /* 固定高度，确保一致 */
}

.topic-card.dark-mode {
	background-color: #1f1f1f;
	box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.2);
}

.topic-card:active {
	transform: scale(0.98);
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.dark-mode .topic-card:active {
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
}

.topic-header {
	display: flex;
	align-items: flex-start;
	margin-bottom: 12rpx;
}

.topic-icon {
	font-size: 36rpx;
	margin-right: 12rpx;
	flex-shrink: 0;
	width: 50rpx;
	height: 50rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: rgba(132, 119, 250, 0.1);
	border-radius: 12rpx;
	color: #8477fa;
}

.dark-mode .topic-icon {
	background-color: rgba(159, 142, 255, 0.15);
	color: #9f8eff;
}

.topic-title {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	line-height: 1.4;
	/* 文本溢出处理 */
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	flex: 1;
	margin-bottom: 10rpx;
	height: 78rpx; /* 2行文字的固定高度 */
}

.topic-title.dark-mode {
	color: #e0e0e0;
}

.topic-content {
	display: flex;
	flex-direction: column;
	flex: 1;
}

.topic-brief {
	font-size: 24rpx;
	color: #666;
	margin-bottom: 12rpx;
	line-height: 1.4;
	/* 文本溢出处理 */
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical;
	height: 100rpx; /* 3行文字的固定高度 */
	flex: 1;
}

.topic-brief.dark-mode {
	color: #aaa;
}

.topic-info {
	display: flex;
	align-items: center;
	font-size: 22rpx;
	color: #999;
	margin-top: auto;
	padding-top: 10rpx;
	border-top: 1rpx solid #f0f0f0;
}

.dark-mode .topic-info {
	border-top-color: #333;
}

.comment-count, .like-count {
	color: #999;
}

.dark-mode .comment-count, .dark-mode .like-count {
	color: #777;
}

.dot-separator {
	margin: 0 10rpx;
	color: #ccc;
}

/* 加载更多和空状态 */
.loading-more, .empty-state {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 30rpx 0;
	color: #999;
	font-size: 28rpx;
}

.dark-mode .loading-text, .dark-mode .empty-text {
	color: #777;
}

/* 浮动按钮 */
/* .float-btn {
	position: fixed;
	right: 40rpx;
	bottom: 180rpx;
	width: 100rpx;
	height: 100rpx;
	background: linear-gradient(135deg, #8477fa, #6b5bff);
	color: white;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 60rpx;
	box-shadow: 0 4rpx 16rpx rgba(132, 119, 250, 0.3);
	z-index: 100;
	transition: transform 0.2s ease;
} */

/* 浮动按钮 */
.float-btn {
	position: fixed;
	right: 40rpx;
	bottom: 180rpx;
	/* 增加底部距离 */
	width: 100rpx;
	height: 100rpx;
	background: linear-gradient(135deg, #8B5CF6, #7C3AED);
	color: white;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 60rpx;
	box-shadow: 0 4rpx 16rpx rgba(132, 119, 250, 0.3);
	/* 提高z-index确保在最上层 */
	z-index: 100;
	transition: transform 0.2s ease;
}

/* 添加按钮悬停和点击效果 */
.float-btn:active {
	transform: scale(0.95);
}
</style> 