<template>
	<view class="page-container" :class="{'dark-mode': isDarkMode}">
		<view class="detail-header" :class="{'dark-mode': isDarkMode}">
			<view class="back-btn" @tap="navigateBack">
				<text class="back-icon">←</text>
			</view>
			<view class="header-title">帖子详情</view>
			<view class="more-btn" @tap="showActionSheet">
				<text class="more-icon">⋮</text>
			</view>
		</view>

		<scroll-view scroll-y class="detail-content" :class="{'dark-mode': isDarkMode}">
			<!-- 主题内容区 -->
			<view class="topic-detail" :class="{'dark-mode': isDarkMode}">
				<view class="topic-main">
					<view class="topic-title" :class="{'dark-mode': isDarkMode}">{{topicDetail.title}}</view>
					<view class="author-info">
						<image class="author-avatar" :src="topicDetail.authorAvatar" mode="aspectFill"></image>
						<view class="author-detail">
							<view class="author-name" :class="{'dark-mode': isDarkMode}">{{topicDetail.authorName}}</view>
							<view class="publish-time" :class="{'dark-mode': isDarkMode}">{{topicDetail.publishTime}}</view>
						</view>
					</view>
					<view class="category-tag" :class="[`tag-${getCategoryColor(topicDetail.category)}`, {'dark-mode': isDarkMode}]">
						{{getCategoryName(topicDetail.category)}}
					</view>
					<view class="topic-content" :class="{'dark-mode': isDarkMode}">
						<text>{{topicDetail.content}}</text>
					</view>
					
					<!-- 图片展示区域 -->
					<view class="topic-images" v-if="topicDetail.images && topicDetail.images.length > 0">
						<image 
							v-for="(img, index) in topicDetail.images" 
							:key="index" 
							:src="img" 
							class="topic-image" 
							mode="widthFix"
							@tap="previewImage(index)"
						></image>
					</view>
					
					<!-- 操作区 -->
					<view class="action-bar" :class="{'dark-mode': isDarkMode}">
						<view class="action-item" @tap="likeTopic">
							<text class="action-icon" :class="{'liked': isLiked}">♥</text>
							<text class="action-text" :class="{'dark-mode': isDarkMode}">点赞 {{topicDetail.likes}}</text>
						</view>
						<view class="action-item" @tap="focusCommentInput">
							<text class="action-icon">💬</text>
							<text class="action-text" :class="{'dark-mode': isDarkMode}">评论 {{topicDetail.comments}}</text>
						</view>
						<view class="action-item" @tap="shareTopic">
							<text class="action-icon">↗</text>
							<text class="action-text" :class="{'dark-mode': isDarkMode}">分享</text>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 评论区 -->
			<view class="comments-section" :class="{'dark-mode': isDarkMode}">
				<view class="section-title" :class="{'dark-mode': isDarkMode}">
					<text>全部评论 ({{commentsList.length}})</text>
				</view>
				
				<view class="comment-item" :class="{'dark-mode': isDarkMode}" v-for="(comment, index) in commentsList" :key="index">
					<image class="comment-avatar" :src="comment.avatar" mode="aspectFill"></image>
					<view class="comment-body">
						<view class="comment-user" :class="{'dark-mode': isDarkMode}">{{comment.username}}</view>
						<view class="comment-content" :class="{'dark-mode': isDarkMode}">{{comment.content}}</view>
						<view class="comment-footer">
							<text class="comment-time" :class="{'dark-mode': isDarkMode}">{{comment.time}}</text>
							<view class="comment-actions">
								<view class="reply-btn" @tap="replyComment(comment)">回复</view>
								<view class="like-btn" :class="{'liked': comment.isLiked}" @tap="likeComment(index)">
									<text class="like-icon">♥</text>
									<text class="like-count">{{comment.likes}}</text>
								</view>
							</view>
						</view>
						
						<!-- 嵌套回复 -->
						<view class="replies" v-if="comment.replies && comment.replies.length > 0">
							<view class="reply-item" :class="{'dark-mode': isDarkMode}" v-for="(reply, replyIndex) in comment.replies" :key="replyIndex">
								<view class="reply-content" :class="{'dark-mode': isDarkMode}">
									<text class="reply-username">{{reply.username}}</text>
									<text class="reply-text">{{reply.content}}</text>
								</view>
								<view class="reply-footer">
									<text class="reply-time" :class="{'dark-mode': isDarkMode}">{{reply.time}}</text>
								</view>
							</view>
						</view>
					</view>
				</view>
				
				<!-- 没有评论时的提示 -->
				<view class="empty-comments" :class="{'dark-mode': isDarkMode}" v-if="commentsList.length === 0">
					<text class="empty-text" :class="{'dark-mode': isDarkMode}">暂无评论，快来说说你的想法吧</text>
				</view>
			</view>
		</scroll-view>
		
		<!-- 评论输入框 -->
		<view class="comment-input-area" :class="{'dark-mode': isDarkMode}">
			<input 
				type="text" 
				v-model="commentText" 
				placeholder="写下你的评论..." 
				:focus="inputFocus"
				confirm-type="send"
				@confirm="submitComment"
				class="comment-input"
				:class="{'dark-mode': isDarkMode}"
			/>
			<button class="submit-btn" :disabled="!commentText.trim()" @tap="submitComment">发送</button>
		</view>
	</view>
</template>

<script>
import { isDarkTheme } from '@/utils/themeUtils.js';

export default {
	data() {
		return {
			isDarkMode: false,
			topicId: null,
			inputFocus: false,
			commentText: '',
			isLiked: false,
			replyToComment: null,
			topicDetail: {
				id: 1,
				title: '如何培养孩子的阅读习惯?',
				content: '最近发现孩子对阅读不太感兴趣，每次给他看书都会很快失去耐心。我尝试了给他读故事，也买了很多有趣的绘本，但效果都不太理想。\n\n有没有家长可以分享一下培养孩子阅读习惯的经验和方法？什么样的书更容易吸引孩子？什么时间段阅读效果更好？如何让阅读成为孩子生活中自然而然的一部分？',
				category: 'education',
				authorName: '书香妈妈',
				authorAvatar: '/static/avatar.png',
				publishTime: '2023-09-29 15:30',
				comments: 23,
				likes: 45,
				images: [
					'/static/images/book1.jpg',
					'/static/images/book2.jpg'
				]
			},
			commentsList: [
				{
					id: 1,
					username: '绘本达人',
					avatar: '/static/avatar.png',
					content: '建议从孩子的兴趣出发选择书籍，比如喜欢恐龙的可以先看恐龙图鉴，培养起兴趣后再慢慢延伸到其他类型的书。',
					time: '2023-09-29 16:15',
					likes: 12,
					isLiked: false,
					replies: [
						{
							username: '书香妈妈',
							content: '谢谢建议，我会尝试找一些他感兴趣的主题。',
							time: '2023-09-29 16:30'
						}
					]
				},
				{
					id: 2,
					username: '教育专家',
					avatar: '/static/avatar.png',
					content: '固定的阅读时间很重要，建议每天睡前读20分钟，慢慢形成习惯。另外，父母的榜样作用也很关键，让孩子看到你也在阅读。',
					time: '2023-09-29 17:45',
					likes: 18,
					isLiked: true,
					replies: []
				},
				{
					id: 3,
					username: '快乐童年',
					avatar: '/static/avatar.png',
					content: '我家会设置一个舒适的阅读角落，放些靠枕和玩偶，让阅读环境变得温馨有趣。',
					time: '2023-09-29 18:20',
					likes: 8,
					isLiked: false,
					replies: []
				}
			]
		}
	},
	onLoad(options) {
		// 获取当前主题模式
		this.isDarkMode = isDarkTheme();
		
		// 根据传入的id获取详情数据
		if (options.id) {
			this.topicId = options.id;
			this.loadTopicDetail(this.topicId);
		}
	},
	onShow() {
		// 每次显示页面时更新主题状态
		this.isDarkMode = isDarkTheme();
	},
	methods: {
		// 获取分类名称
		getCategoryName(categoryId) {
			const categoryMap = {
				'all': '全部',
				'parenting': '育儿经验',
				'education': '教育方法',
				'nutrition': '营养健康',
				'games': '亲子游戏',
				'psychology': '儿童心理',
				'books': '阅读推荐'
			};
			return categoryMap[categoryId] || categoryId;
		},
		
		// 获取分类颜色
		getCategoryColor(categoryId) {
			const colorMap = {
				'parenting': 'blue',
				'education': 'purple',
				'nutrition': 'green',
				'games': 'orange',
				'psychology': 'red',
				'books': 'cyan'
			};
			return colorMap[categoryId] || 'blue';
		},
		
		// 返回上一页
		navigateBack() {
			uni.navigateBack();
		},
		
		// 预览图片
		previewImage(index) {
			uni.previewImage({
				current: index,
				urls: this.topicDetail.images
			});
		},
		
		// 点赞主题
		likeTopic() {
			this.isLiked = !this.isLiked;
			if (this.isLiked) {
				this.topicDetail.likes++;
			} else {
				this.topicDetail.likes--;
			}
			
			// 这里应该调用接口更新点赞状态
			uni.showToast({
				title: this.isLiked ? '已点赞' : '已取消点赞',
				icon: 'none'
			});
		},
		
		// 聚焦评论输入框
		focusCommentInput() {
			this.inputFocus = true;
		},
		
		// 分享主题
		shareTopic() {
			uni.showActionSheet({
				itemList: ['复制链接', '分享到微信', '分享到朋友圈'],
				success: (res) => {
					uni.showToast({
						title: '分享功能开发中',
						icon: 'none'
					});
				}
			});
		},
		
		// 展示操作菜单
		showActionSheet() {
			uni.showActionSheet({
				itemList: ['收藏', '举报'],
				success: (res) => {
					if (res.tapIndex === 0) {
						uni.showToast({
							title: '已收藏',
							icon: 'success'
						});
					} else if (res.tapIndex === 1) {
						uni.showToast({
							title: '举报功能开发中',
							icon: 'none'
						});
					}
				}
			});
		},
		
		// 回复评论
		replyComment(comment) {
			this.replyToComment = comment;
			this.commentText = `回复 @${comment.username}: `;
			this.inputFocus = true;
		},
		
		// 点赞评论
		likeComment(index) {
			const comment = this.commentsList[index];
			comment.isLiked = !comment.isLiked;
			
			if (comment.isLiked) {
				comment.likes++;
			} else {
				comment.likes--;
			}
			
			// 这里应该调用接口更新评论点赞状态
		},
		
		// 提交评论
		submitComment() {
			if (!this.commentText.trim()) return;
			
			// 创建新评论对象
			const newComment = {
				id: this.commentsList.length + 1,
				username: '当前用户',
				avatar: '/static/avatar.png',
				content: this.commentText,
				time: this.formatDate(new Date()),
				likes: 0,
				isLiked: false,
				replies: []
			};
			
			// 添加到评论列表
			this.commentsList.unshift(newComment);
			
			// 更新评论数
			this.topicDetail.comments++;
			
			// 清空输入框
			this.commentText = '';
			this.replyToComment = null;
			
			// 这里应该调用接口提交评论
			uni.showToast({
				title: '评论成功',
				icon: 'success'
			});
		},
		
		// 格式化日期
		formatDate(date) {
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			const hours = String(date.getHours()).padStart(2, '0');
			const minutes = String(date.getMinutes()).padStart(2, '0');
			
			return `${year}-${month}-${day} ${hours}:${minutes}`;
		},
		
		// 加载文章详情
		loadTopicDetail(id) {
			// 从本地存储获取全部主题
			const allTopics = uni.getStorageSync('communityTopics') || [];
			// 查找当前id的主题
			const storedTopic = allTopics.find(item => item.id == id);
			
			if (storedTopic) {
				// 将存储的主题数据转换为详情页需要的格式
				this.topicDetail = {
					...storedTopic,
					authorName: storedTopic.authorName || '社区用户',
					authorAvatar: storedTopic.authorAvatar || '/static/avatar.png',
					publishTime: this.formatTime(storedTopic.createTime) || '刚刚'
				};
			} else {
				// 如果本地没有找到，查找默认主题
				const defaultTopic = this.findDefaultTopic(id);
				if (defaultTopic) {
					this.topicDetail = defaultTopic;
				}
			}
		},
		
		// 查找默认主题
		findDefaultTopic(id) {
			// 默认主题列表（与社区页面保持一致）
			const defaultTopics = [
				{
					id: 1,
					title: '如何培养孩子的阅读习惯?',
					content: '最近发现孩子对阅读不太感兴趣，每次给他看书都会很快失去耐心。我尝试了给他读故事，也买了很多有趣的绘本，但效果都不太理想。\n\n有没有家长可以分享一下培养孩子阅读习惯的经验和方法？什么样的书更容易吸引孩子？什么时间段阅读效果更好？如何让阅读成为孩子生活中自然而然的一部分？',
					category: 'education',
					authorName: '书香妈妈',
					authorAvatar: '/static/avatar.png',
					publishTime: '2023-09-29 15:30',
					comments: 23,
					likes: 45,
					images: [
						'/static/images/book1.jpg',
						'/static/images/book2.jpg'
					]
				}
				// 这里可以添加更多默认主题
			];
			
			return defaultTopics.find(topic => topic.id == id);
		},
		
		// 格式化时间
		formatTime(timeString) {
			if (!timeString) return '刚刚';
			
			try {
				const date = new Date(timeString);
				const year = date.getFullYear();
				const month = (date.getMonth() + 1).toString().padStart(2, '0');
				const day = date.getDate().toString().padStart(2, '0');
				const hours = date.getHours().toString().padStart(2, '0');
				const minutes = date.getMinutes().toString().padStart(2, '0');
				
				return `${year}-${month}-${day} ${hours}:${minutes}`;
			} catch (e) {
				return '刚刚';
			}
		}
	}
}
</script>

<style scoped>
.page-container {
	min-height: 100vh;
	background-color: #f8f8f8;
	display: flex;
	flex-direction: column;
}

.page-container.dark-mode {
	background-color: #121212;
}

.detail-header {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	height: 90rpx;
	background-color: #8477fa;
	color: white;
	display: flex;
	align-items: center;
	padding: 0 30rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	z-index: 100;
}

.detail-header.dark-mode {
	background-color: #5e52c9;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.3);
}

.back-btn, .more-btn {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 40rpx;
}

.header-title {
	flex: 1;
	text-align: center;
	font-size: 32rpx;
	font-weight: bold;
}

.detail-content {
	flex: 1;
	margin-top: 90rpx;
	margin-bottom: 100rpx;
}

.topic-detail {
	background-color: white;
	border-radius: 20rpx;
	margin: 20rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.topic-detail.dark-mode {
	background-color: #1f1f1f;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
}

.topic-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 20rpx;
	line-height: 1.4;
}

.topic-title.dark-mode {
	color: #e0e0e0;
}

.author-info {
	display: flex;
	align-items: center;
	margin-bottom: 20rpx;
}

.author-avatar {
	width: 80rpx;
	height: 80rpx;
	border-radius: 40rpx;
	margin-right: 16rpx;
}

.author-name {
	font-size: 28rpx;
	font-weight: 500;
	color: #333;
}

.author-name.dark-mode {
	color: #e0e0e0;
}

.publish-time {
	font-size: 24rpx;
	color: #999;
	margin-top: 4rpx;
}

.publish-time.dark-mode {
	color: #777;
}

.category-tag {
	display: inline-block;
	padding: 6rpx 16rpx;
	border-radius: 6rpx;
	font-size: 24rpx;
	margin-bottom: 20rpx;
	background-color: rgba(132, 119, 250, 0.1);
	color: #8477fa;
}

.tag-blue {
	background-color: rgba(64, 158, 255, 0.1);
	color: #409eff;
}

.tag-blue.dark-mode {
	background-color: rgba(64, 158, 255, 0.2);
	color: #7cb8ff;
}

.tag-purple {
	background-color: rgba(132, 119, 250, 0.1);
	color: #8477fa;
}

.tag-purple.dark-mode {
	background-color: rgba(132, 119, 250, 0.2);
	color: #9f8eff;
}

.tag-green {
	background-color: rgba(103, 194, 58, 0.1);
	color: #67c23a;
}

.tag-green.dark-mode {
	background-color: rgba(103, 194, 58, 0.2);
	color: #85d15b;
}

.tag-orange {
	background-color: rgba(230, 162, 60, 0.1);
	color: #e6a23c;
}

.tag-orange.dark-mode {
	background-color: rgba(230, 162, 60, 0.2);
	color: #ecb55f;
}

.tag-red {
	background-color: rgba(245, 108, 108, 0.1);
	color: #f56c6c;
}

.tag-red.dark-mode {
	background-color: rgba(245, 108, 108, 0.2);
	color: #f78989;
}

.tag-cyan {
	background-color: rgba(36, 187, 187, 0.1);
	color: #24bbbb;
}

.tag-cyan.dark-mode {
	background-color: rgba(36, 187, 187, 0.2);
	color: #41d0d0;
}

.topic-content {
	font-size: 30rpx;
	color: #333;
	line-height: 1.6;
	margin-bottom: 30rpx;
	white-space: pre-wrap;
}

.topic-content.dark-mode {
	color: #e0e0e0;
}

.topic-images {
	display: flex;
	flex-wrap: wrap;
	gap: 15rpx;
	margin-bottom: 30rpx;
}

.topic-image {
	width: 100%;
	max-width: 690rpx;
	border-radius: 12rpx;
}

.action-bar {
	display: flex;
	border-top: 1rpx solid #f0f0f0;
	padding-top: 20rpx;
}

.action-bar.dark-mode {
	border-top: 1rpx solid #333;
}

.action-item {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10rpx;
}

.action-icon {
	font-size: 34rpx;
	color: #999;
}

.action-icon.liked {
	color: #ff6b6b;
}

.action-text {
	font-size: 26rpx;
	color: #666;
}

.action-text.dark-mode {
	color: #aaa;
}

.comments-section {
	background-color: white;
	margin: 20rpx;
	padding: 30rpx;
	border-radius: 20rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.comments-section.dark-mode {
	background-color: #1f1f1f;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
	padding-bottom: 15rpx;
}

.section-title.dark-mode {
	color: #e0e0e0;
	border-bottom: 1rpx solid #333;
}

.comment-item {
	display: flex;
	margin-bottom: 30rpx;
	padding-bottom: 20rpx;
	border-bottom: 1rpx solid #f5f5f5;
}

.comment-item.dark-mode {
	border-bottom: 1rpx solid #2a2a2a;
}

.comment-avatar {
	width: 70rpx;
	height: 70rpx;
	border-radius: 35rpx;
	margin-right: 16rpx;
}

.comment-body {
	flex: 1;
}

.comment-user {
	font-size: 28rpx;
	font-weight: 500;
	color: #333;
	margin-bottom: 8rpx;
}

.comment-user.dark-mode {
	color: #e0e0e0;
}

.comment-content {
	font-size: 28rpx;
	color: #333;
	line-height: 1.5;
	margin-bottom: 12rpx;
}

.comment-content.dark-mode {
	color: #e0e0e0;
}

.comment-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 15rpx;
}

.comment-time {
	font-size: 24rpx;
	color: #999;
}

.comment-time.dark-mode {
	color: #777;
}

.comment-actions {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.reply-btn, .like-btn {
	font-size: 24rpx;
	color: #666;
	display: flex;
	align-items: center;
	gap: 6rpx;
}

.like-btn.liked {
	color: #ff6b6b;
}

.like-icon {
	font-size: 24rpx;
}

.replies {
	background-color: #f9f9f9;
	border-radius: 10rpx;
	padding: 15rpx;
	margin-top: 10rpx;
}

.dark-mode .replies {
	background-color: #2a2a2a;
}

.reply-item {
	margin-bottom: 10rpx;
	padding-bottom: 10rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.reply-item:last-child {
	margin-bottom: 0;
	padding-bottom: 0;
	border-bottom: none;
}

.reply-item.dark-mode {
	border-bottom: 1rpx solid #333;
}

.reply-content {
	font-size: 26rpx;
	color: #333;
	line-height: 1.5;
}

.reply-content.dark-mode {
	color: #e0e0e0;
}

.reply-username {
	font-weight: 500;
	color: #8477fa;
	margin-right: 10rpx;
}

.reply-footer {
	margin-top: 6rpx;
}

.reply-time {
	font-size: 22rpx;
	color: #999;
}

.reply-time.dark-mode {
	color: #777;
}

.empty-comments {
	display: flex;
	justify-content: center;
	padding: 40rpx 0;
}

.empty-text {
	font-size: 28rpx;
	color: #999;
}

.empty-text.dark-mode {
	color: #777;
}

.comment-input-area {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	display: flex;
	align-items: center;
	padding: 20rpx 30rpx;
	background-color: white;
	border-top: 1rpx solid #f0f0f0;
	box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);
	z-index: 100;
}

.comment-input-area.dark-mode {
	background-color: #1a1a1a;
	border-top: 1rpx solid #333;
	box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.2);
}

.comment-input {
	flex: 1;
	height: 70rpx;
	background-color: #f5f5f5;
	border-radius: 35rpx;
	padding: 0 25rpx;
	font-size: 28rpx;
	color: #333;
}

.comment-input.dark-mode {
	background-color: #2a2a2a;
	color: #e0e0e0;
}

.submit-btn {
	width: 120rpx;
	height: 70rpx;
	line-height: 70rpx;
	margin-left: 20rpx;
	background: linear-gradient(135deg, #9f8eff, #8477fa);
	color: white;
	font-size: 28rpx;
	border-radius: 35rpx;
	text-align: center;
	padding: 0;
}

.submit-btn:disabled {
	background-color: #cccccc;
	color: #999;
}
</style> 