<script lang='ts' setup>
	import {
		globalColor
	} from "@/store/theme"
	// 组件
	import MediaUpload from "@/components/MediaUpload.vue"
	import TraceFailureModPicker from "@/components/TraceFailureModePicker.vue"

	const props = defineProps < {
			checkItems: Obj[],
			form: Obj
		} >
		()

	const emit = defineEmits < {
		(event: "setFormResult"): void,
		(event: "setFailureMod"): void
	} > ()

	const imgPreview = (imgSrcs: string) => {
		uni.previewImage({
			indicator: "number",
			loop: true,
			urls: imgSrcs.split(",")
		})
	}

	const surveyValueChange = (item: Obj) => {
		const min = Number(item.minSurvey)
		const max = Number(item.maxSurvey)
		const survey = Number(item.surveyValue)
		if (survey >= min && survey <= max) {
			item.result = "1"
		} else {
			item.result = "0"
		}
		emit("setFormResult")
	}

	const setFormResult = () => {
		emit("setFormResult")
	}

	const failuerModSelect = (item: Obj, mods: Obj[]) => {
		if (mods.length > 0) {
			item.failureModeId = mods[0].id
			item.failureModeName = mods[0].failureModeName
		} else {
			item.failureModeId = ""
			item.failureModeName = ""
		}
		emit("setFailureMod")
	}
</script>

<template>
	<view class="common-form common-form-next" labelPosition="left" :labelStyle="{'font-size': '14px'}"
		v-for="item, key in checkItems" :key="key">
		<up-cell-group>
			<up-cell icon="order" :title="`检验单${key + 1}`"></up-cell>

			<up-cell>
				<template #title>
					<view class="u-cell-text cell-label">检验编码</view>
				</template>
				<template #value>
					<view class="u-cell-text cell-value">{{item.checkItemCode}}</view>
				</template>
			</up-cell>

			<up-cell>
				<template #title>
					<view class="u-cell-text cell-label">检验项目</view>
				</template>
				<template #value>
					<view class="u-cell-text cell-value">{{item.checkItemName}}</view>
				</template>
			</up-cell>

			<up-cell>
				<template #title>
					<view class="u-cell-text cell-label">检验基准</view>
				</template>
				<template #value>
					<view class="u-cell-text cell-value">{{item.checkContent}}</view>
				</template>
			</up-cell>

			<up-cell>
				<template #title>
					<view class="u-cell-text cell-label">检验类型</view>
				</template>
				<template #value>
					<view class="u-cell-text cell-value">{{item.checkTypeName}}</view>
				</template>
			</up-cell>

			<up-cell>
				<template #title>
					<view class="u-cell-text cell-label">检验方法</view>
				</template>
				<template #value>
					<view class="u-cell-text cell-value">{{item.checkWayName}}</view>
				</template>
			</up-cell>

			<up-cell>
				<template #title>
					<view class="u-cell-text cell-label">检验频次</view>
				</template>
				<template #value>
					<view class="u-cell-text cell-value">{{item.checkRateName}}</view>
				</template>
			</up-cell>

			<up-cell v-if="item.filePictureUrl">
				<template #title>
					<view class="u-cell-text cell-label">基准图片</view>
				</template>
				<template #value>
					<view class="u-cell-text cell-value">
						<up-image v-for="imgSrc,key in item.filePictureUrl.split(',')" :key="key" :show-loading="true" :src="imgSrc"
							width="80px" height="80px" style="margin-left: 5px;" @click="imgPreview(item.filePictureUrl)"></up-image>
					</view>
				</template>
			</up-cell>

			<up-cell v-if="item.needSurvey == '1'">
				<!-- <up-cell> -->
				<template #title>
					<view class="u-cell-text cell-label">测量值</view>
				</template>
				<template #value>
					<view class="u-cell-text cell-value">
						<text style="margin-right: 5px">({{ Number(item.minSurvey) }} -
							{{ Number(item.maxSurvey) }})</text>
						<up-input placeholder="请输入测量值" border="surround" v-model="item.surveyValue" type="number"
							@change="surveyValueChange(item)"></up-input>
					</view>
				</template>
			</up-cell>

			<up-cell v-if="item.needPicture == '1'">
				<template #title>
					<view class="u-cell-text cell-label">图片</view>
				</template>
				<template #value>
					<view class="u-cell-text cell-value">
						<media-upload v-model="item.images" accept="image"></media-upload>
					</view>
				</template>
			</up-cell>

			<up-cell>
				<template #title>
					<view class="u-cell-text cell-label">检测结果</view>
				</template>
				<template #value>
					<view class="u-cell-text cell-value">
						<u-radio-group placement="row" class="radio-group" v-model="item.result" @change="setFormResult">
							<u-radio :name="'1'" label="合格"></u-radio>
							<u-radio :name="'0'" label="不合格" style="margin-left: 10px;"></u-radio>
						</u-radio-group>
					</view>
				</template>
			</up-cell>

			<up-cell v-if="item.result == '0'">
				<template #title>
					<view class="u-cell-text cell-label">失效模式</view>
				</template>
				<template #value>
					<TraceFailureModPicker v-model:selected="item.failureModSelected"
						@select="(mods: Obj[]) => failuerModSelect(item, mods)" :processId="item.processId" :orgIds="form.orgIds"
						readonly border="none" placeholder="请选择失效模式">
					</TraceFailureModPicker>
				</template>
			</up-cell>

			<up-cell v-if="item.result == '0'">
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