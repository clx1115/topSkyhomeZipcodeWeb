import { Local } from '@/utils/storage'
import { user } from "./store/user/index"
type UrlType = string | Request | Ref<string | Request> | (() => string | Request);

const request = async (url: UrlType, options?: any, headers?: any) => {
  const token = Local.get('token')
  const customHeaders = {
    ...headers,
    ...(token && { Authorization: `Bearer ${token}` }),
    // ...{'credentials': 'include'}
  }
  console.log('customHeaders', customHeaders)
  const reqUrl = url
  const data = await $fetch(reqUrl as string, { ...options, headers: customHeaders })
  let result = data as any
  console.log('client request', data)
  if (!(result !== null && typeof result === 'object')) {
    result = JSON.parse(result)
  }
  
  // Support both 'code' and 'status' fields for success check
  const statusCode = result.code !== undefined ? result.code : result.status;
  
  if (result && statusCode !== 200) {
    if (result) {
      if (result.status === 1002) {
        const userStore = user();
        userStore.resetToken()
        navigateTo('/login')
      } else {
        ElNotification({
          title: 'Error',
          message: result.message || 'Server error',
          type: 'error',
          duration: 3000
        })
      }
    }
    if (process.client) {
      return Promise.reject(result)
    }
  }
  return result
};

export const useClientRequestDirect = {
  get: (url: UrlType, params?: any) => {
    return request(url, { method: 'GET', params });
  },
  post: (url: UrlType, body?: any) => {
    return request(url, { method: 'POST', body });
  },
  upload: (url: UrlType, body?: any) => {
    return request(url, { method: 'POST', body });
  },
  put: (url: UrlType, body?: any) => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    const formData = Object.entries(body)
    .map(([key, value]) => {
        const encodedValue = value === null ? '' : encodeURIComponent(value as string | number | boolean);
        return encodeURIComponent(key) + '=' + encodedValue;
    })
    .join('&');
    return request(url, { method: 'PUT', body:formData },headers);
  },
  delete: (url: UrlType, body?: any) => {
    return request(url, { method: 'DELETE', body });
  },
};

