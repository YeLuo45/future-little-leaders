<template>
	<view class="page-container" :class="{ 'dark-mode': isDarkMode }">
		<!-- 顶部导航栏 -->
		<view class="nav-bar" :class="{ 'dark-mode': isDarkMode }">
			<view class="nav-left" @tap="goBack">
				<text class="icon">←</text>
			</view>
			<view class="nav-title">关于我们</view>
		</view>

		<!-- 内容区域 -->
		<view class="content-area" :class="{ 'dark-mode': isDarkMode }">
			<!-- 应用logo -->
			<view class="logo-container">
				<image class="app-logo" src="/static/logo.png" mode="aspectFit"></image>
				<view class="app-name">育儿时光纪</view>
				<view class="app-version">版本 1.0.0</view>
			</view>

			<!-- 应用介绍 -->
			<view class="section">
				<view class="section-title">应用介绍</view>
				<view class="section-content">
					<text class="paragraph">
						育儿时光纪是一款专为中国家庭设计的亲子任务管理应用，旨在帮助父母科学引导孩子全面成长。我们提供丰富的任务分类与标签，覆盖生活习惯、学习思维、心理品德、社会适应、社交与运动以及财商培养六大领域。
					</text>
					<text class="paragraph">
						通过精心设计的任务系统与积分奖励机制，帮助家长更好地陪伴孩子成长，培养孩子的自主能力、责任意识和全面素养。
					</text>
				</view>
			</view>

			<!-- 团队介绍 -->
			<!-- <view class="section">
				<view class="section-title">开发团队</view>
				<view class="section-content">
					<text class="paragraph">
						我们是一支热爱教育的团队，成员来自教育学、心理学和技术领域，致力于将先进的教育理念与技术创新相结合，为中国家庭提供科学、实用的亲子教育工具。
					</text>
				</view>
			</view> -->

			<!-- 联系方式 -->
			<view class="section">
				<view class="section-title">联系我们</view>
				<view class="section-content">
					<view class="contact-item">
						<text class="contact-label">客服邮箱：</text>
						<text class="contact-value">yuershiguangji45@outlook.com</text>
					</view>
					<!-- <view class="contact-item">
						<text class="contact-label">官方网站：</text>
						<text class="contact-value">www.futureleaders.cn</text>
					</view>
					<view class="contact-item">
						<text class="contact-label">公司地址：</text>
						<text class="contact-value">北京市海淀区中关村科技园</text>
					</view> -->
				</view>
			</view>

			<!-- 备案信息 -->
			<view class="icp-info">
				<text>京ICP备XXXXXXXX号-X</text>
				<text>©2025 育儿时光纪 版权所有</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				isDarkMode: false
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
			}
		}
	}
</script>

<style>
	.page-container {
		background-color: #f5f5f5;
		min-height: 100vh;
		padding-bottom: 60rpx;
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
		padding: 90rpx 40rpx 60rpx 40rpx;
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
	}

	.content-area.dark-mode {
		color: #e0e0e0;
	}

	/* Logo区域 */
	.logo-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 40rpx 0 60rpx;
	}

	.app-logo {
		width: 200rpx;
		height: 200rpx;
		border-radius: 40rpx;
		margin-bottom: 20rpx;
	}

	.app-name {
		font-size: 36rpx;
		font-weight: bold;
		margin-bottom: 10rpx;
		color: #333;
	}

	.dark-mode .app-name {
		color: #e0e0e0;
	}

	.app-version {
		font-size: 24rpx;
		color: #999;
	}

	.dark-mode .app-version {
		color: #777;
	}

	/* 内容区块 */
	.section {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
	}

	.dark-mode .section {
		background-color: #1f1f1f;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
	}

	.section-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #8B5CF6;
		margin-bottom: 20rpx;
		position: relative;
		padding-left: 20rpx;
	}

	.section-title::before {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 8rpx;
		height: 32rpx;
		background: linear-gradient(135deg, #8B5CF6, #7C3AED);
		border-radius: 4rpx;
	}

	.dark-mode .section-title {
		color: #a78bfa;
	}

	.section-content {
		font-size: 28rpx;
		color: #666;
		line-height: 1.6;
	}

	.dark-mode .section-content {
		color: #aaa;
	}

	.paragraph {
		display: block;
		margin-bottom: 20rpx;
	}

	/* 联系方式 */
	.contact-item {
		display: flex;
		margin-bottom: 16rpx;
	}

	.contact-label {
		font-weight: bold;
		color: #333;
		width: 160rpx;
	}

	.dark-mode .contact-label {
		color: #e0e0e0;
	}

	.contact-value {
		color: #666;
		flex: 1;
	}

	.dark-mode .contact-value {
		color: #aaa;
	}

	/* 备案信息 */
	.icp-info {
		margin-top: 60rpx;
		text-align: center;
		font-size: 24rpx;
		color: #999;
		display: flex;
		flex-direction: column;
		gap: 10rpx;
	}

	.dark-mode .icp-info {
		color: #777;
	}
</style>