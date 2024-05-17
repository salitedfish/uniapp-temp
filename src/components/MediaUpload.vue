<script lang="ts" setup>
	import { getBaseUrl } from "@/util/common"
	import type { UploadMedia } from "@/type/file"
	import { Platform } from "@/util/env"

	const genImgUrl = (url : string) => {
		let target = url
		// 只有正式环境的H5端才需要转化url
		// 为了让后端返回的内网地址转成公网地址（否则在公网地址无法回显内网地址的图片），如果h5只在内网用，则不能转换，看情况修改
		// 或者接口是用代理的情况下，则不用修改
		if (import.meta.env.VITE_RUN_TIME === "production" && Platform.isWeb()) {
			const index = url.indexOf("/uploadFiles/file")
			target = location.origin + import.meta.env.VITE_BASE_API_URL_WEB + url.slice(index + 1)
		}
		console.log("VITE_RUN_TIME", import.meta.env.VITE_RUN_TIME)
		console.log("isWeb", Platform.isWeb())
		console.log("result", target + "?token2=fujianhuichuan")
		return target + "?token2=fujianhuichuan"
	}

	// 直接改props里的数据算了
	const props = withDefaults(defineProps<{
		modelValue : UploadMedia[],
		maxCount ?: number
	}>(), {
		maxCount: 99
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
			if (result && JSON.parse(result).data) {
				props.modelValue.splice(fileListLen, 1, {
					...oItem,
					status: "success",
					message: "",
					url: genImgUrl(JSON.parse(result).data),
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
	<!-- 	<u-upload :fileList="props.modelValue" @afterRead="afterRead" @delete="deletePic" name="3" multiple
		:maxCount="maxCount" :previewFullImage="true"></u-upload> -->
	<up-upload :fileList="props.modelValue" @afterRead="afterRead" @delete="deletePic" name="3" multiple
		:maxCount="maxCount" :previewFullImage="true"></up-upload>
</template>

<style lang="scss" scoped>
</style>