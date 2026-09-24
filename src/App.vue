<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app"
import { savePrintPage } from "@/store/print"
import { updateAllDate } from "@/store/common"
import { Platform } from "@/util/env"
import { initInDD } from "@/util/initInDD"
import { initInWX } from "@/util/initInWX"
import { initWeb } from "@/util/initWeb"
import { initApp } from "@/util/initApp"
import { routes } from "@/store/route"

onLaunch(async () => {
  console.log("App Launch")
  // uni.navigateTo({
  // 	url: `${routes.board.path}?deviceId=${Platform.deviceId}`
  // })
  // return

  // 大屏且是app端则进入看板页面
  if (Platform.isBigScreen() && Platform.isApp()) {
    uni.navigateTo({
      url: `${routes.board.path}?deviceId=${Platform.deviceId}`,
    })
  }
  // 小屏则正常初始化
  else {
    // 钉钉内嵌H5要先初始化钉钉信息，才能初始化页面，否则页面判断会异常
    if (Platform.isInDD()) {
      initInDD()
    }
    // 如果是微信内嵌H5
    else if (Platform.isInWx()) {
      initInWX()
    }
    // 如果是H5
    else if (Platform.isWeb()) {
      initWeb()
    }
    // 如果是app
    else if (Platform.isApp()) {
      initApp()
    }
  }
})
onShow(() => {
  console.log("App Show")
  updateAllDate()
})
onHide(() => {
  console.log("App Hide")
  // 保存要缓存的数据
  savePrintPage()
})
</script>

<style lang="scss">
@import "uview-plus/index.scss";
@import "@/static/iconfont.css";

* {
  box-sizing: border-box;
}

uni-modal {
  z-index: 999999 !important;
}

/* #ifdef H5 */
/**
 * H5 输入框主题色：边框与输入文字统一成主题蓝，边框外一圈细光晕呼吸。
 *
 * 色值取 #549df8 —— store/theme.ts 里 globalColor.primary，页面里的查询图标用的就是它；
 * 别换成 uview-plus 的 $u-primary（#3c9cff），这两个不是同一个蓝。
 *
 * 呼吸效果落在 box-shadow 上，动不了边框色本身：
 * common.scss 里 `.u-border { border-color: $u-border-color !important }` 把边框色锁死了，
 * 而 !important 声明的优先级高于 @keyframes，动画写在 border-color 上也压不过它，只会是死蓝。
 *
 * 只处理 border="surround" / "bottom" 这类本来就有边框的输入框；
 * border="none" 的（多为「自动带出」这类只读项）不凭空加框，只跟着改文字色。
 * placeholder 保持灰色 —— 占位文本也变蓝就分不出「已填」和「未填」了。
 */
.u-input:is(.u-border, .u-border-bottom),
.u-textarea:is(.u-border, .u-border-bottom) {
	border-color: #549df8 !important;
}

/**
 * 光晕只在空值（placeholder 还露着）时呼吸，填了内容就安静下来。
 *
 * 判空不能靠 `:placeholder-shown`：uni-app 的 H5 没给原生 input 挂 placeholder 属性，
 * 占位文字是它自己另画的一个 div，那个伪类永远匹配不上。
 * 这个 div 的显隐走内联 style（空值 "color: ...;"，有值 "color: ...; display: none;"），
 * 所以用 :has() 反向选中「内部占位元素还没被 display:none 藏起来」的输入框。
 * 两种 display 写法都排掉，免得 uni 哪天把空格去掉就误判。
 * 占位元素认 class 含 placeholder 的（uview-plus 的 placeholderClass 默认值就是 input-placeholder，
 * 全项目没人改过），配合 :has() 天然限定在本输入框子树内，不会串到隔壁。
 *
 * 老浏览器不认 :has() 会整条跳过，降级成「没有光晕」，不会变成一直闪。
 */
:is(.u-input, .u-textarea):is(.u-border, .u-border-bottom):has([class*="placeholder"]:not([style*="display: none"]):not([style*="display:none"])) {
	animation: input-border-breathe 2.4s ease-in-out infinite;
}

// 光晕压到 2px，再宽就糊成一团、抢输入框本身的边
@keyframes input-border-breathe {
	0%,
	100% {
		box-shadow: 0 0 0 0 rgba(84, 157, 248, 0.08);
	}
	50% {
		box-shadow: 0 0 0 2px rgba(84, 157, 248, 0.3);
	}
}

// 输入值色；placeholder 是原生 input 的占位元素（内联 #c0c4cc），不受这条影响
.u-input .u-input__content__field-wrapper__field,
.u-textarea .u-textarea__field {
	color: #549df8 !important;
}
/* #endif */
</style>
