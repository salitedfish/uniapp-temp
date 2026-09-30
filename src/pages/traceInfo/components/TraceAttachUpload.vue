<script lang="ts" setup>
	import {
		ref,
		computed
	} from "vue"
	import {
		globalColor
	} from "@/store/theme"
	import {
		getBaseUrl,
		genFileUrl
	} from "@/util/common"
	import {
		extOf,
		kindOf,
		hintOf,
		openFile
	} from "./useFilePreview"
	import type { UploadMedia } from "@/type/file"

	// 报工页「附件」入口: 工序开了「是否上传附件」(ld_line_detail.upload_file=1) 才由页面渲染本组件。
	//
	// 约定:
	//   - 附件**选传** —— 不选也能提交(开关只控制入口显不显示, 不做必传校验); 但一旦选了, 必须等它传完再提交
	//   - 上传成功把**后端映射的相对路径**(uploadFiles/file/fujian/202609/xxx.png)放进 item.url, 提交时页面
	//     直接拼进 file_url 落库(templateP014/P015 的 params.fileUrl); 展示与预览一律过 genFileUrl 拼当前环境 base
	//   - item.name 存**原始文件名**, 提交时进 file_name 列(磁盘名是另一套生成的纯 ASCII 名, 见 genDiskName)
	//   - 能选什么: H5 任意文件(uni.chooseFile), App 只能选图片(uni.chooseImage) —— 用户 2026-09-30 拍板
	const props = defineProps < {
		modelValue: UploadMedia[]
	} > ()

	const visible = ref(false)

	// 弹出栏宽度与「检验单」「文档」一致: 宽屏(PC 浏览器)按视口 70% 且不超过 720px, 窄屏(手机)占 85%
	const drawerStyle = (() => {
		const w = uni.getSystemInfoSync().windowWidth || 375
		return {
			width: (w >= 768 ? Math.min(720, Math.round(w * 0.7)) : Math.round(w * 0.85)) + "px",
			height: "100%"
		}
	})()

	// 一次最多选几个附件
	const MAX_COUNT = 9

	const uploadingCount = computed(() => props.modelValue.filter((i : UploadMedia) => i.status == "uploading").length)
	const failedCount = computed(() => props.modelValue.filter((i : UploadMedia) => i.status == "fail").length)
	const sumText = computed(() => {
		const total = props.modelValue.length
		if (!total) return "未添加"
		const bad = uploadingCount.value + failedCount.value
		return bad ? `共 ${total} 个（${bad} 个未完成）` : `共 ${total} 个`
	})

	// 提示文案按端区分(条件编译)
	const tipText = (() => {
		// #ifdef H5
		return "支持图片、PDF 等任意文件；图片点击可放大预览，其余格式点开后由浏览器处理。附件选传，不需要可直接提交"
		// #endif
		// #ifdef APP-PLUS
		return "支持上传图片；点击可放大预览。附件选传，不需要可直接提交"
		// #endif
	})()

	// 列表里的 url 在不同阶段含义不同: 上传中/失败时是本地临时路径(直接就能显示), 成功后是相对路径(要拼 base)
	const displayUrl = (item : UploadMedia) => item.status == "success" ? genFileUrl(item.url || "") : (item.url || "")

	// 类型判定优先看 url 的扩展名; url 没带扩展名时退回展示名 ——
	// 磁盘名的扩展名由后端按上传时的原始文件名追加, 个别端上传时原始文件名为空就会丢扩展名,
	// 那时若只看 url, 图片会被判成"其余格式"、点开变成下载
	const kindOfItem = (item : UploadMedia) => extOf(item.url || "") ? kindOf(item.url || "") : kindOf(item.name || "")

	const isImage = (item : UploadMedia) => kindOfItem(item) == "image"

	const statusText = (item : UploadMedia) => {
		if (item.status == "uploading") return "上传中…"
		if (item.status == "fail") return "上传失败，点击重试"
		return hintOf(kindOfItem(item))
	}

	// 磁盘名用「时间戳 + 随机数」的纯 ASCII 名, 避免中文名/重名进 URL; 扩展名由后端按原始文件名追加。
	// 与 web Upload.vue 用 guid() 是同一套约定 —— 磁盘名 ≠ 展示名
	const genDiskName = () => Number(new Date()).toString() + Math.floor(Math.random() * 1000).toString().padStart(3, "0")

	const removeOne = (index : number) => {
		props.modelValue.splice(index, 1)
	}

	const addOne = (path : string, name : string, size ?: number) => {
		if (!path) return
		if (props.modelValue.length >= MAX_COUNT) {
			uni.showToast({
				icon: "none",
				title: `最多上传 ${MAX_COUNT} 个附件`
			})
			return
		}
		props.modelValue.push({
			url: path,
			name: name || path.split("/").pop() || "未命名附件",
			size,
			status: "uploading",
			message: "上传中"
		})
		doUpload(props.modelValue.length - 1)
	}

	// 选择文件: 按端分流(条件编译)。H5 走 chooseFile(任意类型), App 走 chooseImage(只出图片)
	const chooseFiles = () => {
		// #ifdef H5
		uni.chooseFile({
			count: MAX_COUNT,
			success: (res) => {
				const paths = ([] as string[]).concat(res.tempFilePaths || [])
				const files = ((res.tempFiles || []) as unknown) as Objs
				files.forEach((f : Obj, i : number) => addOne(f.path || paths[i], f.name || "", f.size))
			}
		})
		// #endif
		// #ifdef APP-PLUS
		uni.chooseImage({
			count: MAX_COUNT,
			success: (res) => {
				const paths = ([] as string[]).concat(res.tempFilePaths || [])
				const files = ((res.tempFiles || []) as unknown) as Objs
				paths.forEach((path : string, i : number) => {
					const f : Obj = files[i] || {}
					// App 端拿不到原始文件名, 按扩展名生成一个可读的展示名
					addOne(path, `图片_${Number(new Date())}_${i + 1}.${extOf(path) || "jpg"}`, f.size)
				})
			}
		})
		// #endif
	}

	const openItem = (item : UploadMedia, index : number) => {
		if (item.status == "fail") {
			doUpload(index)
			return
		}
		if (item.status != "success") return
		openFile({
			kind: kindOfItem(item),
			url: displayUrl(item)
		})
	}

	const doUpload = async (index : number) => {
		const item : UploadMedia | undefined = props.modelValue[index]
		if (!item || !item.url) return
		// 上传中/失败时 url 是本地上传源, 先留住它 —— 失败后点一下就能用同一个文件重传
		const localPath = item.url
		try {
			item.status = "uploading"
			item.message = "上传中"
			const res = await uploadFilePromise(localPath, genDiskName())
			const data = res ? JSON.parse(res).data : ""
			if (data) {
				// 只存后端返回的相对路径(不拼 base、不带 token2), 落库与展示分别由 genFilePath / genFileUrl 负责
				item.url = data
				item.status = "success"
				item.message = ""
			} else {
				item.url = localPath
				item.status = "fail"
				item.message = "上传失败，点击重试"
			}
		} catch (e) {
			console.error(e)
			item.url = localPath
			item.status = "fail"
			item.message = "上传失败，点击重试"
		}
	}

	const uploadFilePromise = (filePath : string, fileName : string) : Promise < string > => {
		return new Promise((resolve) => {
			uni.uploadFile({
				url: getBaseUrl() + "upload/fileUpload",
				filePath,
				name: "file",
				formData: {
					// 磁盘名(纯 ASCII 唯一名); 原始文件名不进这里, 只留在 item.name 里进 file_name 列
					fileName,
					// 报工附件单独放 fujian 目录, 与检验单图片等上传物分开
					folder: "fujian"
				},
				header: {
					token: uni.getStorageSync("token")
				},
				success: (res) => {
					if (res.statusCode === 200) {
						resolve(res.data)
					} else {
						uni.showToast({
							title: "上传失败",
							icon: "none"
						})
						resolve("")
					}
				},
				fail: () => {
					uni.showToast({
						title: "上传失败",
						icon: "none"
					})
					resolve("")
				}
			})
		})
	}
</script>

<template>
	<view>
		<!-- 附件: 主页面只留一行入口, 已选清单收在右侧弹出栏里(入口样式与「检验单」「文档」一致) -->
		<up-form class="common-form common-form-next" labelPosition="left">
			<up-form-item class="common-form-item" label="附件:" borderBottom labelWidth="80" style="padding: 0">
				<view class="file-entry" @click="visible = true">
					<text class="file-entry__sum">{{ sumText }}</text>
					<view class="file-entry__btn">
						<text class="file-entry__btn-text">上传</text>
						<uni-icons type="right" :color="globalColor.primary" size="12"></uni-icons>
					</view>
				</view>
			</up-form-item>
		</up-form>

		<up-popup :show="visible" mode="right" :customStyle="drawerStyle" @close="visible = false">
			<view class="file-drawer">
				<view class="file-drawer__head">
					<view class="file-drawer__bar">
						<view class="file-drawer__bar-text">
							<text class="file-drawer__title">附件</text>
							<text class="file-drawer__sub">{{ sumText }}</text>
						</view>
						<view class="file-drawer__close" @click="visible = false">
							<uni-icons type="closeempty" color="#ffffff" size="18"></uni-icons>
						</view>
					</view>
				</view>
				<scroll-view class="file-drawer__body" scroll-y>
					<view class="file-drawer__list">
						<view class="file-item" v-for="item, index in modelValue" :key="index">
							<view class="file-item__thumb" @click="openItem(item, index)">
								<up-image v-if="isImage(item)" :src="displayUrl(item)" width="56px" height="56px" radius="6px"
									:show-loading="true"></up-image>
								<view v-else class="file-item__icon">
									<uni-icons custom-prefix="custom-icon" type="icon-file" :color="globalColor.primary"
										size="24"></uni-icons>
								</view>
							</view>
							<view class="file-item__main" @click="openItem(item, index)">
								<text class="file-item__name">{{ item.name }}</text>
								<view class="file-item__meta">
									<text class="file-item__hint">{{ statusText(item) }}</text>
								</view>
							</view>
							<view class="file-item__del" @click.stop="removeOne(index)">
								<uni-icons custom-prefix="custom-icon" type="icon-shanchu" :color="globalColor.fail"
									size="18"></uni-icons>
							</view>
						</view>
						<view class="file-add" @click="chooseFiles">
							<uni-icons type="plusempty" :color="globalColor.primary" size="16"></uni-icons>
							<text class="file-add__text">添加附件</text>
						</view>
						<view class="file-drawer__tip">{{ tipText }}</view>
					</view>
				</scroll-view>
			</view>
		</up-popup>
	</view>
</template>

<style scoped lang="scss">
	// 入口行与弹出栏的尺寸/配色逐条对齐报工页的「检验单」(.check-entry / .check-drawer)与「文档」(.file-entry),
	// 三处并排出现时不会一个宽一个窄、一个深一个浅
	.file-entry {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		font-size: 14px;

		&__sum {
			color: #606266;
		}

		&__btn {
			display: flex;
			align-items: center;
			padding: 2px 10px;
			border-radius: 20px;
			background-color: rgba(84, 157, 248, 0.1);
		}

		&__btn-text {
			margin-right: 2px;
			font-size: 13px;
			color: v-bind("globalColor.primary");
		}
	}

	.file-drawer {
		display: flex;
		flex-direction: column;
		height: 100%;

		&__head {
			padding: 14px 15px 12px;
			background-color: v-bind("globalColor.primary");
		}

		&__bar {
			display: flex;
			align-items: center;
			justify-content: space-between;
		}

		&__bar-text {
			display: flex;
			flex-direction: column;
			min-width: 0;
		}

		&__title {
			font-size: 16px;
			font-weight: bold;
			color: #ffffff;
		}

		&__sub {
			margin-top: 4px;
			font-size: 12px;
			color: rgba(255, 255, 255, 0.85);
		}

		&__close {
			display: flex;
			flex-shrink: 0;
			align-items: center;
			justify-content: center;
			width: 28px;
			height: 28px;
			border-radius: 50%;
			background-color: rgba(255, 255, 255, 0.22);
		}

		&__body {
			flex: 1;
			min-height: 0;
			background-color: #f5f6f8;
		}

		&__list {
			padding: 10px 10px 20px;
		}

		&__tip {
			padding: 6px 2px 0;
			font-size: 12px;
			color: #909399;
			text-align: center;
		}
	}

	.file-item {
		display: flex;
		align-items: center;
		margin-bottom: 8px;
		padding: 10px;
		border-radius: 8px;
		background-color: #ffffff;

		&__thumb {
			flex-shrink: 0;
		}

		&__icon {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 56px;
			height: 56px;
			border-radius: 6px;
			background-color: rgba(84, 157, 248, 0.1);
		}

		&__main {
			flex: 1;
			min-width: 0;
			margin-left: 10px;
		}

		&__name {
			font-size: 14px;
			line-height: 20px;
			color: #303133;
			word-break: break-all;
		}

		&__meta {
			display: flex;
			align-items: center;
			margin-top: 4px;
		}

		&__hint {
			font-size: 12px;
			color: #909399;
		}

		&__del {
			display: flex;
			flex-shrink: 0;
			align-items: center;
			justify-content: center;
			width: 32px;
			height: 32px;
			margin-left: 6px;
		}
	}

	.file-add {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 8px;
		padding: 10px;
		border-radius: 8px;
		border: 1px dashed v-bind("globalColor.primary");
		background-color: rgba(84, 157, 248, 0.06);

		&__text {
			margin-left: 4px;
			font-size: 14px;
			color: v-bind("globalColor.primary");
		}
	}
</style>
