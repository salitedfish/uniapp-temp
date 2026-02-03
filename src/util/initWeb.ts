import { routes, needLoginRoutes } from "@/store/route"
import { logged } from "@/util/common"
import { Env } from "@/type/env"
import { authList, setUserInfo } from "@/store/auth"
import type { RouteName } from "@/type/route"

export const initWeb = async () => {
  try {
    // 生产环境隐藏测试页面
    if (process.env.NODE_ENV === Env.PROD) {
      uni.setTabBarItem({
        index: 0,
        visible: false,
      })
    }
    // 生产环境隐藏蓝牙
    if (process.env.NODE_ENV === Env.PROD) {
      uni.setTabBarItem({
        index: 1,
        visible: false,
      })
    }

    const root = "/" + import.meta.env.VITE_BASE_PAGE_PATH_WEB
    const path = location.pathname.slice(root.length) // 把前面的根路径去掉
    // 判断页面是否存在
    let name: string = ""
    let key: RouteName
    let exit = false
    for (key in routes) {
      console.log(routes[key].path)
      if (routes[key].path === path) {
        exit = true
        name = key
        break
      }
    }
    // 页面不存在则跳到登录页
    if (!exit) {
      uni.redirectTo({
        url: routes.login.path,
      })
      return
    }
    // 页面存在，并且是需要登录的
    if (needLoginRoutes.includes(path)) {
      // 如果已经登录
      if (logged()) {
        // 登录了获取用户信息
        await setUserInfo()
        // if (!authList.value.includes(name)) {
        // 	// 如果没权限就跳到首页
        // 	uni.switchTab({
        // 		url: routes.home.path
        // 	})
        // }
      }
      // 没登录就去登录
      else {
        uni.redirectTo({
          url: routes.login.path,
        })
      }
    }
  } catch (err) {
    console.log(err)
    // 这里的错误一般是已经登录了，但是获取用户信息的时候，网络异常啥的
    uni.switchTab({
      url: routes.home.path,
    })
    uni.showToast({
      title: "网络异常",
      icon: "none",
      duration: 3000,
    })
  } finally {
    console.log("App Launch")
  }
}
