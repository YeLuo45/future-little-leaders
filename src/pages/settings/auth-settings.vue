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
				<view class="setting-item" @tap="onSettingItemTap">
					<text>开启认证模式</text>
					<switch :checked="authSettings.isEnabled" @change="onAuthModeChange" 
					        color="#7C3AED" 
					        :disabled="!hasAnyAuthMethod" />
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
					
					<!-- 原密码输入框 -->
					<block v-if="authSettings.hasPassword">
						<view class="password-input-box">
							<input 
								:type="oldPasswordVisible ? 'text' : 'password'" 
								v-model="oldPassword"
								placeholder="请输入原密码" 
								class="password-input" 
							/>
							<text 
								class="password-toggle-icon" 
								@tap="oldPasswordVisible = !oldPasswordVisible"
							>
								{{ oldPasswordVisible ? '👁️' : '👁️‍🗨️' }}
							</text>
						</view>
					</block>
					
					<!-- 新密码输入框 -->
					<view class="password-input-box">
						<input 
							:type="newPasswordVisible ? 'text' : 'password'" 
							v-model="newPassword"
							placeholder="请输入新密码(6-40个字符)" 
							class="password-input" 
						/>
						<text 
							class="password-toggle-icon" 
							@tap="newPasswordVisible = !newPasswordVisible"
						>
							{{ newPasswordVisible ? '👁️' : '👁️‍🗨️' }}
						</text>
					</view>
					
					<!-- 确认密码输入框 -->
					<view class="password-input-box">
						<input 
							:type="confirmPasswordVisible ? 'text' : 'password'" 
							v-model="confirmPassword"
							placeholder="请确认新密码" 
							class="password-input" 
						/>
						<text 
							class="password-toggle-icon" 
							@tap="confirmPasswordVisible = !confirmPasswordVisible"
						>
							{{ confirmPasswordVisible ? '👁️' : '👁️‍🗨️' }}
						</text>
					</view>
					
					<!-- 按钮区域 -->
					<view class="modal-actions">
						<button class="modal-btn cancel-btn" @tap="closePasswordModal">取消</button>
						<button class="modal-btn confirm-btn" @tap="savePassword">确定</button>
					</view>
				</view>
			</view>
		</view>
	</view>

</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { getAuthSettings, saveAuthSettings, verifyAuth } from '@/utils/authUtils';

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
		
		// 密码显示状态
		const oldPasswordVisible = ref(false);
		const newPasswordVisible = ref(false);
		const confirmPasswordVisible = ref(false);

		// 计算是否有任意一种验证方式
		const hasAnyAuthMethod = computed(() => {
			return authSettings.value.hasPassword || 
			       authSettings.value.hasBiometric || 
			       authSettings.value.hasFaceId;
		});

		// 加载认证设置
		const loadAuthSettings = () => {
			const settings = getAuthSettings();
			if (settings) {
				authSettings.value = settings;
			}
		};

		// 保存认证设置
		const saveSettings = () => {
			saveAuthSettings(authSettings.value);
		};

		// 点击设置项
		const onSettingItemTap = () => {
			// 检查是否有至少一种验证方式
			if (!hasAnyAuthMethod.value && !authSettings.value.isEnabled) {
				uni.showToast({
					title: '未开启验证方式，无法开启认证模式',
					icon: 'none',
					duration: 2000
				});
			}
		};

		// 切换认证模式
		const onAuthModeChange = async (e) => {
			const isChecked = e.detail.value;
			
			// 尝试开启认证模式
			if (isChecked) {
				// 检查是否有至少一种验证方式
				if (!hasAnyAuthMethod.value) {
					uni.showToast({
						title: '未开启验证方式，无法开启认证模式',
						icon: 'none',
						duration: 2000
					});
					return;
				}
				authSettings.value.isEnabled = true;
				saveSettings();
				uni.showToast({ 
					title: '认证模式已开启', 
					icon: 'success' 
				});
			} else {
				// 暂时保持开关状态，在验证成功后才实际关闭
				setTimeout(() => {
					authSettings.value.isEnabled = true;
				}, 100);
				
				// 关闭认证模式时需要认证
				verifyAuth(
					// 成功回调
					() => {
						authSettings.value.isEnabled = false;
						saveSettings();
						uni.showToast({ 
							title: '认证模式已关闭', 
							icon: 'success' 
						});
					},
					// 失败回调
					(error) => {
						console.error('认证失败:', error);
						// 验证失败，强制保持开关开启状态
						// 不需要额外操作，因为我们已经在上面提前恢复了开关状态
						uni.showToast({
							title: '验证失败，无法关闭认证模式',
							icon: 'none',
							duration: 2000
						});
					}
				);
			}
		};

		// 显示密码设置弹窗
		const openPasswordModal = () => {
			oldPassword.value = '';
			newPassword.value = '';
			confirmPassword.value = '';
			// 重置密码显示状态
			oldPasswordVisible.value = false;
			newPasswordVisible.value = false;
			confirmPasswordVisible.value = false;
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
			
			// 检查密码长度
			if (newPassword.value.length < 6 || newPassword.value.length > 40) {
				uni.showToast({
					title: '密码长度需要6-40个字符',
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
			saveSettings();
			closePasswordModal();

			uni.showToast({
				title: '密码设置成功',
				icon: 'success'
			});
		};

		// 切换生物识别
		const toggleBiometric = async () => {
			// 如果已开启，则验证后关闭
			if (authSettings.value.hasBiometric) {
				verifyAuth(
					// 成功回调
					() => {
						authSettings.value.hasBiometric = false;
						saveSettings();
						
						// 如果没有任何验证方式，则自动关闭认证模式
						if (!hasAnyAuthMethod.value && authSettings.value.isEnabled) {
							authSettings.value.isEnabled = false;
							saveSettings();
							uni.showToast({
								title: '已关闭认证模式',
								icon: 'none'
							});
						} else {
							uni.showToast({
								title: '已关闭生物识别',
								icon: 'success'
							});
						}
					},
					// 失败回调
					(error) => {
						console.error('认证失败:', error);
					}
				);
				return;
			}
			
			// 开启生物识别
			// #ifdef MP-WEIXIN
			uni.checkIsSupportSoterAuthentication({
				success: (res) => {
					console.log('Soter支持情况:', res);
					if (res.supportMode && res.supportMode.includes('fingerPrint')) {
						// 检查设备是否已录入指纹
						uni.checkIsSoterEnrolledInDevice({
							checkAuthMode: 'fingerPrint',
							success: (res) => {
								console.log('指纹录入情况:', res);
								if (res.isEnrolled) {
									// 开启指纹认证
									uni.startSoterAuthentication({
										requestAuthModes: ['fingerPrint'],
										challenge: 'challenge',
										authContent: '请验证指纹',
										success: () => {
											authSettings.value.hasBiometric = true;
											saveSettings();
											uni.showToast({
												title: '已开启生物识别',
												icon: 'success'
											});
										},
										fail: (error) => {
											console.error('生物识别失败:', error);
											uni.showToast({
												title: '生物识别验证失败',
												icon: 'none'
											});
											// 不改变设置状态，允许用户再次尝试
										}
									});
								} else {
									uni.showToast({
										title: '设备未录入指纹',
										icon: 'none'
									});
								}
							},
							fail: (error) => {
								console.error('检查指纹录入失败:', error);
								uni.showToast({
									title: '无法验证指纹状态',
									icon: 'none'
								});
							}
						});
					} else {
						uni.showToast({
							title: '设备不支持指纹识别',
							icon: 'none'
						});
					}
				},
				fail: (error) => {
					console.error('检查生物识别支持失败:', error);
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
		const toggleFaceId = async () => {
			// 如果已开启，则验证后关闭
			if (authSettings.value.hasFaceId) {
				verifyAuth(
					// 成功回调
					() => {
						authSettings.value.hasFaceId = false;
						saveSettings();
						
						// 如果没有任何验证方式，则自动关闭认证模式
						if (!hasAnyAuthMethod.value && authSettings.value.isEnabled) {
							authSettings.value.isEnabled = false;
							saveSettings();
							uni.showToast({
								title: '已关闭认证模式',
								icon: 'none'
							});
						} else {
							uni.showToast({
								title: '已关闭人脸识别',
								icon: 'success'
							});
						}
					},
					// 失败回调
					(error) => {
						console.error('认证失败:', error);
					}
				);
				return;
			}
			
			// 检查是否在微信小程序环境
			// #ifdef MP-WEIXIN
			uni.checkIsSupportSoterAuthentication({
				success: (res) => {
					console.log('Soter支持情况:', res);
					if (res.supportMode && res.supportMode.includes('facial')) {
						// 检查设备是否已录入人脸
						uni.checkIsSoterEnrolledInDevice({
							checkAuthMode: 'facial',
							success: (enrollRes) => {
								console.log('人脸录入情况:', enrollRes);
								if (enrollRes.isEnrolled) {
									// 开启人脸识别
									uni.startSoterAuthentication({
										requestAuthModes: ['facial'],
										challenge: 'challenge',
										authContent: '请进行人脸识别',
										success: () => {
											authSettings.value.hasFaceId = true;
											saveSettings();
											uni.showToast({
												title: '已开启人脸识别',
												icon: 'success'
											});
										},
										fail: (error) => {
											console.error('人脸识别失败:', error);
											uni.showToast({
												title: '人脸识别验证失败',
												icon: 'none'
											});
											// 不改变设置状态，允许用户再次尝试
										}
									});
								} else {
									uni.showToast({
										title: '设备未录入人脸信息',
										icon: 'none'
									});
								}
							},
							fail: (error) => {
								console.error('检查人脸录入失败:', error);
								// 当特定API不支持时，尝试直接使用认证API
								uni.startSoterAuthentication({
									requestAuthModes: ['facial'],
									challenge: 'challenge',
									authContent: '请进行人脸识别',
									success: () => {
										authSettings.value.hasFaceId = true;
										saveSettings();
										uni.showToast({
											title: '已开启人脸识别',
											icon: 'success'
										});
									},
									fail: (authError) => {
										console.error('人脸识别失败:', authError);
										uni.showToast({
											title: '人脸识别验证失败',
											icon: 'none'
										});
									}
								});
							}
						});
					} else {
						uni.showToast({
							title: '设备不支持人脸识别',
							icon: 'none'
						});
					}
				},
				fail: (error) => {
					console.error('检查人脸识别支持失败:', error);
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
			hasAnyAuthMethod,
			showPasswordModal,
			oldPassword,
			newPassword,
			confirmPassword,
			oldPasswordVisible,
			newPasswordVisible,
			confirmPasswordVisible,
			onAuthModeChange,
			onSettingItemTap,
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
	padding: 40rpx 30rpx;
	width: 85%;
	max-width: 600rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.modal-title {
	font-size: 36rpx;
	font-weight: bold;
	text-align: center;
	margin-bottom: 40rpx;
	color: #333;
}

.password-input-box {
	position: relative;
	margin-bottom: 30rpx;
	border-radius: 8rpx;
	overflow: hidden;
	border: 1rpx solid #e0e0e0;
	height: 88rpx;
}

.password-input {
	height: 88rpx;
	width: 100%;
	padding: 0 20rpx;
	padding-right: 70rpx;
	font-size: 30rpx;
	box-sizing: border-box;
	color: #333;
}

.password-toggle-icon {
	position: absolute;
	right: 20rpx;
	top: 50%;
	transform: translateY(-50%);
	font-size: 40rpx;
	color: #999;
	z-index: 2;
}

.modal-actions {
	display: flex;
	justify-content: space-between;
	margin-top: 30rpx;
}

.modal-btn {
	flex: 1;
	height: 88rpx;
	line-height: 88rpx;
	text-align: center;
	font-size: 32rpx;
	border-radius: 44rpx;
	margin: 0 15rpx;
}

.cancel-btn {
	background-color: #f5f5f5;
	color: #666;
}

.confirm-btn {
	background: linear-gradient(135deg, #8B5CF6, #7C3AED);
	color: white;
	box-shadow: 0 4rpx 12rpx rgba(132, 119, 250, 0.3);
}
</style>