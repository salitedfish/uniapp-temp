<script lang='ts'>
	// 框架
	import {
		defineComponent,
		ref,
		computed,
		onMounted
	} from 'vue';
	// 组件
	import CustomNavBar from "@/components/CustomNavBar.vue"
	import UpInputScan from "@/components/UpInputScan.vue"
	import UpInputDatePicker from "@/components/UpInputDatePicker.vue"
	// 工具
	import {
		useTimeFormat,
		useCheckEmptyInObj
	} from "@ultra-man/noa"
	// 接口
	import {
		getProductInfo
	} from "@/api/business"
	// 数据
	import {
		routes
	} from "@/store/route"
	// 类型
	export default defineComponent({
		name: ''
	});
</script>

<script lang='ts' setup>
	const rightClick = () => {
		uni.navigateTo({
			url: routes.prSDefaultSetPage.path
		})
	}

	onMounted(() => {
		dateSelected.value = [useTimeFormat("{YYYY}-{MM}-{dd}")(Date.now()).format]
	})

	const initForm = () => {
		return {
			invCode: "",
			invName: "",
			quantity: null,
			remark: "",
			shelfCode: "",
			shelfName: ""
		}
	}

	// 表单
	const form = ref(initForm())
	// 日期
	const dateSelected = ref < string[] > ([])
	// 产品扫码
	const codeText = ref("")
	const procuctScanSuccess = async (code: string) => {
		if (code) {
			try {
				codeText.value = code
				const res = await getProductInfo({
					code
				})
				console.log("产品", res.data)
				// form.value.invCode = res.data
			} catch (err) {
				console.log(err)
			}
		}
	}
	// 货位扫码
	const shelfScanSuccess = (code: string) => {
		form.value.shelfCode = code
	}
	// 表单数据加入表格
	const add = () => {
		tableData.value.push(form.value)
		form.value = initForm()
	}

	// 表格
	// table实际展示的数据, 表格由前端自己维护
	const tableData = ref < Obj[] > ([])
	const deleteTable = (key: number) => {
		uni.showModal({
			content: "确定要删除吗？",
			showCancel: true,
			success(res) {
				if (res.confirm) {
					tableData.value.splice(key, 1)
					uni.showToast({
						icon: "none",
						title: "删除成功"
					})
				}
			}
		})
	}

	// 提交
	const submiting = ref(false)
	const submit = () => {
		try {
			// 默认值检查
			const configStr = uni.getStorageSync("prSDefaultSet")
			const config: Obj = configStr ? JSON.parse(configStr) : {}
			if (useCheckEmptyInObj([config.depSelected, config.stockroomSelected, config.stockroomSaveTypeSelected],
					[])) {
				uni.showToast({
					title: "请填写完默认参数",
					icon: "none"
				})
				return
			}

			submiting.value = true
			uni.showLoading({
				title: "提交中",
				icon: "none",
				mask: true
			})
			// 参数赋值
			const params = {

			}
		} catch (err) {
			console.log(err)
		} finally {
			submiting.value = false
		}
	}
	const submitDisabled = computed(() => {
		return submiting.value || tableData.value.length <= 0
	})
</script>

<template>
	<view class="common-page-container">
		<CustomNavBar :title="routes.productionStockroom.style.navigationBarTitleText" @rightClick="rightClick">
		</CustomNavBar>

		<view>
			<view class="common-section-title">
				基本信息
			</view>
			<up-form class="common-form" labelPosition="left" required>
				<up-form-item class="common-form-item" label="产品编码:" borderBottom labelWidth="80" style="padding: 0">
					<up-input-scan border="none" placeholder="扫码后,自动带出" clearable class="input-item"
						@scanSuccess="procuctScanSuccess" readonly v-model="codeText"></up-input-scan>
				</up-form-item>

				<up-form-item class="common-form-item" label="产品名称:" borderBottom labelWidth="80" style="padding: 0">
					<up-input border="none" placeholder="自动填充" clearable class="input-item" readonly v-model="form.invName">
					</up-input>
				</up-form-item>

				<up-form-item class="common-form-item" label="入库数量:" borderBottom labelWidth="80" style="padding: 0" required>
					<up-input placeholder="自动填充" clearable class="input-item" type="number" v-model="form.quantity">
					</up-input>
				</up-form-item>

				<up-form-item class="common-form-item" label="备注:" borderBottom labelWidth="80" style="padding: 0">
					<up-input placeholder="请输入备注" clearable class="input-item" v-model="form.remark">
					</up-input>
				</up-form-item>

				<up-form-item class="common-form-item" label="货位:" borderBottom labelWidth="80" style="padding: 0" required>
					<up-input-scan border="none" placeholder="请扫货位码" clearable class="input-item" @scanSuccess="shelfScanSuccess"
						readonly v-model="form.shelfCode"></up-input-scan>
				</up-form-item>

				<up-form-item class="common-form-item" label="货位名称:" borderBottom labelWidth="80" style="padding: 0">
					<up-input border="none" placeholder="自动填充" clearable class="input-item" readonly v-model="form.shelfName">
					</up-input>
				</up-form-item>

				<up-form-item class="common-form-item" label="入库日期:" borderBottom labelWidth="80" style="padding: 0">
					<UpInputDatePicker border="none" placeholder="选择入库日期" clearable class="input-item" readonly
						v-model:selected="dateSelected">
					</UpInputDatePicker>
				</up-form-item>
			</up-form>
			<view class="btn-box">
				<up-button type="primary" text="加入" class="bottom-button" shape="circle" @click="add"></up-button>
			</view>
			<view class="common-section-title">
				本次入库明细
			</view>
		</view>

		<view class="table-box common-page-largest">
			<view class="common-table">
				<uni-table border stripe emptyText="暂无更多数据">
					<!-- 表头行 -->
					<uni-tr>
						<uni-th align="left" width="60rpx">序号</uni-th>
						<uni-th align="left" width="100rpx">产品编码</uni-th>
						<uni-th align="left" width="100rpx">产品名称</uni-th>
						<uni-th align="left" width="100rpx">入库数量</uni-th>
						<uni-th align="left" width="100rpx">货位信息</uni-th>
						<uni-th align="left" width="80rpx">操作</uni-th>
					</uni-tr>
					<!-- 表格数据行 -->
					<!-- <uni-tr v-for="item,key in resultData?.data" :key="key" @click="open(item)"> -->
					<uni-tr v-for="item,key in tableData" :key="key">
						<uni-td>{{ key + 1 }}</uni-td>
						<uni-td>{{ item.invCode }}</uni-td>
						<uni-td>{{ item.invName }}</uni-td>
						<uni-td>{{ item.quantity }}</uni-td>
						<uni-td>{{ item.shelfCode }}</uni-td>
						<uni-td class="warning" @click.stop="deleteTable(key)">删除</uni-td>
					</uni-tr>
				</uni-table>
			</view>
		</view>

		<view class="btn-box">
			<up-button type="primary" text="提交入库" class="bottom-button" shape="circle" @click="submit"
				:disabled="submitDisabled" :loading="submiting"></up-button>
		</view>

	</view>

</template>

<style scoped lang='less'>
	.btn-box {
		margin-top: 10px
	}
</style>