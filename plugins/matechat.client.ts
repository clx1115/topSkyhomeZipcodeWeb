import { defineNuxtPlugin } from '#app'
import MateChat from '@matechat/core'
import McMarkdownCard from '@matechat/core'

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.use(MateChat)
  nuxtApp.vueApp.use(McMarkdownCard)
})