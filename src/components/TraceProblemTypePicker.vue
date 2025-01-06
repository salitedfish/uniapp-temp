<script lang='ts' setup>
	import {
		ref,
		reactive,
		onMounted,
		watch
	} from 'vue';
	import {
		globalColor
	} from "@/store/theme"
	import {
		getAnDonProblemTypeList
	} from "@/api/anDon"

	const props = defineProps < {
		selected ? : Objs
	} > ()
	const emit = defineEmits < {
		(event: "select", result: Objs): void;
		(event: "update:selected", result: Objs): void;
	} > ()

	onMounted(() => {
		initData()
		if (props.selected) {
			emit("select", props.selected)
			inputText.value = props.selected.map(item => item.label).join(", ")
		}
	})
	watch(() => props.selected, () => {
		if (props.selected) {
			emit("select", props.selected)
			inputText.value = props.selected.map(item => item.label).join(", ")
		}
	})

	const initData = async () => {
		const res = await getAnDonProblemTypeList()
		columns.value[0] = res.data
	}

	// input显示的字符串
	const inputText = ref("")
	const show = ref(false);
	const columns = ref < Objs > ([]);

	const open = () => {
		show.value = true
	}
	const select = (res: {
		value: Objs
	}) => {
		inputText.value = res.value[0].label
		show.value = false
		emit("select", res.value)
	}
</script>

<template>
	<view @click="open" style="width: 100%;">
		<up-input v-model="inputText" placeholder="请选择问题类型" class="input-item" readonly border="none"
			style="pointer-events: none">
			<template #suffix>
				<uni-icons custom-prefix="custom-icon" type="icon-chaxun" size="18" :color="globalColor.primary"></uni-icons>
			</template>
		</up-input>
	</view>

	<up-picker :show="show" :columns="columns" @confirm="select" @cancel="show = false" keyName="label"></up-picker>
</template>

<style scoped lang='less'>

</style>