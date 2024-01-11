import { ref } from "vue"
import type { Ref } from "vue"
import type { Return } from "@/type/common"

/**
 * 请求列表hook
 */
export function useTable<P, R>(
	getListRequest : (searchParams : P) => Promise<Return<R>>,
	options : Partial<P> = {}
) {
	// 筛选的参数(不管需不需要分页都给他加上分页参数，不用也无所谓)
	const searchParam = <Ref<P>>ref({
		currentPage: 1,
		pageSize: 10,
	});
	searchParam.value = { ...searchParam.value, ...options };
	// 查询状态
	const searching = ref(false);
	// 请求结果数据
	const result : Ref<Return<R> | null> = ref(null)
	const resultData : Ref<R | null> = ref(null)

	const reSetPage = () => {
		searchParam.value = {
			...searchParam.value, ...{
				currentPage: 1,
				pageSize: 10,
			}
		}
	}

	// 搜索列表
	const searchList = async (params ?: P) => {
		if (params) {
			searchParam.value = { ...searchParam.value, ...params };
		}
		await getList();
	};

	// 重制列表
	const reSetList = async () => {
		searchParam.value = {
			page: 1,
			size: 10,
			...<P>options
		}
		result.value = null
		resultData.value = null
		searching.value = false
		await getList();
	}

	// 请求数据
	const getList = async () => {

		try {
			searching.value = true;
			const res = await getListRequest(searchParam.value);
			if (res) {
				result.value = res
				resultData.value = result.value.data
			}
		} catch (err) {
			console.log(err)
		} finally {
			searching.value = false;
		}
	};

	return {
		searching,
		searchParam,
		result,
		resultData,
		reSetPage,

		reSetList,
		searchList,
		getList,
	}
}