<template>
	<view class="page-container" :class="{'dark-mode': isDarkMode}">
		<!-- 顶部导航栏 -->
		<view class="nav-bar" :class="{'dark-mode': isDarkMode}">
			<view class="nav-left" @tap="goBack">
				<text class="icon">←</text>
			</view>
			<view class="nav-title">帮助与反馈</view>
		</view>
		
		<!-- 内容区域 -->
		<view class="content-area" :class="{'dark-mode': isDarkMode}">
			<!-- 选项卡 -->
			<view class="tab-container" :class="{'dark-mode': isDarkMode}">
				<view 
					class="tab-item" 
					:class="{'active': activeTab === 'faq', 'dark-mode': isDarkMode}"
					@tap="activeTab = 'faq'"
				>
					常见问题
				</view>
				<view 
					class="tab-item" 
					:class="{'active': activeTab === 'feedback', 'dark-mode': isDarkMode}"
					@tap="activeTab = 'feedback'"
				>
					意见反馈
				</view>
			</view>
			
			<!-- 常见问题 -->
			<view v-if="activeTab === 'faq'" class="faq-container">
				<view v-for="(item, index) in faqList" :key="index" class="faq-item" :class="{'dark-mode': isDarkMode}">
					<view class="faq-question" @tap="toggleFaq(index)" :class="{'dark-mode': isDarkMode}">
						<text class="question-text">{{ item.question }}</text>
						<text class="arrow" :class="{'expanded': item.expanded}">{{ item.expanded ? '↑' : '↓' }}</text>
					</view>
					<view v-if="item.expanded" class="faq-answer" :class="{'dark-mode': isDarkMode}">
						<text>{{ item.answer }}</text>
					</view>
				</view>
				
				<view class="no-answer">
					<text>没有找到您的问题？</text>
					<view class="contact-options">
						<view class="contact-btn" @tap="activeTab = 'feedback'">
							<text>提交反馈</text>
						</view>
						<view class="contact-btn" @tap="contactCustomerService">
							<text>联系客服</text>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 意见反馈 -->
			<view v-if="activeTab === 'feedback'" class="feedback-container" :class="{'dark-mode': isDarkMode}">
				<view class="form-item">
					<view class="form-label">反馈类型</view>
					<view class="form-radio-group">
						<view 
							class="radio-item" 
							:class="{'selected': feedbackType === 'bug', 'dark-mode': isDarkMode}" 
							@tap="feedbackType = 'bug'"
						>
							<view class="radio-circle" :class="{'selected': feedbackType === 'bug', 'dark-mode': isDarkMode}">
								<view v-if="feedbackType === 'bug'" class="radio-inner"></view>
							</view>
							<text>功能异常</text>
						</view>
						<view 
							class="radio-item" 
							:class="{'selected': feedbackType === 'suggestion', 'dark-mode': isDarkMode}" 
							@tap="feedbackType = 'suggestion'"
						>
							<view class="radio-circle" :class="{'selected': feedbackType === 'suggestion', 'dark-mode': isDarkMode}">
								<view v-if="feedbackType === 'suggestion'" class="radio-inner"></view>
							</view>
							<text>功能建议</text>
						</view>
						<view 
							class="radio-item" 
							:class="{'selected': feedbackType === 'other', 'dark-mode': isDarkMode}" 
							@tap="feedbackType = 'other'"
						>
							<view class="radio-circle" :class="{'selected': feedbackType === 'other', 'dark-mode': isDarkMode}">
								<view v-if="feedbackType === 'other'" class="radio-inner"></view>
							</view>
							<text>其他问题</text>
						</view>
					</view>
				</view>
				
				<view class="form-item">
					<view class="form-label">反馈内容</view>
					<textarea 
						class="feedback-textarea" 
						:class="{'dark-mode': isDarkMode}" 
						v-model="feedbackContent"
						placeholder="请详细描述您遇到的问题或建议..." 
						:placeholder-style="isDarkMode ? 'color: #666;' : 'color: #999;'"
					></textarea>
				</view>
				
				<view class="form-item">
					<view class="form-label">上传截图（选填）</view>
					<view class="upload-area" :class="{'dark-mode': isDarkMode}">
						<view class="upload-btn" @tap="chooseImage">
							<text class="upload-icon">+</text>
							<text class="upload-text">点击上传</text>
						</view>
						<scroll-view scroll-x="true" class="image-preview-scroll">
							<view class="image-preview-container">
								<view v-for="(img, idx) in uploadedImages" :key="idx" class="image-preview">
									<image :src="img" mode="aspectFill"></image>
									<view class="delete-btn" @tap="deleteImage(idx)">×</view>
								</view>
							</view>
						</scroll-view>
					</view>
				</view>
				
				<view class="form-item">
					<view class="form-label">联系方式（选填）</view>
					<input 
						class="contact-input" 
						:class="{'dark-mode': isDarkMode}" 
						v-model="contactInfo"
						placeholder="请留下您的邮箱或手机号，方便我们联系您" 
						:placeholder-style="isDarkMode ? 'color: #666;' : 'color: #999;'"
					/>
				</view>
				
				<view class="submit-btn" @tap="submitFeedback">提交反馈</view>
				
				<view class="feedback-tips">
					<text>感谢您的反馈，我们会认真对待每一条意见，并尽快处理您反馈的问题。</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			isDarkMode: false,
			activeTab: 'faq',
			feedbackType: 'bug',
			feedbackContent: '',
			contactInfo: '',
			uploadedImages: [],
			faqList: [
				{
					question: '如何添加任务？',
					answer: '在首页点击右上角的"+"按钮，填写任务信息（标题、描述、奖励积分等），然后点击保存即可创建新任务。',
					expanded: false
				},
				{
					question: '如何添加宝宝？',
					answer: '进入"我的-宝宝管理"页面，点击"添加宝宝"按钮，填写宝宝的基本信息并上传照片即可。每个账号最多可添加3个宝宝。',
					expanded: false
				},
				{
					question: '积分如何获取和使用？',
					answer: '完成任务后，家长确认即可获得相应积分。积分可在"积分商城"中兑换各类奖品和特权。',
					expanded: false
				},
				{
					question: '如何切换当前宝宝？',
					answer: '在首页或个人中心页面，点击宝宝头像区域，在弹出的宝宝列表中选择想要切换的宝宝即可。',
					expanded: false
				},
				{
					question: '任务完成后为什么没有获得积分？',
					answer: '任务完成后需要家长确认才能获得积分。请家长在"任务记录"中查看待确认的任务，并进行确认操作。',
					expanded: false
				},
				{
					question: '如何修改账号信息？',
					answer: '进入"我的-设置-个人资料设置"页面，可以修改昵称、头像等个人信息。',
					expanded: false
				},
				{
					question: '忘记密码怎么办？',
					answer: '在登录页面点击"忘记密码"，通过绑定的手机号或邮箱进行身份验证后，即可重置密码。',
					expanded: false
				},
				{
					question: '如何设置循环任务？',
					answer: '创建任务时，可以选择任务重复类型（如每天、每周等），系统会自动按照设定的周期创建新任务。',
					expanded: false
				}
			]
		}
	},
	onLoad() {
		// 从本地存储获取暗色模式设置
		try {
			const darkModeSetting = uni.getStorageSync('darkMode');
			if (darkModeSetting !== '') {
				this.isDarkMode = darkModeSetting === 'true';
			}
		} catch (e) {
			console.error('获取暗色模式设置失败', e);
		}
	},
	methods: {
		/**
		 * 返回上一页
		 */
		goBack() {
			uni.navigateBack();
		},
		
		/**
		 * 展开/收起常见问题
		 */
		toggleFaq(index) {
			this.faqList[index].expanded = !this.faqList[index].expanded;
		},
		
		/**
		 * 联系客服
		 */
		contactCustomerService() {
			uni.showModal({
				title: '联系客服',
				content: '客服邮箱：support@futureleaders.cn\n客服电话：400-123-4567\n服务时间：周一至周五 9:00-18:00',
				showCancel: false,
				confirmText: '我知道了'
			});
		},
		
		/**
		 * 选择图片
		 */
		chooseImage() {
			if (this.uploadedImages.length >= 3) {
				uni.showToast({
					title: '最多上传3张图片',
					icon: 'none'
				});
				return;
			}
			
			uni.chooseImage({
				count: 3 - this.uploadedImages.length,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					this.uploadedImages = [...this.uploadedImages, ...res.tempFilePaths];
				}
			});
		},
		
		/**
		 * 删除已上传图片
		 */
		deleteImage(index) {
			this.uploadedImages.splice(index, 1);
		},
		
		/**
		 * 提交反馈
		 */
		submitFeedback() {
			if (!this.feedbackContent.trim()) {
				uni.showToast({
					title: '请填写反馈内容',
					icon: 'none'
				});
				return;
			}
			
			// 这里模拟提交反馈
			uni.showLoading({
				title: '提交中...'
			});
			
			setTimeout(() => {
				uni.hideLoading();
				uni.showToast({
					title: '提交成功',
					icon: 'success'
				});
				
				// 清空表单
				this.feedbackContent = '';
				this.contactInfo = '';
				this.uploadedImages = [];
				this.feedbackType = 'bug';
				
				// 切换到FAQ页
				this.activeTab = 'faq';
			}, 1500);
		}
	}
}
</script>

<style>
.page-container {
	background-color: #f5f5f5;
	min-height: 100vh;
}

.page-container.dark-mode {
	background-color: #121212;
}

/* 导航栏样式 */
.nav-bar {
	display: flex;
	align-items: center;
	height: 88rpx;
	background: linear-gradient(135deg, #8B5CF6, #7C3AED);
	padding: 75rpx 40rpx 60rpx 40rpx;
	position: relative;
}

.nav-left {
	position: absolute;
	left: 30rpx;
	z-index: 1;
}

.icon {
	color: white;
	font-size: 48rpx;
	font-weight: bold;
}

.nav-title {
	flex: 1;
	text-align: center;
	color: white;
	font-size: 48rpx;
	font-weight: bold;
}

/* 内容区域 */
.content-area {
	padding: 30rpx;
	padding-bottom: 60rpx;
}

.content-area.dark-mode {
	color: #e0e0e0;
}

/* 选项卡 */
.tab-container {
	display: flex;
	margin-bottom: 30rpx;
	background-color: #fff;
	border-radius: 16rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
}

.tab-container.dark-mode {
	background-color: #1f1f1f;
	box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.2);
}

.tab-item {
	flex: 1;
	text-align: center;
	font-size: 28rpx;
	color: #666;
	padding: 30rpx 0;
	position: relative;
}

.tab-item.dark-mode {
	color: #aaa;
}

.tab-item.active {
	color: #8B5CF6;
	font-weight: bold;
}

.tab-item.active::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 25%;
	width: 50%;
	height: 6rpx;
	background: linear-gradient(135deg, #8B5CF6, #7C3AED);
	border-radius: 3rpx;
}

/* 常见问题 */
.faq-container {
	margin-bottom: 60rpx;
}

.faq-item {
	background-color: #fff;
	border-radius: 16rpx;
	margin-bottom: 20rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
	overflow: hidden;
}

.faq-item.dark-mode {
	background-color: #1f1f1f;
	box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.2);
}

.faq-question {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.question-text {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
}

.dark-mode .question-text {
	color: #e0e0e0;
}

.arrow {
	font-size: 32rpx;
	color: #999;
	transition: transform 0.3s;
}

.dark-mode .arrow {
	color: #777;
}

.arrow.expanded {
	transform: rotate(180deg);
}

.faq-answer {
	margin-top: 20rpx;
	padding-top: 20rpx;
	border-top: 1px solid #f0f0f0;
	font-size: 26rpx;
	color: #666;
	line-height: 1.8;
}

.dark-mode .faq-answer {
	border-top: 1px solid #333;
	color: #aaa;
}

.no-answer {
	margin-top: 40rpx;
	text-align: center;
	font-size: 26rpx;
	color: #999;
}

.dark-mode .no-answer {
	color: #777;
}

.contact-options {
	display: flex;
	justify-content: center;
	margin-top: 20rpx;
}

.contact-btn {
	margin: 0 20rpx;
	padding: 16rpx 30rpx;
	background: linear-gradient(135deg, #8B5CF6, #7C3AED);
	border-radius: 100rpx;
}

.contact-btn text {
	color: #fff;
	font-size: 24rpx;
}

/* 反馈表单 */
.feedback-container {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
}

.feedback-container.dark-mode {
	background-color: #1f1f1f;
	box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.2);
}

.form-item {
	margin-bottom: 30rpx;
}

.form-label {
	font-size: 28rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 16rpx;
}

.dark-mode .form-label {
	color: #e0e0e0;
}

.form-radio-group {
	display: flex;
	flex-wrap: wrap;
}

.radio-item {
	display: flex;
	align-items: center;
	margin-right: 40rpx;
	margin-bottom: 20rpx;
}

.radio-circle {
	width: 32rpx;
	height: 32rpx;
	border-radius: 50%;
	border: 2rpx solid #ccc;
	margin-right: 10rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.dark-mode .radio-circle {
	border-color: #666;
}

.radio-circle.selected {
	border-color: #8B5CF6;
}

.radio-inner {
	width: 16rpx;
	height: 16rpx;
	border-radius: 50%;
	background-color: #8B5CF6;
}

.radio-item text {
	font-size: 26rpx;
	color: #666;
}

.dark-mode .radio-item text {
	color: #aaa;
}

.feedback-textarea {
	width: 100%;
	height: 240rpx;
	padding: 20rpx;
	box-sizing: border-box;
	border: 1px solid #eee;
	border-radius: 8rpx;
	font-size: 26rpx;
	color: #333;
	background-color: #f9f9f9;
}

.feedback-textarea.dark-mode {
	border-color: #333;
	color: #e0e0e0;
	background-color: #2a2a2a;
}

.upload-area {
	display: flex;
	flex-direction: column;
}

.upload-btn {
	width: 160rpx;
	height: 160rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background-color: #f9f9f9;
	border: 1px dashed #ccc;
	border-radius: 8rpx;
	margin-bottom: 20rpx;
}

.dark-mode .upload-btn {
	background-color: #2a2a2a;
	border-color: #555;
}

.upload-icon {
	font-size: 40rpx;
	color: #999;
	margin-bottom: 10rpx;
}

.dark-mode .upload-icon {
	color: #777;
}

.upload-text {
	font-size: 24rpx;
	color: #999;
}

.dark-mode .upload-text {
	color: #777;
}

.image-preview-scroll {
	width: 100%;
	white-space: nowrap;
}

.image-preview-container {
	display: inline-flex;
}

.image-preview {
	position: relative;
	width: 160rpx;
	height: 160rpx;
	margin-right: 20rpx;
	border-radius: 8rpx;
	overflow: hidden;
}

.image-preview image {
	width: 100%;
	height: 100%;
}

.delete-btn {
	position: absolute;
	top: 0;
	right: 0;
	width: 40rpx;
	height: 40rpx;
	background-color: rgba(0,0,0,0.5);
	color: #fff;
	font-size: 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.contact-input {
	width: 100%;
	height: 80rpx;
	padding: 0 20rpx;
	box-sizing: border-box;
	border: 1px solid #eee;
	border-radius: 8rpx;
	font-size: 26rpx;
	color: #333;
	background-color: #f9f9f9;
}

.contact-input.dark-mode {
	border-color: #333;
	color: #e0e0e0;
	background-color: #2a2a2a;
}

.submit-btn {
	height: 88rpx;
	background: linear-gradient(135deg, #8B5CF6, #7C3AED);
	border-radius: 44rpx;
	color: #fff;
	font-size: 28rpx;
	font-weight: bold;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 60rpx;
}

.feedback-tips {
	margin-top: 30rpx;
	font-size: 24rpx;
	color: #999;
	text-align: center;
	line-height: 1.6;
}

.dark-mode .feedback-tips {
	color: #777;
}
</style> 