<script lang='ts'>
	// 框架
	import {
		defineComponent,
		ref,
		onMounted
	} from 'vue';
	// 组件
	import UpInputScan from "@/components/UpInputScan.vue"
	import MediaUpload from "@/components/MediaUpload.vue"
	// 工具
	// 接口
	import {
		deliveryMaterialInfo,
		deliveryMaterialAddFile,
		deliveryMaterialFileList
	} from "@/api/deliveryMaterial"
	// 数据
	// 类型
	import type {
		UploadMedia
	} from "@/type/file"
	import type {
		DeliveryMaterialInfo
	} from "@/type/business"
	import {
		onLoad
	} from '@dcloudio/uni-app';
	export default defineComponent({
		name: ''
	});
</script>

<script lang='ts' setup>
	// 初始化获取数据

	onLoad((options) => {
		if (options && options.code) {
			scanSuccess(options.code)
		}
	})

	// 表单
	const scanSuccess = async (code: string) => {
		if (code) {
			uni.showLoading({
				mask: true,
				title: "信息获取中"
			})
			try {
				const res = await deliveryMaterialInfo({
					outboundCode: code
				})
				form.value = res.data
				if (res.data.deliveryPlanAnnex) {
					const names = res.data.deliveryPlanAnnex.annexName.split(",")
					const urls = res.data.deliveryPlanAnnex.annexUrl.split(",")
					for (const key in names) {
						medias.value.push({
							name: names[key],
							url: urls[key] + "?token2=fujianhuichuan",
							status: "success"
						})
					}
				}
				console.log(111, medias.value)
			} catch (err) {
				console.log(err)
			} finally {
				uni.hideLoading()
			}
		}
	}
	const form = ref < DeliveryMaterialInfo > ({})

	// 文件列表
	const medias = ref < UploadMedia[] > ([])

	// 提交
	const submiting = ref(false)
	const submit = async () => {
		const _medias = medias.value.filter(item => item.status === "success")
		if (_medias.length > 0 && form.value.outboundCode) {
			submiting.value = true
			try {
				await deliveryMaterialAddFile({
					outboundCode: form.value.outboundCode,
					annexUrl: _medias.map(item => item.url?.split("?")[0]).join(","),
					annexName: _medias.map(item => item.name).join(","),
				})
				uni.showToast({
					title: "附件回传成功",
					icon: "none"
				})
				form.value = {}
				medias.value = []
			} catch (err) {
				console.log(err)
			} finally {
				submiting.value = false
			}
		}
	}
</script>

<template>
	<view class="common-page-container">
		<view>
			<view class="common-section-title">
				基本信息
			</view>
			<up-form class="common-form" labelPosition="left" required>

				<up-form-item class="common-form-item" label="出库单号:" borderBottom labelWidth="100" style="padding: 0">
					<up-input border="none" placeholder="自动填充" clearable class="input-item" readonly v-model="form.outboundCode">
					</up-input>
					<!-- 					<UpInputScan border="none" placeholder="扫出库单码" clearable class="input-item" readonly
						v-model="form.outboundCode" @scanSuccess="scanSuccess">
					</UpInputScan> -->
				</up-form-item>

				<up-form-item class="common-form-item" label="出库时间:" borderBottom labelWidth="100" style="padding: 0">
					<up-input border="none" placeholder="自动填充" clearable class="input-item" readonly v-model="form.planDate">
					</up-input>
				</up-form-item>

				<up-form-item class="common-form-item" label="客户名称:" borderBottom labelWidth="100" style="padding: 0">
					<up-input border="none" placeholder="自动填充" clearable class="input-item" readonly v-model="form.customerName">
					</up-input>
				</up-form-item>

				<up-form-item class="common-form-item" label="附件信息:" borderBottom labelWidth="100" style="padding: 0">
					<media-upload v-model="medias" accept="image"></media-upload>
				</up-form-item>

			</up-form>
		</view>

		<view class="btn-box">
			<up-button type="primary" text="提交" class="bottom-button" shape="circle" @click="submit"
				:disabled="submiting"></up-button>
		</view>

	</view>

</template>

<style scoped lang='less'>
	.btn-box {
		margin-top: 10px
	}
</style>