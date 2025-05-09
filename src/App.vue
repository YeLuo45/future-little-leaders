<script>
export default {
  // 当应用初始化完成时触发（全局只触发一次）
  onLaunch: function () {
    console.log('App Launch')
  },
  // 当应用启动，或从后台进入前台显示时触发
  onShow: function () {
    console.log('App Show')
  },
  // 当应用从前台进入后台时触发
  onHide: function () {
    console.log('App Hide')
  },
}
</script>

<style>
	/* 导入公共样式 */
	@import './common/styles/common.css';
	
	/* 全局样式，所有页面都会应用这些样式 */
	@import './static/iconfont.css';

	page {
		height: 100%;
		width: 100%;
		box-sizing: border-box;
		font-family: "PingFang SC", "Helvetica Neue", Arial, sans-serif;
	}

	/* 通用样式 */
	.flex-row {
		display: flex;
		flex-direction: row;
	}

	.flex-column {
		display: flex;
		flex-direction: column;
	}

	.flex-center {
		justify-content: center;
		align-items: center;
	}

	.text-center {
		text-align: center;
	}
</style>
