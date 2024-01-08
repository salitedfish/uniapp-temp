<script lang='ts'>
	// 框架
	import {
		defineComponent,
		ref,
		onMounted,
		watch
	} from 'vue';
	// 组件
	// 工具
	import {
		useTimeFormat,
		useGenTimeStamp,
		useIsEarly
	} from "@ultra-man/noa"
	// 接口
	// 数据
	import {
		globalColor
	} from "@/store/theme"
	// 类型
	export default defineComponent({
		name: ''
	});
</script>

<script lang='ts' setup>
	type DatePicked = {
		mode: string,
		value: number
	}

	const format = useTimeFormat("{YYYY}-{MM}-{dd}")

	const props = withDefaults(defineProps < {
		mode ? : "range" | "single",
		selected: string[],
		maxDate ? : number,
		minDate ? : number
	} > (), {
		mode: "single"
	})
	const emit = defineEmits < {
		(event: "select", data: string[]): void,
		(event: "update:selected", data: string[]): void
	} > ()

	// 初始化和监听props数据
	onMounted(() => {
		init()
		emit("select", props.selected)
	})
	watch(() => props.selected, () => {
		init()
		emit("select", props.selected)
	})
	const init = () => {
		const selected = props.selected
		const length = props.selected.length
		if (length == 0) {
			dateValue.value = ""
			date.value = Date.now()
			dateStart.value = Date.now()
			dateEnd.value = Date.now()
		} else if (props.mode === 'single' && length === 1) {
			dateValue.value = selected[0]
			date.value = useGenTimeStamp(selected[0])
		} else if (props.mode === 'range' && length === 1) {
			dateValue.value = `${selected[0]} ~ `
			dateStart.value = useGenTimeStamp(selected[0])
		} else if (props.mode === 'range' && length === 2) {
			dateValue.value = `${selected[0]} ~ ${selected[length - 1]}`
			dateStart.value = useGenTimeStamp(selected[0])
			dateEnd.value = useGenTimeStamp(selected[1])
		}
	}

	const dateValue = ref("")

	const date = ref < null | number > (null)
	const dateStart = ref < null | number > (null)
	const dateEnd = ref < null | number > (null)

	// 弹窗相关
	const show = ref(false)
	const showStart = ref(false)
	const showEnd = ref(false)
	const open = () => {
		if (props.mode === "range") {
			showEnd.value = true
			showStart.value = true
		} else {
			show.value = true
		}
	}
	const close = () => {
		show.value = false
		showEnd.value = false
		showStart.value = false
	}

	// 确认选择
	const confirm = (d: DatePicked) => {
		date.value = d.value
		dateValue.value = format(d.value).format
		show.value = false
		emit("select", [dateValue.value])
		emit("update:selected", [dateValue.value])
	}
	const cancel = () => {
		show.value = false
	}
	// 开始日期选择确认
	const confirmStart = (date: DatePicked) => {
		dateStart.value = date.value
		const formatDate = format(date.value).format
		dateValue.value = formatDate + " ~ "
		showStart.value = false
		emit("select", [formatDate])
		emit("update:selected", [formatDate])
	}
	const cancelStart = () => {
		showStart.value = false
		showEnd.value = false
	}
	// 结束日期选择确认
	const confirmEnd = (date: DatePicked) => {
		dateEnd.value = date.value
		const formatDateStart = format(dateStart.value as number).format
		const formatDateEnd = format(date.value).format
		if (useIsEarly(Number(dateEnd.value), Number(dateStart.value))) {
			uni.showToast({
				title: "结束日期不能早于开始日期",
				icon: "none",
			})
			return

		}
		emit("select", [formatDateStart, formatDateEnd])
		emit("update:selected", [formatDateStart, formatDateEnd])
		dateValue.value = dateValue.value + formatDateEnd
		showEnd.value = false
	}
	const cancelEnd = () => {
		showEnd.value = false
	}
</script>

<template>
	<up-input v-model="dateValue" clearable>
		<template #suffix>
			<uni-icons custom-prefix="custom-icon" type="icon-rili" size="18" :color="globalColor.primary"
				@click="open"></uni-icons>
			<u-datetime-picker :show="show" v-model="date" mode="date" title="选择日期" @confirm="confirm" @cancel="cancel"
				@close="close" closeOnClickOverlay :maxDate="maxDate" :minDate="minDate"></u-datetime-picker>
			<u-datetime-picker :show="showEnd" v-model="dateEnd" mode="date" title="选择结束日期" @confirm="confirmEnd"
				@cancel="cancelEnd" @close="close" closeOnClickOverlay :maxDate="maxDate"
				:minDate="minDate"></u-datetime-picker>
			<u-datetime-picker :show="showStart" v-model="dateStart" mode="date" title="选择开始日期" @confirm="confirmStart"
				@cancel="cancelStart" @close="close" closeOnClickOverlay :maxDate="maxDate"
				:minDate="minDate"></u-datetime-picker>
		</template>
	</up-input>
</template>

<style scoped lang='less'>

</style>