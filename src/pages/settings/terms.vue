<template>
	<view class="page-container" :class="{'dark-mode': isDarkMode}">
		<!-- 顶部导航栏 -->
		<view class="nav-bar" :class="{'dark-mode': isDarkMode}">
			<view class="nav-left" @tap="goBack">
				<text class="icon">←</text>
			</view>
			<view class="nav-title">用户协议</view>
		</view>
		
		<!-- 内容区域 -->
		<view class="content-area" :class="{'dark-mode': isDarkMode}">
			<!-- 协议内容 -->
			<view class="agreement-container">
				<view class="section">
					<view class="section-title">总则</view>
					<view class="section-content">
						<text class="paragraph">
							欢迎您使用"育儿时光纪"应用！在使用本应用前，请您务必仔细阅读并理解本协议中规定的所有权利和限制。除非您接受本协议所有条款，否则您无权下载、安装或使用本应用及相关服务。您的下载、安装、使用、登录等行为将视为对本协议的接受，并同意接受本协议各项条款的约束。
						</text>
						<text class="paragraph">
							本协议是您与"育儿时光纪"应用（以下简称"本应用"）之间关于您使用本应用所提供的产品和服务的法律协议。
						</text>
					</view>
				</view>
				
				<view class="section">
					<view class="section-title">账号注册与使用</view>
					<view class="section-content">
						<text class="paragraph">
							1. 您在注册账号时，应当提供真实、准确、完整的信息，并保证这些信息的真实性和有效性。
						</text>
						<text class="paragraph">
							2. 您应妥善保管账号及密码信息，因账号或密码保管不当造成的损失由您自行承担。
						</text>
						<text class="paragraph">
							3. 您在使用本应用过程中上传的内容，应当遵守国家法律法规，不得含有违法、侮辱、诽谤、淫秽或违背社会公德的内容。
						</text>
						<text class="paragraph">
							4. 未经本应用同意，您不得将账号以任何方式转让或授权他人使用。
						</text>
					</view>
				</view>
				
				<view class="section">
					<view class="section-title">用户信息保护</view>
					<view class="section-content">
						<text class="paragraph">
							1. 保护用户隐私是本应用的基本政策，本应用将按照相关法律法规及《隐私政策》的规定收集、使用、储存、分享和保护您的个人信息。
						</text>
						<text class="paragraph">
							2. 您在注册账号或使用本应用的过程中，可能需要提供一些必要的个人信息。本应用将按照相关法律法规要求对您的个人信息进行保护，未经您的同意，本应用不会向第三方披露您的个人信息。
						</text>
						<text class="paragraph">
							3. 您同意，本应用有权在以下情况下，依据相关法律法规的要求，披露或共享您的个人信息：
							- 经您同意；
							- 为提供您所要求的服务所必需；
							- 依据法律法规或政府相关政策的要求；
							- 保护本应用及其关联公司或合作伙伴、您或其他用户的合法权益。
						</text>
					</view>
				</view>
				
				<view class="section">
					<view class="section-title">知识产权</view>
					<view class="section-content">
						<text class="paragraph">
							1. 本应用的所有内容，包括但不限于文字、图片、音频、视频、软件、程序、代码等，均由本应用或其关联方、合作伙伴依法拥有其知识产权，包括但不限于著作权、商标权、专利权等。
						</text>
						<text class="paragraph">
							2. 未经本应用或相关权利人的书面许可，您不得以任何方式擅自使用、修改、复制、传播、发行、公开发表本应用的程序或内容。
						</text>
						<text class="paragraph">
							3. 您在使用本应用时上传的内容，您保证对该等内容享有合法权利。您同意授予本应用非独家的、不可撤销的、免费的、全球范围内的许可使用权，本应用有权在全球范围内使用、复制、修改、改编、出版、翻译、创造衍生作品、分发、表演和展示此等内容。
						</text>
					</view>
				</view>
				
				<view class="section">
					<view class="section-title">免责声明</view>
					<view class="section-content">
						<text class="paragraph">
							1. 您理解并同意，本应用不能保证其提供的服务一定能满足您的要求，也不能保证服务不会中断，服务的及时性、安全性、准确性也都不作保证。
						</text>
						<text class="paragraph">
							2. 对于因通讯线路故障、网络设备故障、计算机系统故障、系统不稳定、不可抗力以及其他不能控制的原因而造成的服务中断或其他缺陷，本应用不承担任何责任。
						</text>
						<text class="paragraph">
							3. 您理解并同意，本应用有权基于业务调整、法律法规要求等原因暂停或终止全部或部分服务，本应用将尽可能通过适当方式提前通知您，并尽可能为您提供相应的解决方案，但对此不作强制承诺。
						</text>
					</view>
				</view>
				
				<view class="section">
					<view class="section-title">协议修改</view>
					<view class="section-content">
						<text class="paragraph">
							本应用有权随时根据有关法律、法规的变化以及公司经营的需要对本协议的条款进行修改。修改后的协议会在本应用上公布，在满足法定公示要求的情况下立即生效。如您继续使用本应用提供的服务，则视为您接受修改后的协议。
						</text>
					</view>
				</view>
				
				<view class="section">
					<view class="section-title">法律适用与争议解决</view>
					<view class="section-content">
						<text class="paragraph">
							1. 本协议的订立、执行和解释及争议的解决均应适用中华人民共和国法律。
						</text>
						<text class="paragraph">
							2. 如您与本应用之间发生任何纠纷或争议，首先应友好协商解决；协商不成的，您同意将争议提交至本应用所在地有管辖权的人民法院管辖。
						</text>
					</view>
				</view>
				
				<view class="section">
					<view class="section-title">其他条款</view>
					<view class="section-content">
						<text class="paragraph">
							1. 本协议中的标题仅为方便阅读而设，不应影响对本协议任何规定的解释。
						</text>
						<text class="paragraph">
							2. 本协议的任何条款无论因何种原因无效或不具可执行性，其余条款仍应有效并具有约束力。
						</text>
						<text class="paragraph">
							3. 本协议构成您与本应用之间就您使用本应用所提供的产品和服务达成的完整协议，并取代您与本应用先前就相同事项达成的任何口头或书面协议。
						</text>
					</view>
				</view>
				
				<view class="agreement-footer">
					<text>如您对本协议有任何疑问，可通过本应用"关于我们"中的联系方式与我们联系。</text>
					<text>最近更新日期：2023年12月1日</text>
				</view>
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
	padding: 60rpx 40rpx 60rpx 40rpx;
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

/* 协议内容样式 */
.agreement-container {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
}

.dark-mode .agreement-container {
	background-color: #1f1f1f;
	box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.2);
}

.section {
	margin-bottom: 40rpx;
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
	line-height: 1.8;
}

.dark-mode .section-content {
	color: #aaa;
}

.paragraph {
	display: block;
	margin-bottom: 20rpx;
	text-align: justify;
}

.agreement-footer {
	margin-top: 60rpx;
	font-size: 24rpx;
	color: #999;
	display: flex;
	flex-direction: column;
	gap: 10rpx;
	align-items: center;
}

.dark-mode .agreement-footer {
	color: #777;
}
</style> 