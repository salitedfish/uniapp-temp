import { ref } from "vue"
import type { Ref } from "vue"
import type { Paging, Return, ReturnList } from "../type/common"


/**
 * 分页hook
 */
export const usePageTable = <P extends Paging, R>(
	getListRequest : (searchParams : P) => Promise<Return<ReturnList<R>>>,
	options : {
		size ?: number;
		params ?: Omit<P, "page" | "size">;
	} = {
			size: 10,
		}
) => {
	type SearchParams = Omit<P, "page" | "size">;

	// 筛选的参数
	const searchParam = <Ref<P>>ref({
		page: 1,
		size: options.size || 10,
	});
	searchParam.value = { ...searchParam.value, ...options.params };
	// 数据总数
	const totalPage = ref(0);
	// 查询状态
	const searching = ref(false);
	// 展示的列表
	const list : Ref<R[]> = ref([]);

	// 整合筛选参数再请求数据
	const submitSearch = (params : SearchParams) => {
		searchParam.value = { ...searchParam.value, ...params };
		getList();
	};

	// 请求数据
	const getList = async () => {
		searching.value = true;
		const res = await getListRequest(searchParam.value);
		if (res) {
			list.value = res.data.data;
			totalPage.value = res.data.totalPage;
		}
		searching.value = false;
	};
	return {
		searchParam,
		totalPage,
		searching,
		list,
		submitSearch,
		getList,
	}
}