<script lang='ts' setup>
	import {
		ref,
		onMounted,
		computed
	} from "vue"
	// 组件
	import CustomNavBar from "@/components/CustomNavBar.vue"
	import UpInputScan from "@/components/UpInputScan.vue"
	import TraceProblemTypePicker from "@/components/TraceProblemTypePicker.vue"
	// 数据
	import {
		routes
	} from "@/store/route"
	// hook
	import {
		useTable
	} from "@/hook/usePageTable"
	// 接口
	import {
		getAnDonList,
		submitAnDon
	} from "@/api/anDon"
	// 工具
	import {
		useThrottle
	} from "@ultra-man/noa"

	onMounted(() => {
		searchList()
	})

	// 表单
	const initForm = () => {
		return {
			lineDetailId: "",
			processName: "",
			problemTypeCode: "",
			problemTypeName: "",
			content: "",
		}
	}
	const form = ref(initForm())

	const scanSuccess = useThrottle((res: string) => {
		const arr = res.split("*")
		if (arr.length === 2) {
			form.value.lineDetailId = arr[0]
			form.value.processName = arr[1]
		} else {
			uni.showModal({
				title: '提示',
				content: "工序二维码不正确"
			});
			form.value.lineDetailId = ""
			form.value.processName = ""
		}
	}, 3000)

	const problemSelected = ref < Obj[] > ([])
	const problemSelect = (res: Obj[]) => {
		if (res.length > 0) {
			form.value.problemTypeCode = res[0].problemTypeCode
			form.value.problemTypeName = res[0].problemTypeName
		}
	}

	const submitDisabled = computed(() => {
		const {
			lineDetailId,
			processName,
			problemTypeCode
		} = form.value
		return !lineDetailId || !processName || !problemTypeCode
	})
	const submit = async () => {
		try {
			await submitAnDon(form.value)
			form.value = initForm()
			problemSelected.value = []
			searchList()
		} catch (err) {
			console.log(err)
		}
	}

	// 表格
	const {
		searching,
		searchParam,
		resultData,
		searchList,
		reSetPage
	} = useTable(getAnDonList)
	// 分页搜索
	const pageSearch = (page: {
		current: number
	}) => {
		searchParam.value.currentPage = page.current
		searchList()
	}
</script>

<template>
	<view class="common-page-container">
		<CustomNavBar :title="routes.LdAndon.style.navigationBarTitleText"></CustomNavBar>

		<up-form class="common-form" labelPosition="left">
			<up-form-item class="common-form-item" label="工序二维码:" borderBottom labelWidth="90" style="padding: 0" required>
				<up-input-scan v-model="form.processName" placeholder="请扫工序二维码" clearable class="input-item"
					@scanSuccess="scanSuccess" focus></up-input-scan>
			</up-form-item>

			<up-form-item class="common-form-item" label="问题类型:" borderBottom labelWidth="90" style="padding: 0" required>
				<TraceProblemTypePicker @select="problemSelect" v-model:selected="problemSelected"></TraceProblemTypePicker>
			</up-form-item>

			<up-form-item class="common-form-item" label="预警内容:" borderBottom labelWidth="90" style="padding: 0">
				<up-input placeholder="输入预警内容" clearable class="input-item" v-model="form.content">
				</up-input>
			</up-form-item>
		</up-form>

		<up-button type="primary" text="确定" class="bottom-button" @click="submit" shape="circle"
			:disabled="submitDisabled"></up-button>

		<view class="common-table">
			<uni-table border stripe emptyText="暂无更多数据" :loading="searching">
				<!-- 表头行 -->
				<uni-tr>
					<uni-th class="nowrap" align="left" width="60rpx">序号</uni-th>
					<uni-th class="nowrap" align="left" width="80rpx">工序</uni-th>
					<uni-th class="nowrap" align="left" width="80rpx">问题类型</uni-th>
					<uni-th class="nowrap" align="left" width="80rpx">一级预警接收人</uni-th>
					<uni-th class="nowrap" align="left" width="80rpx">二级预警接收人</uni-th>
					<uni-th class="nowrap" align="left" width="80rpx">发送时间</uni-th>
				</uni-tr>
				<!-- 表格数据行 -->
				<uni-tr v-for="item,key in resultData?.list" :key="key">
					<uni-td class="nowrap">{{ key + 1 }}</uni-td>
					<uni-td class="nowrap">{{ item.processCode }}</uni-td>
					<uni-td class="nowrap">{{ item.problemTypeName }}</uni-td>
					<uni-td class="nowrap">{{ item.person1Names }}</uni-td>
					<uni-td class="nowrap">{{ item.person2Names }}</uni-td>
					<uni-td class="nowrap">{{ item.createTime }}</uni-td>
				</uni-tr>
			</uni-table>
		</view>
		<view class="page-box">
			<uni-pagination title="分页" show-icon="true" :total="resultData?.totalCount" :current="searchParam.currentPage"
				:pageSize="searchParam.pageSize" @change="pageSearch"></uni-pagination>
		</view>

	</view>
</template>

<style scoped lang='less'>
	.bottom-button {
		margin-top: 10px;
	}

	.common-table {
		margin-top: 10px;
	}
</style>