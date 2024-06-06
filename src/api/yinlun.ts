import { jsonp } from "./jsonp";

/**
 * 银轮获取用户信息
 */
export const getInfo = async (data : Obj) => {
	return await <Promise<Obj>>jsonp("login/getInfo", data)
};