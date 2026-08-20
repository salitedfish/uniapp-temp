<template>
	<view class="common-page-container">
		<CustomNavBar :title="procedureName"></CustomNavBar>

		<templateP014
			v-if="templateType === P.条码自配"
			:lineDetailData="lineDetailData" :lineDetailId="lineDetailId" :procedureName="procedureName" :planCode="planCode"
		/>
		<templateP015
			v-else-if="templateType === P.打包"
			:lineDetailData="lineDetailData" :lineDetailId="lineDetailId" :procedureName="procedureName" :planCode="planCode"
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
