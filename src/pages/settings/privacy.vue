<template>
	<view class="page-container" :class="{'dark-mode': isDarkMode}">
		<!-- 顶部导航栏 -->
		<view class="nav-bar" :class="{'dark-mode': isDarkMode}">
			<view class="nav-left" @tap="goBack">
				<text class="icon">←</text>
			</view>
			<view class="nav-title">隐私政策</view>
		</view>
		
		<!-- 内容区域 -->
		<view class="content-area" :class="{'dark-mode': isDarkMode}">
			<!-- 政策内容 -->
			<view class="policy-container">
				<view class="intro-text">
					<text>
						本隐私政策于2025年1月1日生效，请您务必仔细阅读、充分理解本政策中的条款，特别是加粗或下划线标识的条款，这些条款可能涉及您的重要权益。您点击同意或继续使用我们的服务，即表示您已同意本隐私政策的全部内容。
					</text>
				</view>
				
				<view class="section">
					<view class="section-title">引言</view>
					<view class="section-content">
						<text class="paragraph">
							育儿时光纪（以下简称"我们"）非常重视用户的隐私和个人信息保护。我们将按照本隐私政策收集、使用、存储和分享您的个人信息，并严格遵守相关法律法规的规定。本政策将帮助您了解以下内容：
						</text>
						<text class="paragraph list-item">
							1. 我们收集哪些信息以及如何收集
						</text>
						<text class="paragraph list-item">
							2. 我们如何使用收集的信息
						</text>
						<text class="paragraph list-item">
							3. 我们如何存储和保护信息
						</text>
						<text class="paragraph list-item">
							4. 我们如何分享、转让、公开披露您的个人信息
						</text>
						<text class="paragraph list-item">
							5. 您的权利
						</text>
						<text class="paragraph list-item">
							6. 未成年人保护
						</text>
						<text class="paragraph list-item">
							7. 本政策如何更新
						</text>
						<text class="paragraph list-item">
							8. 如何联系我们
						</text>
					</view>
				</view>
				
				<view class="section">
					<view class="section-title">一、我们收集哪些信息以及如何收集</view>
					<view class="section-content">
						<text class="paragraph">
							在您使用我们的服务过程中，我们会按照如下方式收集您的信息：
						</text>
						<text class="paragraph bold">
							（一）您主动提供的信息
						</text>
						<text class="paragraph">
							1. 注册信息：当您注册育儿时光纪账号时，您需要提供手机号码、电子邮箱等信息。
						</text>
						<text class="paragraph">
							2. 个人资料：您可能会向我们提供您的昵称、头像、性别、所在地区等信息。
						</text>
						<text class="paragraph">
							3. 宝宝信息：您可能会提供您孩子的基本信息，包括昵称、年龄、性别以及照片等。
						</text>
						<text class="paragraph bold">
							（二）我们在您使用服务过程中收集的信息
						</text>
						<text class="paragraph">
							1. 设备信息：我们会收集您使用我们服务的设备信息，包括设备型号、操作系统版本、设备设置、唯一设备标识符等信息。
						</text>
						<text class="paragraph">
							2. 日志信息：当您使用我们的服务时，我们的服务器会自动记录某些日志信息，例如您的搜索查询内容、IP地址、浏览器类型、电信运营商、使用语言、访问日期和时间等。
						</text>
						<text class="paragraph">
							3. 位置信息：当您使用与位置相关的服务时，我们可能会收集您的地理位置信息。您可以通过手机设置随时关闭位置权限。
						</text>
						<text class="paragraph">
							4. 任务和积分信息：我们会收集您在应用中设置和完成的任务信息，以及积分获取和使用记录。
						</text>
					</view>
				</view>
				
				<view class="section">
					<view class="section-title">二、我们如何使用收集的信息</view>
					<view class="section-content">
						<text class="paragraph">
							我们可能将收集的信息用于以下目的：
						</text>
						<text class="paragraph">
							1. 提供服务：包括创建和管理您的账号、提供任务管理、积分奖励等核心功能。
						</text>
						<text class="paragraph">
							2. 改进服务：我们会使用您的信息来了解您如何使用我们的服务，从而进行产品改进和服务优化。
						</text>
						<text class="paragraph">
							3. 安全保障：我们使用您的信息用于身份验证、安全防护、反诈骗监测、存档备份、客户服务等用途。
						</text>
						<text class="paragraph">
							4. 向您推送通知：我们可能会向您发送服务相关通知，如任务提醒、系统更新等。
						</text>
						<text class="paragraph">
							5. 为您提供个性化内容：根据您的使用习惯、兴趣爱好等，为您提供定制化的服务和内容推荐。
						</text>
						<text class="paragraph">
							6. 其他用途：在法律允许的范围内，我们可能将您的信息用于其他目的，但会事先征得您的同意。
						</text>
					</view>
				</view>
				
				<view class="section">
					<view class="section-title">三、我们如何存储和保护信息</view>
					<view class="section-content">
						<text class="paragraph">
							1. 信息存储：我们主要在中华人民共和国境内收集和存储您的个人信息。目前我们不会将您的个人信息传输至境外，如果未来需要，我们会严格依照法律规定执行。
						</text>
						<text class="paragraph">
							2. 存储期限：我们会在达成本政策所述目的所需的期限内保留您的个人信息，除非法律有强制的存留要求。
						</text>
						<text class="paragraph">
							3. 信息安全保护措施：我们已采取符合业界标准的安全防护措施，包括建立合理的制度规范、安全技术来防止您的个人信息遭到未经授权的访问、使用、修改，避免数据的损坏或丢失。
						</text>
						<text class="paragraph">
							4. 安全事件处置：如不幸发生个人信息安全事件，我们将按照法律法规的要求，及时向您告知安全事件的基本情况、可能的影响、我们已采取或将要采取的处置措施等。
						</text>
					</view>
				</view>
				
				<view class="section">
					<view class="section-title">四、我们如何分享、转让、公开披露您的个人信息</view>
					<view class="section-content">
						<text class="paragraph">
							1. 分享：我们不会与任何公司、组织和个人分享您的个人信息，除非获得您的明确同意，或在以下情况下：
						</text>
						<text class="paragraph list-sub-item">
							- 与关联公司分享：我们可能会与我们的关联公司分享您的个人信息，但只会用于本政策中所述的目的。
						</text>
						<text class="paragraph list-sub-item">
							- 与服务提供商分享：我们可能会向合作伙伴及其他第三方分享您的设备信息、日志信息以及其他去标识化或匿名化处理后的信息，用于分析我们服务的使用情况，以改进我们的产品和服务。
						</text>
						<text class="paragraph">
							2. 转让：我们不会将您的个人信息转让给任何公司、组织和个人，除非获得您的明确同意，或在涉及合并、收购、资产转让或类似的交易时。
						</text>
						<text class="paragraph">
							3. 公开披露：我们不会公开披露您的个人信息，除非获得您的明确同意，或基于法律法规的规定或强制性要求。
						</text>
					</view>
				</view>
				
				<view class="section">
					<view class="section-title">五、您的权利</view>
					<view class="section-content">
						<text class="paragraph">
							按照中国相关的法律法规，您有权利：
						</text>
						<text class="paragraph">
							1. 访问和更正您的个人信息：您可以在"个人中心"或"设置"页面查看或修改您的账号信息。
						</text>
						<text class="paragraph">
							2. 删除您的个人信息：您可以通过"设置"中的相关功能删除部分信息，或通过注销账号的方式删除您的账号信息。
						</text>
						<text class="paragraph">
							3. 改变您的授权范围：您可以通过设备的设置功能改变授权范围，如关闭定位权限等。
						</text>
						<text class="paragraph">
							4. 注销账号：您可以通过"设置-账号与安全-注销账号"完成账号注销。
						</text>
						<text class="paragraph">
							5. 获取本隐私政策的副本：您可以在应用内的"设置-关于与帮助-隐私政策"中查看本政策。
						</text>
					</view>
				</view>
				
				<view class="section">
					<view class="section-title">六、未成年人保护</view>
					<view class="section-content">
						<text class="paragraph">
							我们非常重视对未成年人个人信息的保护。如果您是未成年人的监护人，请您关注您所监护的未成年人是否是在取得您的授权同意之后使用我们的服务。如果您对您所监护的未成年人的个人信息保护有疑问，请通过本政策中的联系方式与我们联系。
						</text>
						<text class="paragraph">
							若您是未满14周岁的未成年人，请您务必在监护人的指导和帮助下阅读本政策，并在监护人经过审慎判断后，在监护人的同意和指导下使用我们的服务。
						</text>
					</view>
				</view>
				
				<view class="section">
					<view class="section-title">七、本政策如何更新</view>
					<view class="section-content">
						<text class="paragraph">
							我们可能会适时修订本隐私政策，并在修订后于本页面公布最新版本。修订后的政策一旦公布即生效，如果您继续使用我们的服务，即表示您同意受修订后的政策约束。建议您定期查看本页面，了解我们对隐私政策所做的最新变更。
						</text>
					</view>
				</view>
				
				<view class="section">
					<view class="section-title">八、如何联系我们</view>
					<view class="section-content">
						<text class="paragraph">
							如果您对本隐私政策有任何疑问、意见或建议，请通过以下方式与我们联系：
						</text>
						<text class="paragraph">
							电子邮件：privacy@futureleaders.cn
						</text>
						<text class="paragraph">
							我们将在收到您的询问后的15个工作日内回复您。
						</text>
					</view>
				</view>
				
				<view class="policy-footer">
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

/* 政策内容样式 */
.policy-container {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
}

.dark-mode .policy-container {
	background-color: #1f1f1f;
	box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.2);
}

.intro-text {
	font-size: 28rpx;
	color: #666;
	line-height: 1.8;
	margin-bottom: 40rpx;
	padding: 20rpx;
	background-color: #f8f8f8;
	border-radius: 8rpx;
	text-align: justify;
}

.dark-mode .intro-text {
	color: #aaa;
	background-color: #2a2a2a;
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

.list-item {
	padding-left: 20rpx;
}

.list-sub-item {
	padding-left: 40rpx;
}

.bold {
	font-weight: bold;
}

.policy-footer {
	margin-top: 60rpx;
	font-size: 24rpx;
	color: #999;
	text-align: center;
}

.dark-mode .policy-footer {
	color: #777;
}
</style> 