<script lang='ts'>
	// 框架
	import {
		defineComponent,
		ref,
		reactive,
		watch
	} from 'vue';
	// 组件
	// 工具
	// 接口
	// 数据
	// 类型
	export default defineComponent({
		name: ''
	});
</script>

<script lang='ts' setup>
	defineProps < {
		showPrintContent ? : boolean
	} > ()
	const emit = defineEmits < {
		(event: "closePrintContent"): void
	} > ()

	const close = () => {
		emit("closePrintContent")
	}
</script>

<template>
	<view>
		<u-popup :show="showPrintContent" mode="bottom" @close="close">
			<view class="popup-content common-page common-page-container" style="height: 90vh">
				<view class="common-section-title popup-title ">
					打印标签
				</view>
				<view class="common-page-largest">
					<view v-for="item, key in 100">
						打印内容待定
					</view>
				</view>

				<view class="btn-box">
					<up-button type="primary" text="打印" class="bottom-button" shape="circle" size="small"></up-button>
					<up-button text="取消" class="bottom-button" @click="close" shape="circle" size="small"></up-button>
				</view>
			</view>
		</u-popup>
	</view>
</template>

<style scoped lang='scss'>
	.btn-box {
		padding: 10px 0;
		display: flex;
		justify-content: flex-end;

		.bottom-button+.bottom-button {
			margin-left: 10px;
		}

		.bottom-button {
			width: 30%;
			margin: 0;
		}
	}
</style>