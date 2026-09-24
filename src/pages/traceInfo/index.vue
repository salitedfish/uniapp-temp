<template>
	<view class="common-page-container report-page">
		<CustomNavBar :title="procedureName"></CustomNavBar>

		<templateP014
			v-if="templateType === P.条码自配"
			:lineDetailData="lineDetailData" :lineDetailId="lineDetailId" :procedureName="procedureName" :planCode="planCode" :noPlan="noPlan"
		/>
		<templateP015
			v-else-if="templateType === P.打包"
			:lineDetailData="lineDetailData" :lineDetailId="lineDetailId" :procedureName="procedureName" :planCode="planCode" :noPlan="noPlan"
		/>

	</view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue"
import { getLineDetail } from "@/api/trace"
import { P, PK } from "./enum"
import templateP014 from "./templateP014.vue"
import templateP015 from "./templateP015.vue"

const props = defineProps<{
	lineDetailId?: string
	procedureName?: string
	planCode?: string
	// 追溯入口跳转时带 noPlan=1: 报工页不展示计划相关信息与逻辑(页面 query 参数均为字符串)
	noPlan?: string
}>()

const templateType = ref<PK | P | null>(null)
const lineDetailData = ref<Obj>({})

onMounted(async () => {
	if (!props.lineDetailId) return
	try {
		uni.showLoading({
			mask: true,
			title: "产线详情获取中",
		})
		const res = await getLineDetail({
			lineDetailId: props.lineDetailId,
		})
		const data = res.data
		lineDetailData.value = data
		const pk = data.procedureKindCode
		const pc = data.procedureCode
		if (pk === PK.定制流程) {
			const map: Record<string, P> = {
				DZ014: P.条码自配,
				DZ015: P.打包,
			}
			templateType.value = map[pc] || null
		}
	} catch (err) {
		console.log(err)
	} finally {
		uni.hideLoading()
	}
})
</script>

<style lang="scss">
	/* #ifdef H5 */
	/**
	 * 报工页 PC（宽屏浏览器）兼容
	 *
	 * 这套模板是按 750rpx 手机竖屏设计的，PC 浏览器里容器被拉满后会整体走形：
	 * 表单项一行一个、按钮铺满整屏、表格列被均分撑开、步骤条三个点散到屏幕两端。
	 * 这里只对宽屏做局部重排，不动页面结构。
	 *
	 * .report-page 只挂在报工壳页的根节点上（P014/P015 都是它的子组件），规则不会漏到其它页面；
	 * 手机端宽度够不着 768px，App 端被 #ifdef H5 排除，都不受影响。
	 */
	// 表单、按钮、表格都在 P014/P015 子组件里，:deep() 才能穿透到它们的元素上
	@media (min-width: 768px) {
		// 表单：两个字段一行，产品编码/客户件号这类短字段不再各占一行
		.report-page :deep(.common-form) {
			display: flex;
			flex-wrap: wrap;
			column-gap: 32px;
		}
		.report-page :deep(.common-form .common-form-item) {
			flex: 0 0 calc((100% - 32px) / 2);
			width: calc((100% - 32px) / 2);
			// 单列时靠「相邻兄弟」加分隔线，栅格化后同行两项也会命中，改为每个单元格顶部一条
			border-top: 1px solid $u-border-color;
			// .u-form-item 是纵向 flex，body 又不撑满格子：栅格化后同一行被拉成等高，
			// 矮的那个（如「装箱数量」这类纯文本项）就贴到顶部了，靠它把 body 垂直居中
			justify-content: center;
		}
		// body 内部标签与内容也要垂直居中（.u-form-item 上不能加 align-items:center，
		// 那是它的交叉轴 = 横向，会把整块内容横向居中）
		.report-page :deep(.common-form .common-form-item .u-form-item__body) {
			align-items: center;
		}
		// 首行两条不要上边框
		.report-page :deep(.common-form .common-form-item:nth-child(-n + 2)) {
			border-top: none;
		}
		// 单选组别跟着撑开
		.report-page :deep(.common-form .radio-group) {
			justify-content: flex-start;
		}

		// 按钮：固定宽度居中排，不随容器拉伸（> 是避开打印弹窗里那组小按钮）
		.report-page :deep(> .btn-box) {
			justify-content: center;
			column-gap: 10px;
		}
		.report-page :deep(> .btn-box .btn),
		.report-page :deep(> .btn-box .box) {
			flex: 0 0 auto;
			width: 160px;
			// up-button 在 H5 上渲染成 uni-button，它自带 margin-left/right: auto，
			// 按钮不占满整行时会被这组 auto 边距推到中间，宽屏下要清掉
			margin-left: 0;
			margin-right: 0;
		}

		// 步骤条：限宽居中，三个工序点不至于被扯到屏幕两端
		.report-page :deep(> .u-steps) {
			max-width: 640px;
			margin-left: auto;
			margin-right: auto;
		}

		// 表格：列宽交回内容决定。uni-table 的 th 宽度是按 rpx 经 uni.upx2px() 换算的，
		// PC 下 100rpx 会被放大到 200px 量级，再被 table-layout:auto 摊平，连「序号」列都有 200 多像素
		.report-page :deep(.common-table .uni-table) {
			min-width: 0 !important;
		}
		.report-page :deep(.common-table .uni-table th) {
			width: auto !important;
		}
	}

	// 更宽的屏：一行三个
	@media (min-width: 1280px) {
		.report-page :deep(.common-form .common-form-item) {
			flex: 0 0 calc((100% - 64px) / 3);
			width: calc((100% - 64px) / 3);
		}
		.report-page :deep(.common-form .common-form-item:nth-child(3)) {
			border-top: none;
		}
	}
	/* #endif */
</style>
