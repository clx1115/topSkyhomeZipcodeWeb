
/**
 * cookie 浏览器临时缓存
 * @method set 设置临时缓存
 * @method get 获取临时缓存
 * @method remove 移除临时缓存
 */
export const Cookie = {
	// 设置临时缓存
	set(key: string, val: any) {
		const cookieValue = useCookie(key);
		cookieValue.value = val
	},
	// 获取临时缓存
	get(key: string) {
		const cookieValue = useCookie(key);
		return cookieValue.value || '';
	},
	// 移除临时缓存
	remove(key: string) {
		const cookieValue = useCookie(key);
		cookieValue.value = undefined || null
	}
};

/**
 * window.localStorage 浏览器永久缓存
 * @method set 设置永久缓存
 * @method get 获取永久缓存
 * @method remove 移除永久缓存
 * @method clear 移除全部永久缓存
 */
export const Local = {
	// 设置永久缓存
	set(key: string, val: any) {
		window.localStorage.setItem(key, val)
	},
	// 获取永久缓存
	get(key: string) {
		return window.localStorage.getItem(key)
	},
	// 设置永久缓存
	setJson(key: string, val: any) {
		window.localStorage.setItem(key, JSON.stringify(val))
	},
	// 获取永久缓存
	getJson(key: string) {
		const json: any = window.localStorage.getItem(key)
		return JSON.parse(json)
	},
	// 移除永久缓存
	remove(key: string) {
		window.localStorage.removeItem(key)
	},
	// 移除全部永久缓存
	clear() {
		window.localStorage.clear()
	},
}