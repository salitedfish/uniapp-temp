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
		selected ? : Obj[]
	} > ()
	const emit = defineEmits < {
		(event: "select", result: Obj[]): void;
		(event: "update:selected", result: Obj[]): void;
	} > ()

	onMounted(() => {
		initData()
		if (props.selected) {
			emit("select", props.selected)
			inputText.value = props.selected.map(item => item.problemTypeName).join(", ")
		}
	})
	watch(() => props.selected, () => {
		if (props.selected) {
			emit("select", props.selected)
			inputText.value = props.selected.map(item => item.problemTypeName).join(", ")
		}
	})

	const initData = async () => {
		const res = await getAnDonProblemTypeList()
		columns.value[0] = res.data
	}

	// input显示的字符串
	const inputText = ref("")
	const show = ref(false);
	const columns = ref < Obj[] > ([]);

	const open = () => {
		show.value = true
	}
	const select = (res: {
		value: Obj[]
	}) => {
		inputText.value = res.value[0].problemTypeName
		show.value = false
		emit("select", res.value)
	}
</script>

<template>
	<up-input v-model="inputText" placeholder="请选择问题类型" class="input-item" readonly border="none">
		<template #suffix>
			<uni-icons custom-prefix="custom-icon" type="icon-chaxun" size="18" :color="globalColor.primary"
				@click="open"></uni-icons>
			<up-picker :show="show" :columns="columns" @confirm="select" @cancel="show = false"
				keyName="problemTypeName"></up-picker>
		</template>
	</up-input>
</template>

<style scoped lang='less'>

</style>