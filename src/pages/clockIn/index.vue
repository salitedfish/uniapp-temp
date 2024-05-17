<script lang='ts' setup>
	import {
		ref,
		onMounted,
		computed
	} from "vue"
	// 组件
	import CustomNavBar from "@/components/CustomNavBar.vue"
	import UpInputScan from "@/components/UpInputScan.vue"
	// 数据
	import {
		routes
	} from "@/store/route"
	import {
		userInfo
	} from "@/store/auth"
	// hook
	import {
		useTable
	} from "@/hook/usePageTable"
	// 接口
	import {
		getClockInList,
		submitClockIn
	} from "@/api/clockIn"
	// 工具
	import {
		useCheckEmptyInObj,
		useThrottle
	} from "@ultra-man/noa"

	onMounted(() => {
		searchList()
	})

	// 表单
	const initForm = () => {
		return {
			personName: userInfo.value.jobName,
			personId: userInfo.value.orgId,
			lineDetailId: "",
			processName: "",
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
			form.value = initForm()
		}
	}, 3000)

	const submitDisabled = computed(() => {
		return useCheckEmptyInObj(form.value)([])
	})
	const submit = async () => {
		try {
			await submitClockIn(form.value)
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
	} = useTable(getClockInList)
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
		<CustomNavBar :title="routes.LdOnDuty.style.navigationBarTitleText"></CustomNavBar>

		<up-form class="common-form" labelPosition="left">
			<up-form-item class="common-form-item" label="人员二维码:" borderBottom labelWidth="90" style="padding: 0" required>
				<up-input border="none" placeholder="自动带出" clearable class="input-item" v-model="form.personName" readonly>
				</up-input>
			</up-form-item>

			<up-form-item class="common-form-item" label="工序二维码:" borderBottom labelWidth="90" style="padding: 0" required>
				<up-input-scan v-model="form.processName" placeholder="请扫工序二维码" clearable class="input-item"
					@scanSuccess="scanSuccess" focus></up-input-scan>
			</up-form-item>
		</up-form>

		<up-button type="primary" text="确定" class="bottom-button" @click="submit" shape="circle"
			:disabled="submitDisabled"></up-button>

		<view class="common-table">
			<uni-table border stripe emptyText="暂无更多数据" :loading="searching">
				<!-- 表头行 -->
				<uni-tr>
					<uni-th class="nowrap" align="left" width="60rpx">序号</uni-th>
					<uni-th class="nowrap" align="left" width="100rpx">工号</uni-th>
					<uni-th class="nowrap" align="left" width="100rpx">姓名</uni-th>
					<uni-th class="nowrap" align="left" width="100rpx">工序</uni-th>
					<uni-th class="nowrap" align="left" width="100rpx">上岗时间</uni-th>
				</uni-tr>
				<!-- 表格数据行 -->
				<uni-tr v-for="item,key in resultData?.list" :key="key">
					<uni-td class="nowrap">{{ key + 1 }}</uni-td>
					<uni-td class="nowrap">{{ item.personCode }}</uni-td>
					<uni-td class="nowrap">{{ item.personName }}</uni-td>
					<uni-td class="nowrap">{{ item.processCode }}</uni-td>
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