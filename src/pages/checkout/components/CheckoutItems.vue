<script lang='ts' setup>
	import {
		ref
	} from "vue"
	import {
		globalColor
	} from "@/store/theme"
	// 组件
	import MediaUpload from "@/components/MediaUpload.vue"

	const props = defineProps < {
		items: Objs
	} > ()

	const emit = defineEmits < {
		(event: "setFormResult"): void;
	} > ()

	const imgPreview = (item: Obj) => {
		uni.previewImage({
			indicator: "number",
			loop: true,
			urls: [item.image]
		})
	}

	const measureChange = (item: Obj) => {
		const min = Number(item.pointInspectionProject.minMeasure)
		const max = Number(item.pointInspectionProject.maxMeasure)
		const measure = Number(item.measure)
		if (measure >= min && measure <= max) {
			item.result = "合格"
		} else {
			item.result = "不合格"
		}
		emit("setFormResult")
	}

	const setFormResult = () => {
		emit("setFormResult")
	}
</script>

<template>
	<view class="common-form" labelPosition="left" style="padding-bottom: 10px;" v-show="items.length === 0">
		<up-empty mode="order" icon="http://cdn.uviewui.com/uview/empty/order.png" text="暂无点检项目">
		</up-empty>
	</view>
	<view class="common-form common-form-next" labelPosition="left" v-for="item, key in items" :key="key"
		:labelStyle="{'font-size': '14px'}">
		<up-cell-group>
			<up-cell icon="order" :title="`项目${key + 1}`"></up-cell>

			<up-cell v-if="item.pointInspectionProject.code">
				<template #title>
					<view class="u-cell-text cell-label">点检编码</view>
				</template>
				<template #value>
					<view class="u-cell-text cell-value">{{item.pointInspectionProject.code}}</view>
				</template>
			</up-cell>

			<up-cell v-if="item.pointInspectionProject.name">
				<template #title>
					<view class="u-cell-text cell-label">点检名称</view>
				</template>
				<template #value>
					<view class="u-cell-text cell-value">{{item.pointInspectionProject.name}}</view>
				</template>
			</up-cell>

			<up-cell v-if="item.pointInspectionProject.benchmark">
				<template #title>
					<view class="u-cell-text cell-label">点检基准</view>
				</template>
				<template #value>
					<view class="u-cell-text cell-value">{{item.pointInspectionProject.benchmark}}</view>
				</template>
			</up-cell>

			<up-cell v-if="item.pointInspectionProject.inspectionMethod">
				<template #title>
					<view class="u-cell-text cell-label">检查方法</view>
				</template>
				<template #value>
					<view class="u-cell-text cell-value">{{item.pointInspectionProject.inspectionMethod}}</view>
				</template>
			</up-cell>

			<up-cell v-if="item.image">
				<template #title>
					<view class="u-cell-text cell-label">基准图片</view>
				</template>
				<template #value>
					<view class="u-cell-text cell-value">
						<up-image :show-loading="true" :src="item.image" width="80px" height="80px"
							@click="imgPreview(item)"></up-image>
					</view>
				</template>
			</up-cell>

			<up-cell v-if="item.pointInspectionProject.partsName">
				<template #title>
					<view class="u-cell-text cell-label">配件</view>
				</template>
				<template #value>
					<view class="u-cell-text cell-value">{{item.pointInspectionProject.partsName}}</view>
				</template>
			</up-cell>

			<up-cell v-if="item.pointInspectionProject.partsNum">
				<template #title>
					<view class="u-cell-text cell-label">配件数量</view>
				</template>
				<template #value>
					<view class="u-cell-text cell-value">{{item.pointInspectionProject.partsNum}}</view>
				</template>
			</up-cell>

			<up-cell v-if="item.pointInspectionProject.ifMeasure == '1'">
				<template #title>
					<view class="u-cell-text cell-label">测量值</view>
				</template>
				<template #value>
					<view class="u-cell-text cell-value">
						<text style="margin-right: 5px">({{ Number(item.pointInspectionProject.minMeasure) }} -
							{{ Number(item.pointInspectionProject.maxMeasure) }})</text>
						<up-input placeholder="请输入测量值" border="surround" v-model="item.measure" type="number"
							@change="measureChange(item)"></up-input>
					</view>
				</template>
			</up-cell>

			<up-cell>
				<template #title>
					<view class="u-cell-text cell-label">点检结果</view>
				</template>
				<template #value>
					<view class="u-cell-text cell-value">
						<u-radio-group placement="row" class="radio-group" v-model="item.result" @change="setFormResult">
							<u-radio name="合格" label="合格"></u-radio>
							<u-radio name="不合格" label="不合格" style="margin-left: 10px;"></u-radio>
						</u-radio-group>
					</view>
				</template>
			</up-cell>

			<up-cell v-if="item.ifImage == '1'">
				<template #title>
					<view class="u-cell-text cell-label">图片</view>
				</template>
				<template #value>
					<view class="u-cell-text cell-value">
						<media-upload v-model="item.images" accept="image"></media-upload>
					</view>
				</template>
			</up-cell>

			<up-cell v-if="item.result === '不合格'">
				<template #title>
					<view class="u-cell-text cell-label">不合格理由</view>
				</template>
				<template #value>
					<view class="u-cell-text cell-value">
						<up-textarea placeholder="请输入不合格理由" border="surround" style="text-align: left;"
							v-model="item.reason"></up-textarea>
					</view>
				</template>
			</up-cell>
		</up-cell-group>
	</view>


</template>

<style scoped lang='less'>
	.common-form {
		/* background-color: v-bind("globalColor.default_background"); */
	}

	.cell-label {
		font-size: 14px;
	}

	.cell-value {
		width: 60%;
		text-align: right;
		color: v-bind("globalColor.info");
		font-size: 12px;
		display: flex;
		justify-content: flex-end;
		align-items: center;
	}

	.radio-group {
		display: flex;
		justify-content: flex-end;
	}

	:deep(.u-upload__wrap) {
		justify-content: flex-end;

	}

	:deep(.u-upload__button) {
		margin: 0 0 8px 8px;
	}

	:deep(.u-upload__wrap__preview) {
		margin: 0 0 8px 8px;
	}
</style>