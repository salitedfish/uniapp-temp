<script lang="ts" setup>
	import { getBaseUrl } from "@/util/common"
	import type { UploadMedia } from "@/type/file"

	// 直接改props里的数据算了
	const props = defineProps<{
		modelValue : UploadMedia[]
	}>()

	// 删除图片
	const deletePic = (event : { index : number }) => {
		props.modelValue.splice(event.index, 1);
		console.log('媒体文件列表更新：', props.modelValue);
	};

	// 新增图片
	const afterRead = async (event : { file : UploadMedia[] | UploadMedia }) => {
		// 标记要改变的图片位置
		let fileListLen = props.modelValue.length;
		// 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
		let lists : UploadMedia[] = [].concat(event.file as any);
		for (const item of lists) {
			props.modelValue.push({
				...item,
				status: 'uploading',
				message: '上传中',
			});
		}

		// 循环上传
		for (const item of lists) {
			// 上传
			const result = await uploadFilePromise(item.url as string);
			// 上传完根据之前标记的位置更新状态
			let oItem = props.modelValue[fileListLen];
			props.modelValue.splice(fileListLen, 1, {
				...oItem,
				status: result ? "success" : "fail", //状态根据result来定
				message: "",
				url: result ? result : "",
			});

			// 移动标记
			fileListLen++;
		}

		console.log('媒体文件列表更新：', props.modelValue);
	};

	const uploadFilePromise = (url : string) : Promise<string> => {
		return new Promise((resolve) => {
			// resolve(url);
			uni.uploadFile({
				url: getBaseUrl(),
				filePath: url,
				name: 'file',
				formData: {
				},
				header: {
					token: uni.getStorageSync("token")
				},
				success: (res) => {
					if (res.statusCode === 200) {
						resolve(url);
					} else {
						resolve("")
					}
				},
			});
		});
	};
</script>

<template>
	<u-upload :fileList="props.modelValue" @afterRead="afterRead" @delete="deletePic" name="3" multiple :maxCount="5"
		:previewFullImage="true"></u-upload>
</template>

<style lang="scss" scoped>
</style>