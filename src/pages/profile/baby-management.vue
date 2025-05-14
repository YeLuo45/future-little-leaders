<template>
	<view class="page-container" :class="{'dark-mode': isDarkMode}">
		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<view class="nav-left" @tap="goBack">
				<text class="icon">←</text>
			</view>
			<view class="nav-title">宝宝管理</view>
		</view>

		<!-- 宝宝列表 -->
		<view class="baby-list">
			<view v-if="babies.length === 0" class="empty-state">
				<text class="empty-text">暂无宝宝信息</text>
				<button class="add-baby-btn" @tap="navigateToAddBaby">添加宝宝</button>
			</view>
			<view v-else class="baby-item" v-for="(baby, index) in babies" :key="baby.id">
				<view class="baby-avatar-container" @tap="selectAvatar(baby)">
					<image class="baby-avatar" :src="baby.avatar || '/static/avatar.svg'" mode="aspectFill"></image>
					<view class="avatar-edit-overlay">
						<text class="edit-icon">📷</text>
					</view>
				</view>
				<view class="baby-info">
					<view class="baby-name-container">
						<text class="baby-name" v-if="!editingBaby || editingBaby.id !== baby.id">{{ baby.name }}</text>
						<input 
							v-else 
							class="baby-name-input" 
							v-model="editName" 
							focus 
							@blur="saveBabyName(baby)"
							@confirm="saveBabyName(baby)"
						/>
						<text class="edit-name-btn" @tap="editBabyName(baby)">✏️</text>
					</view>
					<text class="baby-age">{{ formatAge(baby.birthdate) }}</text>
					<view class="baby-points">积分: {{ getBabyPoints(baby.id) }}</view>
				</view>
				<view class="baby-actions">
					<view class="action-btn delete-btn" @tap="deleteBaby(baby)">
						<text class="action-icon">🗑️</text>
					</view>
					<view class="action-btn primary-btn" @tap="setAsCurrentBaby(baby)">
						<text class="action-icon">{{ currentBabyId === baby.id ? '✓' : '👶' }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 添加宝宝按钮 -->
		<view class="float-btn" @tap="navigateToAddBaby">
			<text>＋</text>
		</view>

		<!-- 头像选择弹窗 -->
		<view class="modal-mask" v-if="showAvatarModal" @tap="closeAvatarModal">
			<view class="modal-content" @tap.stop>
				<view class="modal-title">更换头像</view>
				<view class="modal-option" @tap="uploadCustomAvatar('camera')">拍照</view>
				<view class="modal-option" @tap="uploadCustomAvatar('album')">本地相册</view>
				<view class="modal-footer">
					<button class="modal-btn cancel" @tap="closeAvatarModal">取消</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue';
import { isDarkTheme } from '@/utils/themeUtils.js';
import { getBabyPoints } from '@/utils/pointsManager';

export default {
	name: 'BabyManagement',
	setup() {
		const isDarkMode = ref(false);
		const babies = ref([]);
		const currentBabyId = ref('');
		const editingBaby = ref(null);
		const editName = ref('');
		const showAvatarModal = ref(false);
		const selectedBaby = ref(null);
		const authSettings = ref({
			isEnabled: false,
			hasPassword: false,
			hasBiometric: false
		});
		
		// 默认头像列表
		const defaultAvatars = [
			'/static/avatars/baby1.png',
			'/static/avatars/baby2.png',
			'/static/avatars/baby3.png',
			'/static/avatars/baby4.png',
			'/static/avatars/baby5.png',
			'/static/avatars/baby6.png',
		];

		// 加载宝宝列表
		const loadBabies = () => {
			try {
				const storedBabies = uni.getStorageSync('babies') || '[]';
				babies.value = typeof storedBabies === 'string' ? JSON.parse(storedBabies) : storedBabies;
				
				const storedBabyId = uni.getStorageSync('currentBabyId');
				currentBabyId.value = storedBabyId || '';
			} catch (e) {
				console.error('加载宝宝信息失败:', e);
				babies.value = [];
			}
		};

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

		// 返回上一页
		const goBack = () => {
			uni.navigateBack();
		};

		// 跳转到添加宝宝页面
		const navigateToAddBaby = () => {
			uni.navigateTo({
				url: '/pages/profile/add-baby'
			});
		};

		// 格式化年龄
		const formatAge = (birthdate) => {
			if (!birthdate) return '年龄未知';
			
			const birth = new Date(birthdate);
			const now = new Date();
			
			let years = now.getFullYear() - birth.getFullYear();
			let months = now.getMonth() - birth.getMonth();
			
			if (months < 0) {
				years--;
				months += 12;
			}
			
			if (years > 0) {
				return `${years}岁${months > 0 ? months + '个月' : ''}`;
			} else {
				return `${months}个月`;
			}
		};

		// 编辑宝宝名称
		const editBabyName = (baby) => {
			editingBaby.value = baby;
			editName.value = baby.name;
		};

		// 保存宝宝名称
		const saveBabyName = (baby) => {
			if (editName.value.trim()) {
				updateBaby(baby.id, { name: editName.value.trim() });
			}
			editingBaby.value = null;
		};

		// 选择头像
		const selectAvatar = (baby) => {
			selectedBaby.value = baby;
			showAvatarModal.value = true;
		};

		// 关闭头像选择弹窗
		const closeAvatarModal = () => {
			showAvatarModal.value = false;
			selectedBaby.value = null;
		};

		// 选择默认头像
		const selectDefaultAvatar = (avatar, baby) => {
			if (baby) {
				updateBaby(baby.id, { avatar: avatar });
				closeAvatarModal();
			}
		};

		// 上传自定义头像
		const uploadCustomAvatar = (type) => {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: type === 'camera' ? ['camera'] : ['album'],
				success: (res) => {
					const tempFilePath = res.tempFilePaths[0];
					// 在真实应用中，这里应该上传到服务器
					// 这里直接使用临时路径
					if (selectedBaby.value) {
						updateBaby(selectedBaby.value.id, { avatar: tempFilePath });
						closeAvatarModal();
					}
				}
			});
		};

		// 验证身份
		const verifyIdentity = () => {
			return new Promise((resolve, reject) => {
				if (!authSettings.value.isEnabled) {
					resolve(true);
					return;
				}

				// 如果开启了生物识别
				if (authSettings.value.hasBiometric) {
					uni.startSoterAuthentication({
						requestAuthModes: ['fingerPrint'],
						challenge: 'challenge',
						authContent: '请验证指纹',
						success: () => {
							resolve(true);
						},
						fail: () => {
							// 如果生物识别失败，尝试密码验证
							if (authSettings.value.hasPassword) {
								uni.showModal({
									title: '验证失败',
									content: '是否使用密码验证？',
									success: (res) => {
										if (res.confirm) {
											uni.showModal({
												title: '密码验证',
												editable: true,
												placeholderText: '请输入密码',
												success: (res) => {
													const password = uni.getStorageSync('authPassword');
													if (res.content === password) {
														resolve(true);
													} else {
														uni.showToast({
															title: '密码错误',
															icon: 'none'
														});
														reject(new Error('密码错误'));
													}
												}
											});
										} else {
											reject(new Error('验证取消'));
										}
									}
								});
							} else {
								reject(new Error('验证失败'));
							}
						}
					});
				} else if (authSettings.value.hasPassword) {
					// 如果只开启了密码验证
					uni.showModal({
						title: '密码验证',
						editable: true,
						placeholderText: '请输入密码',
						success: (res) => {
							const password = uni.getStorageSync('authPassword');
							if (res.content === password) {
								resolve(true);
							} else {
								uni.showToast({
									title: '密码错误',
									icon: 'none'
								});
								reject(new Error('密码错误'));
							}
						}
					});
				} else {
					reject(new Error('未设置验证方式'));
				}
			});
		};

		// 删除宝宝
		const deleteBaby = async (baby) => {
			try {
				await verifyIdentity();
				// 验证通过，执行删除宝宝逻辑
				// 从列表中移除
				babies.value = babies.value.filter(b => b.id !== baby.id);
				
				// 更新存储
				uni.setStorageSync('babies', JSON.stringify(babies.value));
				
				// 如果删除的是当前选中的宝宝，重置当前宝宝
				if (currentBabyId.value === baby.id) {
					currentBabyId.value = babies.value.length > 0 ? babies.value[0].id : '';
					uni.setStorageSync('currentBabyId', currentBabyId.value);
				}
				
				// 通知其他页面刷新宝宝列表
				uni.$emit('refreshBabyList');
				
				uni.showToast({
					title: '删除成功',
					icon: 'success'
				});
			} catch (error) {
				console.error('验证失败:', error);
				uni.showToast({
					title: '验证失败，无法删除宝宝',
					icon: 'none'
				});
			}
		};

		// 设置为当前宝宝
		const setAsCurrentBaby = (baby) => {
			currentBabyId.value = baby.id;
			uni.setStorageSync('currentBabyId', baby.id);
			
			// 广播宝宝切换事件
			uni.$emit('babyChanged', baby.id);
			
			uni.showToast({
				title: `已切换到"${baby.name}"`,
				icon: 'none'
			});
		};

		// 更新宝宝信息
		const updateBaby = (id, data) => {
			try {
				const index = babies.value.findIndex(b => b.id === id);
				if (index !== -1) {
					// 更新宝宝信息
					babies.value[index] = { ...babies.value[index], ...data };
					
					// 更新存储
					uni.setStorageSync('babies', JSON.stringify(babies.value));
					
					// 通知其他页面刷新宝宝列表
					uni.$emit('refreshBabyList');
				}
			} catch (e) {
				console.error('更新宝宝信息失败:', e);
				uni.showToast({
					title: '更新失败',
					icon: 'none'
				});
			}
		};

		onMounted(() => {
			isDarkMode.value = isDarkTheme();
			loadBabies();
			loadAuthSettings();
			
			// 添加宝宝列表更新事件监听
			uni.$on('refreshBabyList', loadBabies);
		});

		return {
			isDarkMode,
			babies,
			currentBabyId,
			editingBaby,
			editName,
			showAvatarModal,
			selectedBaby,
			defaultAvatars,
			goBack,
			loadBabies,
			navigateToAddBaby,
			formatAge,
			editBabyName,
			saveBabyName,
			selectAvatar,
			closeAvatarModal,
			selectDefaultAvatar,
			uploadCustomAvatar,
			deleteBaby,
			setAsCurrentBaby,
			getBabyPoints
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

.baby-list {
	padding: 20rpx;
}

.empty-state {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: 300rpx;
	gap: 30rpx;
}

.empty-text {
	color: #999;
	font-size: 28rpx;
}

.dark-mode .empty-text {
	color: #666;
}

.add-baby-btn {
	background: linear-gradient(135deg, #8B5CF6, #7C3AED);
	color: white;
	font-size: 28rpx;
	padding: 16rpx 30rpx;
	border-radius: 30rpx;
	border: none;
}

.baby-item {
	background-color: white;
	border-radius: 16rpx;
	margin-bottom: 20rpx;
	padding: 20rpx;
	display: flex;
	align-items: center;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.dark-mode .baby-item {
	background-color: #2a2a2a;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
}

.baby-avatar-container {
	position: relative;
	margin-right: 20rpx;
}

.baby-avatar {
	width: 120rpx;
	height: 120rpx;
	border-radius: 60rpx;
	border: 4rpx solid rgba(139, 92, 246, 0.2);
}

.avatar-edit-overlay {
	position: absolute;
	bottom: 0;
	right: 0;
	background-color: rgba(139, 92, 246, 0.8);
	width: 40rpx;
	height: 40rpx;
	border-radius: 20rpx;
	display: flex;
	justify-content: center;
	align-items: center;
}

.edit-icon {
	color: white;
	font-size: 20rpx;
}

.baby-info {
	flex: 1;
}

.baby-name-container {
	display: flex;
	align-items: center;
	margin-bottom: 8rpx;
}

.baby-name {
	font-size: 32rpx;
	font-weight: bold;
	margin-right: 10rpx;
}

.baby-name-input {
	font-size: 32rpx;
	font-weight: bold;
	border-bottom: 2rpx solid #8B5CF6;
	margin-right: 10rpx;
	padding: 4rpx 0;
	min-width: 120rpx;
}

.edit-name-btn {
	font-size: 24rpx;
	color: #999;
}

.baby-age {
	font-size: 24rpx;
	color: #666;
	margin-bottom: 8rpx;
}

.dark-mode .baby-age {
	color: #999;
}

.baby-points {
	font-size: 24rpx;
	color: #8B5CF6;
	font-weight: 500;
}

.baby-actions {
	display: flex;
	flex-direction: column;
	gap: 10rpx;
}

.action-btn {
	width: 60rpx;
	height: 60rpx;
	border-radius: 30rpx;
	display: flex;
	justify-content: center;
	align-items: center;
}

.primary-btn {
	background-color: rgba(139, 92, 246, 0.1);
}

.delete-btn {
	background-color: rgba(255, 77, 79, 0.1);
}

.action-icon {
	font-size: 28rpx;
}

.float-btn {
	position: fixed;
	right: 40rpx;
	bottom: 120rpx;
	width: 100rpx;
	height: 100rpx;
	background: linear-gradient(135deg, #8B5CF6, #7C3AED);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	font-size: 48rpx;
	box-shadow: 0 4rpx 16rpx rgba(139, 92, 246, 0.3);
	z-index: 100;
}

.modal-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.6);
	display: flex;
	align-items: flex-end;
	justify-content: center;
	z-index: 999;
}

.modal-content {
	width: 100%;
	background-color: white;
	border-radius: 20rpx 20rpx 0 0;
	overflow: hidden;
}

.dark-mode .modal-content {
	background-color: #2a2a2a;
}

.modal-title {
	font-size: 32rpx;
	text-align: center;
	padding: 30rpx 0;
	font-weight: bold;
	border-bottom: 1px solid #eee;
}

.dark-mode .modal-header {
	border-bottom-color: #333;
}

.modal-option {
	padding: 30rpx 0;
	font-size: 28rpx;
	text-align: center;
	border-bottom: 1px solid #eee;
}

.modal-footer {
	padding: 20rpx;
}

.modal-btn {
	width: 100%;
	height: 88rpx;
	line-height: 88rpx;
	text-align: center;
	font-size: 28rpx;
	border: none;
	background: #fff;
	border-radius: 0;
}

.cancel {
	color: #666;
}

.dark-mode .cancel {
	color: #999;
}
</style> 