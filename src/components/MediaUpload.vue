<script lang="ts" setup>
	import { useTimeFormat } from "@ultra-man/noa"
	import { getBaseUrl } from "@/util/common"
	import type { UploadMedia } from "@/type/file"

	// 直接改props里的数据算了
	const props = withDefaults(defineProps<{
		modelValue : UploadMedia[],
		maxCount ?: number
	}>(), {
		maxCount: 5
	})

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
			item.name = Number(new Date()).toString()
			props.modelValue.push({
				...item,
				status: 'uploading',
				message: '上传中',
			});
		}

		// 循环上传
		for (const item of lists) {
			// 上传
			const result = await uploadFilePromise(item);
			// 上传完根据之前标记的位置更新状态
			let oItem = props.modelValue[fileListLen];
			// 根据result来判断上传成功还是失败
			if (result) {
				props.modelValue.splice(fileListLen, 1, {
					...oItem,
					status: "success",
					message: "",
					url: JSON.parse(result).data,
				});
			} else {
				props.modelValue.splice(fileListLen, 1, {
					status: "fail",
					message: "",
					url: "",
				});
			}


			// 移动标记
			fileListLen++;
		}

		console.log('媒体文件列表更新：', props.modelValue);
	};

	const uploadFilePromise = (item : UploadMedia) : Promise<string> => {
		return new Promise((resolve) => {
			// resolve(url);
			uni.uploadFile({
				url: getBaseUrl() + "upload/fileUpload",
				filePath: item.url,
				name: 'file',
				formData: {
					// fileName: ,
					fileName: item.name,
					folder: ""
				},
				header: {
					token: uni.getStorageSync("token")
				},
				success: (res) => {
					if (res.statusCode === 200) {
						resolve(res.data);
					} else {
						uni.showToast({
							title: "上传失败",
							icon: "none"
						})
						resolve("")
					}
				},
				fail: () => {
					uni.showToast({
						title: "上传失败",
						icon: "none"
					})
					resolve("")
				}
			});
		});
	};
</script>

<template>
	<u-upload :fileList="props.modelValue" @afterRead="afterRead" @delete="deletePic" name="3" multiple
		:maxCount="maxCount" :previewFullImage="true"></u-upload>
</template>

<style lang="scss" scoped>
</style>