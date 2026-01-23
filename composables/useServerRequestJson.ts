import { stringify } from "querystring";

type UrlType = string | Request | Ref<string | Request> | (() => string | Request);

const request = async (url: UrlType, options?: any,headers?: any) => {
  const customHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  }
  const reqUrl = useRuntimeConfig().public.baseUrl + url
  const { data, error } = await useFetch(reqUrl as string, { ...options, headers: customHeaders })
  console.log('back', data.value, error.value, reqUrl)
  // return data
  let result = data.value as any
  if (!(result !== null && typeof result === 'object')) {
    result = JSON.parse(result)
  }
  
  console.log('back2', process.client)
  if (error.value || !result || (result && result.code !== 200)) {
    if (result) {
      ElNotification({
        title: 'Error',
        message: result.message || 'Server error',
        type: 'error',
        duration: 3000
      })
    }
    if (process.client) {
      return Promise.reject(result)
    }
    throw createError({
      statusCode: 500,
      statusMessage: '',
      message: error.value?.message || 'Server error',
    })
  }
  return result 
};

export const useServerRequestJson = {
  get: (url: UrlType, params?: any) => {
    return request(url, { method: 'GET', params });
  },
  post: (url: UrlType, body?: any) => {
    let formData = new FormData();
    for (let key in body) {
      formData.append(key, body[key]);
    }
    return request(url, { method: 'POST', body });
  },
};

