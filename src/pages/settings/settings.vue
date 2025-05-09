<template>
	<view class="settings-container" :class="{'dark-mode': isDarkMode}">
		<!-- 页面标题 -->
		<view class="header" :class="{'dark-mode': isDarkMode}">
			<view class="back-btn" @tap="goBack">
				<text class="back-icon">←</text>
			</view>
			<view class="title">设置</view>
		</view>
		
		<!-- 设置项分组 -->
		<view class="settings-section" :class="{'dark-mode': isDarkMode}">
			<view class="section-title">账号与安全</view>
			
			<!-- 个人资料设置 -->
			<view class="settings-item" @tap="navigateToProfile">
				<view class="item-left">
					<view class="item-icon icon-profile" :class="{'dark-mode': isDarkMode}">👤</view>
					<text class="item-label">个人资料设置</text>
				</view>
				<text class="item-arrow">›</text>
			</view>
			
			<!-- 隐私设置 -->
			<view class="settings-item" @tap="navigateToPrivacy">
				<view class="item-left">
					<view class="item-icon icon-privacy" :class="{'dark-mode': isDarkMode}">🔒</view>
					<text class="item-label">隐私设置</text>
				</view>
				<text class="item-arrow">›</text>
			</view>
			
			<!-- 账号安全 -->
			<view class="settings-item" @tap="navigateToSecurity">
				<view class="item-left">
					<view class="item-icon icon-security" :class="{'dark-mode': isDarkMode}">🛡️</view>
					<text class="item-label">账号安全</text>
				</view>
				<text class="item-arrow">›</text>
			</view>
		</view>
		
		<!-- 通用设置分组 -->
		<view class="settings-section" :class="{'dark-mode': isDarkMode}">
			<view class="section-title">通用设置</view>
			
			<!-- 暗色模式 -->
			<view class="settings-item">
				<view class="item-left">
					<view class="item-icon icon-theme" :class="{'dark-mode': isDarkMode}">{{ isDarkMode ? '🌙' : '☀️' }}</view>
					<text class="item-label">暗色模式</text>
				</view>
				<switch :checked="isDarkMode" @change="toggleDarkMode" color="#8477fa" />
			</view>
			
			<!-- 消息通知 -->
			<view class="settings-item" @tap="navigateToNotification">
				<view class="item-left">
					<view class="item-icon icon-notification" :class="{'dark-mode': isDarkMode}">🔔</view>
					<text class="item-label">消息通知</text>
				</view>
				<text class="item-arrow">›</text>
			</view>
			
			<!-- 语言设置 -->
			<view class="settings-item" @tap="showLanguageOptions">
				<view class="item-left">
					<view class="item-icon icon-language" :class="{'dark-mode': isDarkMode}">🌐</view>
					<text class="item-label">语言设置</text>
				</view>
				<view class="item-right">
					<text class="item-value">{{ currentLanguage }}</text>
					<text class="item-arrow">›</text>
				</view>
			</view>
			
			<!-- 字体大小 -->
			<view class="settings-item" @tap="showFontSizeOptions">
				<view class="item-left">
					<view class="item-icon icon-font" :class="{'dark-mode': isDarkMode}">Aa</view>
					<text class="item-label">字体大小</text>
				</view>
				<view class="item-right">
					<text class="item-value">{{ currentFontSize }}</text>
					<text class="item-arrow">›</text>
				</view>
			</view>
			
			<!-- 清除缓存 -->
			<view class="settings-item" @tap="clearCache">
				<view class="item-left">
					<view class="item-icon icon-clear" :class="{'dark-mode': isDarkMode}">🗑️</view>
					<text class="item-label">清除缓存</text>
				</view>
				<text class="item-value">{{ cacheSize }}</text>
			</view>
		</view>
		
		<!-- 关于与帮助分组 -->
		<view class="settings-section" :class="{'dark-mode': isDarkMode}">
			<view class="section-title">关于与帮助</view>
			
			<!-- 关于我们 -->
			<view class="settings-item" @tap="navigateToAbout">
				<view class="item-left">
					<view class="item-icon icon-about" :class="{'dark-mode': isDarkMode}">ℹ️</view>
					<text class="item-label">关于我们</text>
				</view>
				<text class="item-arrow">›</text>
			</view>
			
			<!-- 帮助与反馈 -->
			<view class="settings-item" @tap="navigateToHelp">
				<view class="item-left">
					<view class="item-icon icon-help" :class="{'dark-mode': isDarkMode}">❓</view>
					<text class="item-label">帮助与反馈</text>
				</view>
				<text class="item-arrow">›</text>
			</view>
			
			<!-- 用户协议 -->
			<view class="settings-item" @tap="navigateToTerms">
				<view class="item-left">
					<view class="item-icon icon-terms" :class="{'dark-mode': isDarkMode}">📝</view>
					<text class="item-label">用户协议</text>
				</view>
				<text class="item-arrow">›</text>
			</view>
			
			<!-- 隐私政策 -->
			<view class="settings-item" @tap="navigateToPrivacyPolicy">
				<view class="item-left">
					<view class="item-icon icon-policy" :class="{'dark-mode': isDarkMode}">📋</view>
					<text class="item-label">隐私政策</text>
				</view>
				<text class="item-arrow">›</text>
			</view>
		</view>
		
		<!-- 版本信息 -->
		<view class="version-info" :class="{'dark-mode': isDarkMode}">
			<text>当前版本：v2.1.0</text>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			isDarkMode: false,
			currentLanguage: '简体中文',
			currentFontSize: '标准',
			cacheSize: '12.5MB',
			languages: ['简体中文', '繁體中文', 'English'],
			fontSizes: ['小', '标准', '大', '超大']
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
		 * 切换暗色模式
		 */
		toggleDarkMode(e) {
			this.isDarkMode = e.detail.value;
			// 保存设置到本地存储
			try {
				uni.setStorageSync('darkMode', this.isDarkMode.toString());
			} catch (e) {
				console.error('保存暗色模式设置失败', e);
			}
		},
		
		/**
		 * 导航到个人资料设置页面
		 */
		navigateToProfile() {
			uni.showToast({
				title: '即将推出',
				icon: 'none'
			});
		},
		
		/**
		 * 导航到隐私设置页面
		 */
		navigateToPrivacy() {
			uni.showToast({
				title: '即将推出',
				icon: 'none'
			});
		},
		
		/**
		 * 导航到账号安全页面
		 */
		navigateToSecurity() {
			uni.showToast({
				title: '即将推出',
				icon: 'none'
			});
		},
		
		/**
		 * 导航到消息通知设置页面
		 */
		navigateToNotification() {
			uni.showToast({
				title: '即将推出',
				icon: 'none'
			});
		},
		
		/**
		 * 显示语言选项
		 */
		showLanguageOptions() {
			uni.showActionSheet({
				itemList: this.languages,
				success: (res) => {
					this.currentLanguage = this.languages[res.tapIndex];
					uni.showToast({
						title: '语言已设置为：' + this.currentLanguage,
						icon: 'none'
					});
				}
			});
		},
		
		/**
		 * 显示字体大小选项
		 */
		showFontSizeOptions() {
			uni.showActionSheet({
				itemList: this.fontSizes,
				success: (res) => {
					this.currentFontSize = this.fontSizes[res.tapIndex];
					uni.showToast({
						title: '字体大小已设置为：' + this.currentFontSize,
						icon: 'none'
					});
				}
			});
		},
		
		/**
		 * 清除缓存
		 */
		clearCache() {
			uni.showModal({
				title: '提示',
				content: '确定要清除缓存吗？',
				success: (res) => {
					if (res.confirm) {
						// 模拟清除缓存的操作
						setTimeout(() => {
							this.cacheSize = '0KB';
							uni.showToast({
								title: '缓存已清除',
								icon: 'success'
							});
						}, 500);
					}
				}
			});
		},
		
		/**
		 * 导航到关于我们页面
		 */
		navigateToAbout() {
			uni.showToast({
				title: '即将推出',
				icon: 'none'
			});
		},
		
		/**
		 * 导航到帮助与反馈页面
		 */
		navigateToHelp() {
			uni.showToast({
				title: '即将推出',
				icon: 'none'
			});
		},
		
		/**
		 * 导航到用户协议页面
		 */
		navigateToTerms() {
			uni.showToast({
				title: '即将推出',
				icon: 'none'
			});
		},
		
		/**
		 * 导航到隐私政策页面
		 */
		navigateToPrivacyPolicy() {
			uni.showToast({
				title: '即将推出',
				icon: 'none'
			});
		}
	}
}
</script>

<style>
.settings-container {
	background-color: #f5f5f5;
	min-height: 100vh;
	padding-bottom: 60rpx;
}

.settings-container.dark-mode {
	background-color: #121212;
}

.header {
	position: relative;
	height: 100rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #fff;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.header.dark-mode {
	background-color: #1f1f1f;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.3);
}

.back-btn {
	position: absolute;
	left: 30rpx;
	top: 50%;
	transform: translateY(-50%);
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.back-icon {
	font-size: 40rpx;
	font-weight: bold;
	color: #333;
}

.dark-mode .back-icon {
	color: #e0e0e0;
}

.title {
	font-size: 36rpx;
	font-weight: 500;
	color: #333;
}

.dark-mode .title {
	color: #e0e0e0;
}

.settings-section {
	margin: 30rpx 30rpx 0;
	background-color: #fff;
	border-radius: 15rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.settings-section.dark-mode {
	background-color: #1f1f1f;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.3);
}

.section-title {
	padding: 20rpx 30rpx;
	font-size: 28rpx;
	color: #8477fa;
	font-weight: 500;
	border-bottom: 1rpx solid #f0f0f0;
}

.dark-mode .section-title {
	color: #9f8eff;
	border-bottom: 1rpx solid #333;
}

.settings-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	border-bottom: 1rpx solid #f5f5f5;
}

.dark-mode .settings-item {
	border-bottom: 1rpx solid #333;
}

.settings-item:last-child {
	border-bottom: none;
}

.item-left {
	display: flex;
	align-items: center;
}

.item-icon {
	width: 50rpx;
	height: 50rpx;
	border-radius: 50%;
	background-color: #f5f5f5;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 20rpx;
	font-size: 26rpx;
}

.item-icon.dark-mode {
	background-color: #333;
}

.item-label {
	font-size: 28rpx;
	color: #333;
}

.dark-mode .item-label {
	color: #e0e0e0;
}

.item-arrow {
	font-size: 36rpx;
	color: #ccc;
	margin-left: 10rpx;
}

.dark-mode .item-arrow {
	color: #666;
}

.item-right {
	display: flex;
	align-items: center;
}

.item-value {
	font-size: 26rpx;
	color: #999;
}

.dark-mode .item-value {
	color: #777;
}

/* 图标颜色样式 */
.icon-profile {
	background-color: #e3f2fd;
	color: #2196f3;
}

.icon-profile.dark-mode {
	background-color: #0d47a1;
	color: #90caf9;
}

.icon-privacy {
	background-color: #e8f5e9;
	color: #4caf50;
}

.icon-privacy.dark-mode {
	background-color: #1b5e20;
	color: #81c784;
}

.icon-security {
	background-color: #ede7f6;
	color: #673ab7;
}

.icon-security.dark-mode {
	background-color: #311b92;
	color: #b39ddb;
}

.icon-theme {
	background-color: #fff3e0;
	color: #ff9800;
}

.icon-theme.dark-mode {
	background-color: #e65100;
	color: #ffcc80;
}

.icon-notification {
	background-color: #fce4ec;
	color: #e91e63;
}

.icon-notification.dark-mode {
	background-color: #880e4f;
	color: #f48fb1;
}

.icon-language {
	background-color: #e0f7fa;
	color: #00bcd4;
}

.icon-language.dark-mode {
	background-color: #006064;
	color: #80deea;
}

.icon-font {
	background-color: #f1f1f1;
	color: #607d8b;
}

.icon-font.dark-mode {
	background-color: #263238;
	color: #b0bec5;
}

.icon-clear {
	background-color: #ffebee;
	color: #f44336;
}

.icon-clear.dark-mode {
	background-color: #b71c1c;
	color: #ef9a9a;
}

.icon-about {
	background-color: #f3e5f5;
	color: #9c27b0;
}

.icon-about.dark-mode {
	background-color: #4a148c;
	color: #ce93d8;
}

.icon-help {
	background-color: #e8eaf6;
	color: #3f51b5;
}

.icon-help.dark-mode {
	background-color: #1a237e;
	color: #9fa8da;
}

.icon-terms, .icon-policy {
	background-color: #f9fbe7;
	color: #cddc39;
}

.icon-terms.dark-mode, .icon-policy.dark-mode {
	background-color: #827717;
	color: #dce775;
}

.version-info {
	margin-top: 60rpx;
	text-align: center;
	font-size: 24rpx;
	color: #999;
}

.dark-mode .version-info {
	color: #777;
}
</style> 