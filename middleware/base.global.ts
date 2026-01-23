import { Local } from '@/utils/storage'

const authList = [/\/survey/, /\/dataByZip/, /\/dataByMetro/,/\/PageMarket/,/\/user/, /^\/user\//,/\/dataByPowerbi/,/\/conditionReport\/form/]

export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client) {
    // 认证检查
    if (!Local.get('token') && authList.some(pattern => pattern.test(to.path))) {
      const redirect = encodeURIComponent(to.path)
      return navigateTo(`/login?redirect=${redirect}`)
    }
  }
})