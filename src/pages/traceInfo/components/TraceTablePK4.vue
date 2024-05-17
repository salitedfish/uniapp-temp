<script lang='ts' setup>
	// hook
	import {
		useTable
	} from "@/hook/usePageTable"
	// 接口
	import {
		getTracePageList
	} from "@/api/trace"
	// 类型
	import {
		P
	} from "../enum"

	const props = defineProps < {
		form: Obj
	} > ()

	// 生成分页所需的数据和方法
	const {
		searching,
		searchParam,
		resultData,
		searchList,
		reSetPage,
		reSetList
	} = useTable(getTracePageList, {
		lineDetailId: props.form.lineDetailId,
		planId: props.form.planId
	})

	// 分页搜索
	const pageSearch = (page: {
		current: number
	}) => {
		searchParam.value.currentPage = page.current
		searchList()
	}

	defineExpose({
		searchList,
		reSetPage,
		reSetList
	})
</script>

<template>
	<view class="common-table">
		<uni-table border stripe emptyText="暂无更多数据" :loading="searching">
			<!-- 表头行 -->
			<uni-tr>
				<uni-th class="nowrap" align="left" width="60rpx">序号</uni-th>
				<uni-th class="nowrap" align="left" width="100rpx" v-if="form.procedureCode == P.定制流程1">检具编码</uni-th>
				<uni-th class="nowrap" align="left" width="100rpx" v-if="form.procedureCode == P.定制流程2">包装码</uni-th>
				<uni-th class="nowrap" align="left" width="100rpx" v-if="form.procedureCode == P.定制流程3">标签码</uni-th>
				<uni-th class="nowrap" align="left" width="100rpx" v-if="form.procedureCode == P.多原料绑定">来料批次</uni-th>
				<uni-th class="nowrap" align="left" width="100rpx" v-if="form.procedureCode == P.条码关联返工">客供批次</uni-th>
				<uni-th class="nowrap" align="left" width="100rpx" v-if="form.procedureCode == P.扫码登记返工"></uni-th>
				<uni-th class="nowrap" align="left" width="100rpx">{{ form.barcodeName1 }}</uni-th>
				<uni-th class="nowrap" align="left" width="100rpx">结果</uni-th>
				<uni-th class="nowrap" align="left" width="100rpx">时间</uni-th>
			</uni-tr>
			<!-- 表格数据行 -->
			<uni-tr v-for="item,key in resultData?.list" :key="key">
				<uni-td class="nowrap">{{ key + 1 }}</uni-td>
				<uni-td class="nowrap" v-if="item.equipmentContent">{{ item.equipmentContent }}</uni-td>
				<uni-td class="nowrap" v-if="[P.扫码登记返工, P.多原料绑定].includes(form.procedureCode)"></uni-td>
				<uni-td class="nowrap" v-else>{{ item.barcode2 }}</uni-td>
				<uni-td class="nowrap">{{ item.barcode1 }}</uni-td>
				<uni-td class="nowrap" v-if="[P.多原料绑定, P.条码关联返工, P.扫码登记返工].includes(form.procedureCode)">
					<template v-if="item.result == 1">合格</template>
					<template v-if="item.result != 1">不合格（{{ item.failureModeName }}）</template>
					<template v-if="item.submitType == 2">, 返工</template>
				</uni-td>
				<uni-td class="nowrap" v-else>
					<template v-if="item.result0 == 1">一致</template>
					<template v-if="item.result0 != 1">不一致</template>
				</uni-td>
				<uni-td class="nowrap">{{ item.createTime }}</uni-td>
			</uni-tr>
		</uni-table>

		<uni-pagination title="分页" show-icon="true" :total="resultData?.totalCount" :current="searchParam.currentPage"
			:pageSize="searchParam.pageSize" @change="pageSearch"></uni-pagination>
	</view>
</template>

<style scoped lang='less'>

</style>