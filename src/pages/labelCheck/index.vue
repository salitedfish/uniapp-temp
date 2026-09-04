<script lang='ts' setup>
	import {
		ref,
		nextTick,
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
	// 主输入框聚焦控制(重置后重新聚焦)
	const inputFocus = ref(false)

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

	// 按码值筛选列表并回到第一页
	const filterByCode = (code: string) => {
		searchParam.value.currentPage = 1
		searchParam.value.code = code
		searchList()
	}

	// 校验指定码值(校验通过/失败提示)
	const checking = ref(false)
	const doCheck = async (code: string) => {
		if (!code) {
			return
		}
		try {
			checking.value = true
			const res = await labelCheckApi({
				code
			})
			if (res.data && res.data.result == 1) {
				uni.showToast({
					icon: "success",
					title: "校验通过"
				})
				reset()
				filterByCode("")
			} else {
				setCustomModal({
					visiable: true,
					content: res.data?.failMsg || "校验失败",
					success: () => {
						reset()
						filterByCode("")
						return true
					},
					cancel: () => {
						reset()
						filterByCode("")
						return true
					}
				})
			}
		} catch (err) {
			console.log(err)
		} finally {
			checking.value = false
		}
	}

	// 需求1: 扫码/输入完成后自动校验并刷新列表
	// (UpInputScan 内部已对输入做防抖, 这里即"输入停顿"的时机)
	const scanSuccess = (res: string) => {
		form.value.code = res
		// filterByCode(res)
		doCheck(res)
	}

	// 校验按钮(手动触发, 与自动校验一致)
	const check = async () => {
		const code = form.value.code
		if (!code) {
			uni.showToast({
				icon: "none",
				title: "请输入码值"
			})
			return
		}
		filterByCode(code)
		await doCheck(code)
	}

	// 需求2: 重置 = 清空输入框 + 清筛选条件刷新全部记录 + 重新聚焦输入框
	const reset = () => {
		form.value.code = ""
		filterByCode("")
		inputFocus.value = false
		nextTick(() => {
			inputFocus.value = true
		})
	}

	// 需求3: header右上角"查询"弹窗(按码值查询分页列表, 不触发校验)
	const queryDialogVisible = ref(false)
	const initQueryForm = () => {
		return {
			code: ""
		}
	}
	const queryForm = ref(initQueryForm())
	const openQuery = () => {
		queryForm.value = initQueryForm()
		queryDialogVisible.value = true
	}
	const closeQuery = () => {
		queryDialogVisible.value = false
	}
	const queryScanSuccess = (res: string) => {
		queryForm.value.code = res
	}
	const querySearch = () => {
		const code = queryForm.value.code
		if (!code) {
			uni.showToast({
				icon: "none",
				title: "请输入码值"
			})
			return
		}
		filterByCode(code)
		closeQuery()
	}
</script>

<template>
	<view class="common-page-container">
		<CustomNavBar :title="routes.LabelCheck.style.navigationBarTitleText" rightText="查询" @rightClick="openQuery">
		</CustomNavBar>

		<up-form class="common-form" labelPosition="left">
			<up-form-item class="common-form-item" label="码值:" borderBottom labelWidth="80" style="padding: 0" required>
				<up-input-scan v-model="form.code" @scanSuccess="scanSuccess" :focus="inputFocus" @blur="inputFocus = false"
					placeholder="请输入码值" clearable class="input-item"></up-input-scan>
			</up-form-item>
		</up-form>

		<view class="btn-box">
			<up-button type="primary" text="校验" class="bottom-button" shape="circle" :loading="checking" :disabled="checking"
				@click="check"></up-button>
			<up-button type="warning" text="重置" class="bottom-button" shape="circle" :loading="searching"
				:disabled="searching" @click="reset"></up-button>
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
			<uni-pagination title="分页" show-icon="true" :total="resultData?.totalCount" :current="searchParam.currentPage"
				:pageSize="searchParam.pageSize" @change="pageSearch"></uni-pagination>
		</view>

		<!-- 需求3: header右上角"查询"弹窗(按码值查分页列表, 不触发校验) -->
		<u-popup :show="queryDialogVisible" mode="center" @close="closeQuery" :round="10">
			<view class="query-popup">
				<view class="query-title">码值查询</view>
				<up-form labelPosition="left">
					<up-form-item label="码值:" borderBottom>
						<up-input-scan v-model="queryForm.code" @scanSuccess="queryScanSuccess" placeholder="请输入码值" clearable
							class="input-item"></up-input-scan>
					</up-form-item>
				</up-form>
				<up-button type="primary" text="查询" shape="circle" :loading="searching" :disabled="searching"
					@click="querySearch"></up-button>
			</view>
		</u-popup>

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

	.query-popup {
		width: 85vw;
		padding: 20px;
		box-sizing: border-box;

		.query-title {
			font-weight: bold;
			text-align: center;
			margin-bottom: 16px;
		}
	}
</style>