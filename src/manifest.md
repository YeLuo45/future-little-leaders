 # manifest.json 配置说明

## 基础配置
- `name`: 应用名称
- `appid`: 应用标识
- `description`: 应用描述
- `versionName`: 应用版本名称
- `versionCode`: 应用版本号
- `transformPx`: 是否转换px单位

## App配置
- `app-plus`: 5+App特有相关配置
  - `usingComponents`: 是否使用自定义组件
  - `nvueStyleCompiler`: nvue样式编译器
  - `compilerVersion`: 编译器版本
  - `splashscreen`: 启动屏幕配置
    - `alwaysShowBeforeRender`: 是否等待首页渲染完毕后再关闭启动屏幕
    - `waiting`: 是否在程序启动界面显示等待雪花
    - `autoclose`: 是否自动关闭启动屏幕
    - `delay`: 启动屏幕延迟关闭时间

## 小程序配置
- `mp-weixin`: 微信小程序配置
  - `appid`: 微信小程序appid
  - `setting.urlCheck`: 是否检查安全域名
  - `usingComponents`: 是否使用自定义组件
- `mp-alipay`: 支付宝小程序配置
- `mp-baidu`: 百度小程序配置
- `mp-toutiao`: 字节跳动小程序配置

## 其他配置
- `uniStatistics`: 是否开启统计
- `vueVersion`: Vue版本