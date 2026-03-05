<template>
	<view class="common-page-container">
		<CustomNavBar :title="procedureName"></CustomNavBar>

		<up-steps :current="activeNum" style="margin-top: 10px; overflow-x: scroll" class="pc-screen-only">
			<up-steps-item v-for="(item, key) in processList" :key="key" :title="item.procedureName"
				:error="item.result != 1 && key != activeNum"></up-steps-item>
		</up-steps>

		<component v-if="templateComponent" :is="templateComponent" :lineDetailId="props.lineDetailId"
			:procedureName="props.procedureName"></component>
		<up-empty v-else mode="data" text="暂无对应工序模版"></up-empty>

		<CustomModal> </CustomModal>
	</view>
</template>

<script lang="ts" setup>
	import { ref, computed, markRaw, onMounted } from "vue"
	import { getTraceLineDetail } from "@/api/trace"
	import { P } from "./enum"

	import template1 from "./template/template1.vue"
	import template2 from "./template/template2.vue"

	// 工序码 -> 模版组件映射，新增模版需在此扩展
	const PROCEDURE_TEMPLATES : Record<string, Obj> = {
		[P.银和晶科条码自配]: markRaw(template1),
		[P.银和晶科打包]: markRaw(template2),
	}

	const props = defineProps<{
		lineId ?: string
		lineDetailId ?: string
		procedureName ?: string
		procedureCode ?: string
		procedureKindCode ?: number | string
	}>()

	const activeNum = ref<number>()
	const processList = ref<Objs>([])

	const templateComponent = computed(() => (props.procedureCode ? (PROCEDURE_TEMPLATES[props.procedureCode] ?? null) : null))

	onMounted(() => {
		getLineProcess()
	})

	// 获取产线工序路线
	async function getLineProcess() {
		const res = await getTraceLineDetail({ lineId: props.lineId })
		if (res.data?.list) {
			processList.value = res.data.list
			processList.value.forEach((row : Obj, index : number) => {
				row.result = 1
				if (row.lineDetailId == props.lineDetailId) {
					activeNum.value = index
				}
			})
		}
	}
</script>

<style scoped lang="scss"></style>