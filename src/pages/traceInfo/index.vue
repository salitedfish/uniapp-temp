<template>
	<view class="common-page-container">
		<CustomNavBar :title="procedureName"></CustomNavBar>


		<templatePK1
			v-if="templateType === PK.条码关联"
			:lineDetailData="lineDetailData" :lineDetailId="lineDetailId" :procedureName="procedureName" :planCode="planCode"
		/>
		<templatePK2
			v-else-if="templateType === PK.数据采集"
			:lineDetailData="lineDetailData" :lineDetailId="lineDetailId" :procedureName="procedureName" :planCode="planCode"
		/>
		<templatePK3
			v-else-if="templateType === PK.扫码登记"
			:lineDetailData="lineDetailData" :lineDetailId="lineDetailId" :procedureName="procedureName" :planCode="planCode"
		/>
		<templateP001
			v-else-if="templateType === P.定制流程1"
			:lineDetailData="lineDetailData" :lineDetailId="lineDetailId" :procedureName="procedureName" :planCode="planCode"
		/>
		<templateP002
			v-else-if="templateType === P.定制流程2"
			:lineDetailData="lineDetailData" :lineDetailId="lineDetailId" :procedureName="procedureName" :planCode="planCode"
		/>
		<templateP003
			v-else-if="templateType === P.定制流程3"
			:lineDetailData="lineDetailData" :lineDetailId="lineDetailId" :procedureName="procedureName" :planCode="planCode"
		/>
		<templateP004
			v-else-if="templateType === P.多原料绑定"
			:lineDetailData="lineDetailData" :lineDetailId="lineDetailId" :procedureName="procedureName" :planCode="planCode"
		/>
		<templateP005
			v-else-if="templateType === P.条码关联返工"
			:lineDetailData="lineDetailData" :lineDetailId="lineDetailId" :procedureName="procedureName" :planCode="planCode"
		/>
		<templateP006
			v-else-if="templateType === P.扫码登记返工"
			:lineDetailData="lineDetailData" :lineDetailId="lineDetailId" :procedureName="procedureName" :planCode="planCode"
		/>
		<templateP014
			v-else-if="templateType === P.条码自配"
			:lineDetailData="lineDetailData" :lineDetailId="lineDetailId" :procedureName="procedureName" :planCode="planCode"
		/>
		<templateP015
			v-else-if="templateType === P.打包"
			:lineDetailData="lineDetailData" :lineDetailId="lineDetailId" :procedureName="procedureName" :planCode="planCode"
		/>
		<templateP016
			v-else-if="templateType === P.终检"
			:lineDetailData="lineDetailData" :lineDetailId="lineDetailId" :procedureName="procedureName" :planCode="planCode"
		/>

	</view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue"
import { getLineDetail } from "@/api/trace"
import { P, PK } from "./enum"
import templatePK1 from "./templatePK1.vue"
import templatePK2 from "./templatePK2.vue"
import templatePK3 from "./templatePK3.vue"
import templateP001 from "./templateP001.vue"
import templateP002 from "./templateP002.vue"
import templateP003 from "./templateP003.vue"
import templateP004 from "./templateP004.vue"
import templateP005 from "./templateP005.vue"
import templateP006 from "./templateP006.vue"
import templateP014 from "./templateP014.vue"
import templateP015 from "./templateP015.vue"
import templateP016 from "./templateP016.vue"

const props = defineProps<{
	lineDetailId?: string
	procedureName?: string
	planCode?: string
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
		if (pk === PK.条码关联) {
			templateType.value = PK.条码关联
		} else if (pk === PK.数据采集) {
			templateType.value = PK.数据采集
		} else if (pk === PK.扫码登记) {
			templateType.value = PK.扫码登记
		} else if (pk === PK.定制流程) {
			const map: Record<string, P> = {
				DZ001: P.定制流程1,
				DZ002: P.定制流程2,
				DZ003: P.定制流程3,
				DZ004: P.多原料绑定,
				DZ005: P.条码关联返工,
				DZ006: P.扫码登记返工,
				DZ014: P.条码自配,
				DZ015: P.打包,
				DZ016: P.终检,
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
