<template>
	<lsj-upload ref="lsjUpload" childId="upload1" :width="width" :height="height" :option="option" :size="size"
		:formats="formats" :debug="debug" :instantly="instantly" @uploadEnd="onuploadEnd" @progress="onprogre"
		@change="change" :count="count">
		<uni-icons custom-prefix="custom-icon" type="icon-folder" size="18" :color="globalColor.primary"></uni-icons>
		<!-- <image class="icon" src="../assets/fileSelect.svg" alt="" /> -->
	</lsj-upload>

	<view class="padding">
		<!-- #ifdef APP-PLUS-->
		<view v-for="item in files.values()" :key="item.name" class="file-item">
		<!-- #endif -->
			<!-- #ifdef H5 -->
			<view v-for="item in filelist" :key="item.name" class="file-item">
			<!-- #endif -->
				<uni-icons custom-prefix="custom-icon" type="icon-file" size="16" :color="globalColor.primary"
					style="margin-right: 10px"></uni-icons>

				<Download :info="item" class="item-name"
					:class="{fail: item.type === 'fail' || (item.responseText && JSON.parse(item.responseText).status !== 200)}">
				</Download>
				<text v-if="['waiting', 'loading' ].includes(item.type)" class="item-process"
					style="margin-left: 10rpx;">{{item.progress + "%"}}</text>

				<!-- type为sucess只是文件发送成功，后端不一定成功，所以还要根据后端返回的数据来判断 -->
				<uni-icons custom-prefix="custom-icon" type="icon-shibai" size="16" :color="globalColor.fail"
					style="margin-left: 10px"
					v-if="item.type === 'fail' || (item.responseText && JSON.parse(item.responseText).status !== 200)"></uni-icons>
				<uni-icons custom-prefix="custom-icon" type="icon-chenggong" size="16" :color="globalColor.success"
					style="margin-left: 10px" v-else-if="item.type === 'success'"></uni-icons>

				<uni-icons custom-prefix="custom-icon" type="icon-shanchu" size="16" :color="globalColor.fail"
					style="margin-left: 10px" @click="clear(item.name)"></uni-icons>
			</view>
		</view>
</template>


<script>
	import {
		getBaseUrl
	} from "@/util/common"
	import Download from "@/components/Download.vue"
	import {
		globalColor
	} from "@/store/theme"

	export default {
		props: {
			modelValue: {
				require: true
			},
			// 文件数量限制
			count: {
				type: Number,
				default: 3
			},
			// 文件上传大小限制
			size: {
				type: Number,
				default: 30
			},
			// 限制允许上传的格式，空串=不限制，默认为空
			formats: {
				type: String,
				default: ""
			}
		},
		emits: ["update:modelValue"],
		components: {
			Download
		},
		data() {
			return {
				globalColor,
				// 上传接口参数
				option: {
					// 上传服务器地址，需要替换为你的接口地址
					url: getBaseUrl() + "mediation/uploadMediationExcel", // 该地址非真实路径，需替换为你项目自己的接口地址
					// 上传附件的key
					name: 'file',
					// 根据你接口需求自定义请求头,默认不要写content-type,让浏览器自适配
					header: {
						token: uni.getStorageSync("token"),
					},
					// 根据你接口需求自定义body参数
					formData: {
						// 'orderId': 1000
					}
				},
				// 选择文件后是否立即自动上传，true=选择后立即上传
				instantly: true,
				// 必传宽高且宽高应与slot宽高保持一致
				width: '20px',
				height: '20px',
				// 文件回显列表
				files: new Map(),
				// H5用上面那个回显列表有bug，用下面这个
				// #ifdef H5
				filelist: [],
				// #endif
				// 是否打印日志
				debug: false,
			}
		},
		methods: {
			/**
			 * 某文件上传结束回调(成功失败都回调)
			 * @param {Object} item 当前上传完成的文件
			 */
			onuploadEnd(item) {
				// 更新当前窗口状态变化的文件
				this.files.set(item.name, item);
				this.updateModelValue()
			},
			/**
			 * 上传进度回调
			 * @param {Object} item 当前正在上传的文件
			 */
			onprogre(item) {
				console.log("onprogre", item)
				// 更新当前状态变化的文件
				if (item) {
					this.files.set(item.name, item);
				}
				// #ifdef H5 
				this.updateList();
				// #endif
				// this.$forceUpdate();
				this.updateModelValue()

			},
			/**
			 * 文件选择回调
			 * @param {Object} files 已选择的所有文件Map集合
			 */
			change(files) {
				// H5端不知道为什么files获取的有时候不是Map
				if (files instanceof Map) {
					console.log("change", files)
					// 更新选择的文件 
					this.files = files;
					// #ifdef H5
					this.updateList();
					// #endif
					// this.$forceUpdate();
					this.updateModelValue()
				}
			},
			// 手动上传
			upload() {
				// name=指定文件名，不指定则上传所有type等于waiting和fail的文件
				this.$refs['lsjUpload'].upload();
			},
			/**
			 * 指定上传某个文件
			 * @param {Object} name 带后缀名的文件名称
			 */
			resetUpload(name) {
				this.$refs['lsjUpload'].upload(name);
			},
			/**
			 * 移除某个文件
			 * @param {Object} name 带后缀名的文件名称
			 */
			clear(name) {
				// name=指定文件名，不传name默认移除所有文件
				this.$refs['lsjUpload'].clear(name);
			},
			/**
			 * 根据files更新外部的modelValue
			 */
			updateModelValue() {
				const files = []
				for (const value of this.files.values()) {
					let status = ""
					if (value.type === 'fail' || (value.responseText && JSON.parse(value.responseText).status !== 200)) {
						status = "fail"
					} else if (value.type === 'success') {
						status = "success"
					}
					value.status = status
					files.push(value)
				}
				console.log('文件列表更新：', files);
				this.$emit("update:modelValue", files)
			},
			// #ifdef H5
			/**
			 * 文件list展示
			 */
			updateList() {
				this.filelist = this.files.values()
			},
			// #endif

		},
		mounted() {
			// 初始化设置预设文件列表
			this.$refs.lsjUpload.setFiles(this.modelValue);
		}

	}
</script>

<style lang="scss">
	.file-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 12px;

		.item-name {
			width: 0;
			flex: 1;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
		}

		.fail {
			color: v-bind("globalColor.fail");
		}

		.item-process {
			color: $u-info
		}
	}

	.icon {
		width: 20px;
		height: 20px;
	}
</style>