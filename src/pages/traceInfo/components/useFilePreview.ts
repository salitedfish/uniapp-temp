// 报工页附件的公共预览逻辑(「文档」与「附件」两个入口共用一份, 避免各写各的 kindOf 导致同一文件两处展示方式不一样):
//   - 按扩展名分三类(图片 / pdf / 其余), 决定展示方式与提示文案
//   - 图片走 uni 的原生全屏预览, 其余 H5 交浏览器、App 下载后用系统组件打开
// 入参一律是「已拼好 base 的绝对地址」—— 库里存的是相对路径, 调用方先过 util/common 的 genFileUrl

// 图片与 PDF 都能直接打开看; word/excel/zip 这类浏览器没有内置查看器, 点开就是下载
export const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "bmp", "webp"]

// 取扩展名要先把 ?query 与 #hash 剥掉再找最后一个 ".", 带查询串的 url 直接 split(".") 会取错
export const extOf = (url : string) => {
	const clean = (url || "").split("?")[0].split("#")[0]
	const i = clean.lastIndexOf(".")
	return i < 0 ? "" : clean.slice(i + 1).toLowerCase()
}

export const kindOf = (url : string) => {
	const ext = extOf(url)
	if (IMAGE_EXTS.indexOf(ext) > -1) return "image"
	if (ext == "pdf") return "pdf"
	return "file"
}

export const hintOf = (kind : string) => kind == "image" ? "点击预览" : kind == "pdf" ? "点击查看" : "点击下载"

// 图片: 走 uni 的原生预览(全屏可缩放), H5 与 App 都支持
export const previewImage = (url : string) => {
	uni.previewImage({
		indicator: "number",
		loop: false,
		urls: [url],
		current: url
	})
}

// PDF 与其余格式: 没有跨端统一的查看器 —— H5 交给浏览器(能内联渲染 PDF 就渲染, 其余触发下载);
// App 先下到临时目录再用系统组件打开(openDocument 对 pdf/office 本身就是预览)
export const openRemoteFile = (url : string) => {
	// #ifdef H5
	window.open(url, "_blank")
	// #endif
	// #ifdef APP
	uni.showLoading({
		mask: true,
		title: "打开中"
	})
	uni.downloadFile({
		url,
		success: (res) => {
			if (res.statusCode !== 200) {
				uni.showToast({
					icon: "none",
					title: "下载失败"
				})
				return
			}
			uni.openDocument({
				filePath: res.tempFilePath,
				showMenu: true,
				fail: () => uni.showToast({
					icon: "none",
					title: "该格式无法打开"
				})
			})
		},
		fail: () => uni.showToast({
			icon: "none",
			title: "下载失败"
		}),
		complete: () => uni.hideLoading()
	})
	// #endif
}

// 按类型分派: 图片预览, 其余走 openRemoteFile
export const openFile = (item : Obj) => {
	if (item.kind == "image") {
		previewImage(item.url)
		return
	}
	openRemoteFile(item.url)
}
