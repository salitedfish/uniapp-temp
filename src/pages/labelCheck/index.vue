<script lang='ts' setup>
	import {
		ref,
		onMounted
	} from "vue"
	// 组件
	import CustomNavBar from "@/components/CustomNavBar.vue"
	import UpInputScan from "@/components/UpInputScan.vue"
	// 数据
	import {
		routes
	} from "@/store/route"
	import {
		setCustomModal
	} from "@/store/customModal"
	// hook
	import {
		useTable
	} from "@/hook/usePageTable"
	// 接口
	import {
		labelCheckApi,
		getLabelCheckPageList
	} from "@/api/labelCheck"

	onMounted(() => {
		searchList()
	})

	const initForm = () => {
		return {
			code: ""
		}
	}
	const form = ref(initForm())

	// 扫码成功
	const scanSuccess = (res: string) => {
		form.value.code = res
	}

	// 表格分页
	const {
		searching,
		searchParam,
		resultData,
		searchList
	} = useTable(getLabelCheckPageList, {})
	// 分页搜索
	const pageSearch = (page: {
		current: number
	}) => {
		searchParam.value.currentPage = page.current
		searchList()
	}

	// 查询
	const search = () => {
		searchParam.value.currentPage = 1
		searchParam.value.code = form.value.code
		searchList()
	}

	// 校验
	const checking = ref(false)
	const check = async () => {
		if (!form.value.code) {
			uni.showToast({
				icon: "none",
				title: "请输入码值"
			})
			return
		}
		try {
			checking.value = true
			const res = await labelCheckApi({
				code: form.value.code
			})
			if (res.data && res.data.result == 1) {
				uni.showToast({
					icon: "success",
					title: "校验通过"
				})
			} else {
				setCustomModal({
					visiable: true,
					content: res.data?.failMsg || "校验失败"
				})
			}
			// 校验后刷新列表
			searchList()
		} catch (err) {
			console.log(err)
		} finally {
			checking.value = false
		}
	}
</script>

<template>
	<view class="common-page-container">
		<CustomNavBar :title="routes.LabelCheck.style.navigationBarTitleText"></CustomNavBar>

		<up-form class="common-form" labelPosition="left">
			<up-form-item class="common-form-item" label="码值:" borderBottom labelWidth="80" style="padding: 0" required>
				<up-input-scan v-model="form.code" @scanSuccess="scanSuccess" placeholder="请输入码值" clearable
					class="input-item"></up-input-scan>
			</up-form-item>
		</up-form>

		<view class="btn-box">
			<up-button type="primary" text="校验" class="bottom-button" shape="circle" :loading="checking"
				:disabled="checking" @click="check"></up-button>
			<up-button type="primary" text="查询" class="bottom-button" shape="circle" :loading="searching"
				:disabled="searching" @click="search"></up-button>
		</view>

		<view class="common-table">
			<uni-table border stripe emptyText="暂无更多数据" :loading="searching">
				<!-- 表头行 -->
				<uni-tr>
					<uni-th class="nowrap" align="left" width="60rpx">序号</uni-th>
					<uni-th class="nowrap" align="left" width="200rpx">码值</uni-th>
					<uni-th class="nowrap" align="left" width="80rpx">校验结果</uni-th>
					<uni-th class="nowrap" align="left" width="160rpx">不合格原因</uni-th>
					<uni-th class="nowrap" align="left" width="100rpx">校验人</uni-th>
					<uni-th class="nowrap" align="left" width="140rpx">校验时间</uni-th>
				</uni-tr>
				<!-- 表格数据行 -->
				<uni-tr v-for="item,key in resultData?.list" :key="key">
					<uni-td class="nowrap">{{ key + 1 }}</uni-td>
					<uni-td class="nowrap">{{ item.code }}</uni-td>
					<uni-td class="nowrap">{{ item.result == 1 ? "合格" : "不合格" }}</uni-td>
					<uni-td class="nowrap">{{ item.failMsg || "-" }}</uni-td>
					<uni-td class="nowrap">{{ item.createName }}</uni-td>
					<uni-td class="nowrap">{{ item.createTime }}</uni-td>
				</uni-tr>
			</uni-table>
		</view>
		<view class="page-box">
			<uni-pagination title="分页" show-icon="true" :total="resultData?.totalCount"
				:current="searchParam.currentPage" :pageSize="searchParam.pageSize" @change="pageSearch"></uni-pagination>
		</view>

		<CustomModal></CustomModal>
	</view>
</template>

<style scoped lang='less'>
	.btn-box {
		display: flex;
		justify-content: space-between;
		margin-top: 10px;

		.bottom-button {
			flex: 1;

			&+.bottom-button {
				margin-left: 10px;
			}
		}
	}

	.common-table {
		margin-top: 10px;
	}
</style>
