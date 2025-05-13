<template>
	<view class="page-container" :class="{ 'dark-mode': isDarkMode }">
		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-left" @tap="goBack">
				<text class="icon">←</text>
			</view>
			<view class="nav-title">认证设置</view>
		</view>
		<view class="auth-settings">
			<view class="section">
				<view class="section-title">认证模式</view>
				<view class="setting-item">
					<text>开启认证模式</text>
					<switch :checked="authSettings.isEnabled" @change="onAuthModeChange" color="#7C3AED" />
				</view>
				<view class="section-desc">开启后，完成任务时需要验证身份</view>
			</view>

			<view class="section">
				<view class="section-title">验证方式</view>
				<view class="setting-item" @tap="openPasswordModal">
					<text>密码验证</text>
					<view class="setting-right">
						<text class="setting-status">{{ authSettings.hasPassword ? '已设置' : '未设置' }}</text>
						<text class="arrow">></text>
					</view>
				</view>
				<view class="setting-item" @tap="toggleBiometric">
					<text>生物识别</text>
					<view class="setting-right">
						<text class="setting-status">{{ authSettings.hasBiometric ? '已开启' : '未开启' }}</text>
						<text class="arrow">></text>
					</view>
				</view>
				<view class="setting-item" @tap="toggleFaceId">
					<text>人脸识别</text>
					<view class="setting-right">
						<text class="setting-status">{{ authSettings.hasFaceId ? '已开启' : '未开启' }}</text>
						<text class="arrow">></text>
					</view>
				</view>
			</view>

			<!-- 密码设置弹窗 -->
			<view class="modal-mask" v-if="showPasswordModal" @tap="closePasswordModal">
				<view class="modal-content" @tap.stop>
					<view class="modal-title">{{ authSettings.hasPassword ? '修改密码' : '设置密码' }}</view>
					<view class="input-group">
						<input v-if="authSettings.hasPassword" type="password" v-model="oldPassword"
							placeholder="请输入原密码" class="input" />
						<input type="password" v-model="newPassword" placeholder="请输入新密码" class="input" />
						<input type="password" v-model="confirmPassword" placeholder="请确认新密码" class="input" />
					</view>
					<view class="modal-buttons">
						<button class="cancel-btn" @tap="closePasswordModal">取消</button>
						<button class="confirm-btn" @tap="savePassword">确定</button>
					</view>
				</view>
			</view>
		</view>
	</view>

</template>

<script>
import { ref, onMounted } from 'vue';

export default {
	name: 'AuthSettings',
	setup() {
		const authSettings = ref({
			isEnabled: false,
			hasPassword: false,
			hasBiometric: false,
			hasFaceId: false
		});
		const showPasswordModal = ref(false);
		const oldPassword = ref('');
		const newPassword = ref('');
		const confirmPassword = ref('');

		// 加载认证设置
		const loadAuthSettings = () => {
			try {
				const settings = uni.getStorageSync('authSettings');
				if (settings) {
					authSettings.value = JSON.parse(settings);
				}
			} catch (e) {
				console.error('加载认证设置失败:', e);
			}
		};

		// 保存认证设置
		const saveAuthSettings = () => {
			try {
				uni.setStorageSync('authSettings', JSON.stringify(authSettings.value));
			} catch (e) {
				console.error('保存认证设置失败:', e);
			}
		};

		// 通用认证方法
		const verifyAuth = () => {
			return new Promise((resolve, reject) => {
				const availableMethods = [];
				if (authSettings.value.hasPassword) availableMethods.push('密码验证');
				if (authSettings.value.hasBiometric) availableMethods.push('指纹验证');
				if (authSettings.value.hasFaceId) availableMethods.push('人脸识别');
				if (availableMethods.length === 0) {
					uni.showToast({ title: '未设置认证方式', icon: 'none' });
					reject();
					return;
				}
				uni.showActionSheet({
					itemList: availableMethods,
					success: (res) => {
						const method = availableMethods[res.tapIndex];
						if (method === '密码验证') {
							uni.showModal({
								title: '请输入密码',
								editable: true,
								placeholderText: '请输入密码',
								success: (res) => {
									const storedPassword = uni.getStorageSync('authPassword');
									if (res.content === storedPassword) resolve();
									else {
										uni.showToast({ title: '密码错误', icon: 'none' });
										reject();
									}
								}
							});
						} else if (method === '指纹验证') {
							// #ifdef MP-WEIXIN
							uni.startSoterAuthentication({
								requestAuthModes: ['fingerPrint'],
								challenge: 'challenge',
								authContent: '请验证指纹',
								success: () => resolve(),
								fail: () => { uni.showToast({ title: '指纹验证失败', icon: 'none' }); reject(); }
							});
							// #endif
						} else if (method === '人脸识别') {
							// #ifdef MP-WEIXIN
							uni.startSoterAuthentication({
								requestAuthModes: ['facial'],
								challenge: 'challenge',
								authContent: '请进行人脸识别',
								success: () => resolve(),
								fail: () => { uni.showToast({ title: '人脸识别失败', icon: 'none' }); reject(); }
							});
							// #endif
						}
					},
					fail: () => { reject(); }
				});
			});
		};

		// 切换认证模式
		const onAuthModeChange = async (e) => {
			if (!authSettings.value.hasPassword && !authSettings.value.hasBiometric && !authSettings.value.hasFaceId) {
				uni.showToast({
					title: '请先设置至少一种验证方式',
					icon: 'none'
				});
				return;
			}
			if (!e.detail.value) {
				// 关闭认证模式时需要认证
				try {
					await verifyAuth();
					authSettings.value.isEnabled = false;
					saveAuthSettings();
					uni.showToast({ title: '认证模式已关闭', icon: 'success' });
				} catch {
					// 验证失败，不关闭
					return;
				}
			} else {
				authSettings.value.isEnabled = true;
				saveAuthSettings();
			}
		};

		// 显示密码设置弹窗
		const openPasswordModal = () => {
			oldPassword.value = '';
			newPassword.value = '';
			confirmPassword.value = '';
			showPasswordModal.value = true;
		};

		// 关闭密码设置弹窗
		const closePasswordModal = () => {
			showPasswordModal.value = false;
		};

		// 保存密码
		const savePassword = () => {
			if (authSettings.value.hasPassword && !oldPassword.value) {
				uni.showToast({
					title: '请输入原密码',
					icon: 'none'
				});
				return;
			}

			if (!newPassword.value) {
				uni.showToast({
					title: '请输入新密码',
					icon: 'none'
				});
				return;
			}

			if (newPassword.value !== confirmPassword.value) {
				uni.showToast({
					title: '两次密码输入不一致',
					icon: 'none'
				});
				return;
			}

			// 验证原密码
			if (authSettings.value.hasPassword) {
				const storedPassword = uni.getStorageSync('authPassword');
				if (oldPassword.value !== storedPassword) {
					uni.showToast({
						title: '原密码错误',
						icon: 'none'
					});
					return;
				}
			}

			// 保存新密码
			uni.setStorageSync('authPassword', newPassword.value);
			authSettings.value.hasPassword = true;
			saveAuthSettings();
			closePasswordModal();

			uni.showToast({
				title: '密码设置成功',
				icon: 'success'
			});
		};

		// 切换生物识别
		const toggleBiometric = () => {
			// 检查是否在微信小程序环境
			// #ifdef MP-WEIXIN
			uni.checkIsSupportSoterAuthentication({
				success: (res) => {
					if (res.supportMode.includes('fingerPrint')) {
						// 如果已开启，则关闭
						if (authSettings.value.hasBiometric) {
							authSettings.value.hasBiometric = false;
							saveAuthSettings();
							uni.showToast({
								title: '已关闭生物识别',
								icon: 'success'
							});
						} else {
							// 开启生物识别
							uni.startSoterAuthentication({
								requestAuthModes: ['fingerPrint'],
								challenge: 'challenge',
								authContent: '请验证指纹',
								success: () => {
									authSettings.value.hasBiometric = true;
									saveAuthSettings();
									uni.showToast({
										title: '已开启生物识别',
										icon: 'success'
									});
								},
								fail: () => {
									uni.showToast({
										title: '生物识别验证失败',
										icon: 'none'
									});
								}
							});
						}
					} else {
						uni.showToast({
							title: '设备不支持生物识别',
							icon: 'none'
						});
					}
				},
				fail: () => {
					uni.showToast({
						title: '设备不支持生物识别',
						icon: 'none'
					});
				}
			});
			// #endif

			// #ifndef MP-WEIXIN
			uni.showToast({
				title: '当前环境不支持生物识别',
				icon: 'none'
			});
			// #endif
		};

		// 切换人脸识别
		const toggleFaceId = () => {
			// 检查是否在微信小程序环境
			// #ifdef MP-WEIXIN
			uni.checkIsSupportSoterAuthentication({
				success: (res) => {
					if (res.supportMode.includes('facial')) {
						// 如果已开启，则关闭
						if (authSettings.value.hasFaceId) {
							authSettings.value.hasFaceId = false;
							saveAuthSettings();
							uni.showToast({
								title: '已关闭人脸识别',
								icon: 'success'
							});
						} else {
							// 开启人脸识别
							uni.startSoterAuthentication({
								requestAuthModes: ['facial'],
								challenge: 'challenge',
								authContent: '请进行人脸识别',
								success: () => {
									authSettings.value.hasFaceId = true;
									saveAuthSettings();
									uni.showToast({
										title: '已开启人脸识别',
										icon: 'success'
									});
								},
								fail: () => {
									uni.showToast({
										title: '人脸识别验证失败',
										icon: 'none'
									});
								}
							});
						}
					} else {
						uni.showToast({
							title: '设备不支持人脸识别',
							icon: 'none'
						});
					}
				},
				fail: () => {
					uni.showToast({
						title: '设备不支持人脸识别',
						icon: 'none'
					});
				}
			});
			// #endif

			// #ifndef MP-WEIXIN
			uni.showToast({
				title: '当前环境不支持人脸识别',
				icon: 'none'
			});
			// #endif
		};

		// 返回上一页
		const goBack = () => {
			uni.navigateBack();
		};

		onMounted(() => {
			loadAuthSettings();
		});

		return {
			authSettings,
			showPasswordModal,
			oldPassword,
			newPassword,
			confirmPassword,
			onAuthModeChange,
			openPasswordModal,
			closePasswordModal,
			savePassword,
			toggleBiometric,
			toggleFaceId,
			goBack
		};
	}
};
</script>

<style>
.page-container {
	min-height: 100vh;
	background-color: #f5f5f5;
	padding-bottom: 50px;
}

.dark-mode {
	background-color: #1a1a1a;
	color: #ffffff;
}

.nav-bar {
	display: flex;
	align-items: center;
	height: 88rpx;
	background: linear-gradient(135deg, #8B5CF6, #7C3AED);
	padding: 0 30rpx;
	position: relative;
}

.nav-left {
	position: absolute;
	left: 30rpx;
	z-index: 1;
}

.icon {
	color: white;
	font-size: 36rpx;
}

.nav-title {
	flex: 1;
	text-align: center;
	color: white;
	font-size: 32rpx;
	font-weight: bold;
}

.auth-settings {
	padding: 20rpx;
	background-color: #f5f5f5;
	min-height: 100vh;
}

.section {
	background-color: #fff;
	border-radius: 12rpx;
	padding: 20rpx;
	margin-bottom: 20rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 20rpx;
	color: #333;
}

.section-desc {
	font-size: 24rpx;
	color: #999;
	margin-top: 10rpx;
}

.setting-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}

.setting-item:last-child {
	border-bottom: none;
}

.setting-right {
	display: flex;
	align-items: center;
}

.setting-status {
	font-size: 24rpx;
	color: #999;
	margin-right: 10rpx;
}

.arrow {
	color: #999;
	font-size: 24rpx;
}

.modal-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.6);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 999;
}

.modal-content {
	background-color: #fff;
	border-radius: 12rpx;
	padding: 30rpx;
	width: 600rpx;
}

.modal-title {
	font-size: 32rpx;
	font-weight: bold;
	text-align: center;
	margin-bottom: 30rpx;
}

.input-group {
	margin-bottom: 30rpx;
}

.input {
	border: 1rpx solid #ddd;
	border-radius: 8rpx;
	padding: 20rpx;
	margin-bottom: 20rpx;
	font-size: 28rpx;
}

.modal-buttons {
	display: flex;
	justify-content: space-between;
}

.cancel-btn,
.confirm-btn {
	width: 45%;
	padding: 20rpx 0;
	border-radius: 8rpx;
	font-size: 28rpx;
}

.cancel-btn {
	background-color: #f5f5f5;
	color: #666;
}

.confirm-btn {
	background-color: #7C3AED;
	color: #fff;
}
</style>