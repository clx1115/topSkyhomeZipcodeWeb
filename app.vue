<template>
	<el-config-provider :locale="locale">
		<NuxtLayout>
			<NuxtPage></NuxtPage>
		</NuxtLayout>
	</el-config-provider>
</template>
<script setup lang="ts">
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
//引入vue方法
import { ElConfigProvider } from 'element-plus'
//中文包
import zhCn from 'element-plus/es/locale/lang/en'
const nuxtApp = useNuxtApp()
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
	nuxtApp.vueApp.component(key, component)
}
let locale = zhCn
const user = useStore.user()

onMounted(async () => {
	if (Local.get('token')) {
		user.setUserInfo()
	}
});
</script>
