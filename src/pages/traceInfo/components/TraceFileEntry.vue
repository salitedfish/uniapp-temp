<script lang="ts" setup>
	import {
		ref,
		computed
	} from "vue"
	import {
		globalColor
	} from "@/store/theme"
	import {
		genFileUrl
	} from "@/util/common"
	// 附件按扩展名分三类与三种打开方式的口径收在 useFilePreview, 与「附件」入口共用一份
	import {
		kindOf,
		hintOf,
		openFile
	} from "./useFilePreview"

	// 报工页「文档」入口: 数据由页面按 (工序+产品) 调 ldTraceFiles/listByLineDetail 取,
	// 这里只负责渲染 + 按文件类型决定展示方式(见 kindOf)
	const props = defineProps < {
		files: Objs
	} > ()

	const visible = ref(false)

	// 弹出栏宽度与「检验单」一致: 宽屏(PC 浏览器)按视口 70% 且不超过 720px, 窄屏(手机)占 85%
	const drawerStyle = (() => {
		const w = uni.getSystemInfoSync().windowWidth || 375
		return {
			width: (w >= 768 ? Math.min(720, Math.round(w * 0.7)) : Math.round(w * 0.85)) + "px",
			height: "100%"
		}
	})()

	// fileUrls / fileNames 都是英文逗号分隔的平行串, 按位置一一对应; 一条记录可带多个文件。
	// 库里存的是相对路径, 这里拼成当前环境可直接访问的地址(展示与打开都用它)。
	const fileList = computed(() => {
		const out : Objs = []
		for (const row of props.files || []) {
			const urls = (row.fileUrls || "").split(",")
			const names = (row.fileNames || "").split(",")
			urls.forEach((url : string, i : number) => {
				if (!url) return
				out.push({
					key: row.filesId + "_" + i,
					url: genFileUrl(url),
					name: names[i] || url.split("/").pop() || "未命名文档",
					typeName: row.fileTypeName || "",
					kind: kindOf(url)
				})
			})
		}
		return out
	})
</script>

<template>
	<view>
		<!-- 文档: 主页面只留一行入口, 文件清单收在右侧弹出栏里 -->
		<up-form class="common-form common-form-next" labelPosition="left" v-if="fileList.length">
			<up-form-item class="common-form-item" label="文档:" borderBottom labelWidth="80" style="padding: 0">
				<view class="file-entry" @click="visible = true">
					<text class="file-entry__sum">共 {{ fileList.length }} 个</text>
					<view class="file-entry__btn">
						<text class="file-entry__btn-text">查看</text>
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
							<text class="file-drawer__title">文档</text>
							<text class="file-drawer__sub">共 {{ fileList.length }} 个</text>
						</view>
						<view class="file-drawer__close" @click="visible = false">
							<uni-icons type="closeempty" color="#ffffff" size="18"></uni-icons>
						</view>
					</view>
				</view>
				<scroll-view class="file-drawer__body" scroll-y>
					<view class="file-drawer__list">
						<view class="file-item" v-for="item in fileList" :key="item.key" @click="openFile(item)">
							<view class="file-item__thumb">
								<up-image v-if="item.kind === 'image'" :src="item.url" width="56px" height="56px" radius="6px"
									:show-loading="true"></up-image>
								<view v-else class="file-item__icon">
									<uni-icons custom-prefix="custom-icon" type="icon-file" :color="globalColor.primary"
										size="24"></uni-icons>
								</view>
							</view>
							<view class="file-item__main">
								<text class="file-item__name">{{ item.name }}</text>
								<view class="file-item__meta">
									<text class="file-item__tag" v-if="item.typeName">{{ item.typeName }}</text>
									<text class="file-item__hint">{{ hintOf(item.kind) }}</text>
								</view>
							</view>
						</view>
						<view class="file-drawer__tip">图片点击可放大预览；PDF 与其余格式点开后由浏览器/系统处理（能预览就预览，否则下载）</view>
					</view>
				</scroll-view>
			</view>
		</up-popup>
	</view>
</template>

<style scoped lang="scss">
	// 入口行与弹出栏的尺寸/配色逐条对齐报工页的「检验单」(.check-entry / .check-drawer),
	// 两处并排出现时不会一个宽一个窄、一个深一个浅
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

		&__tag {
			padding: 1px 6px;
			border-radius: 4px;
			background-color: rgba(84, 157, 248, 0.1);
			font-size: 11px;
			color: v-bind("globalColor.primary");
		}

		&__hint {
			margin-left: 8px;
			font-size: 12px;
			color: #909399;
		}
	}
</style>
