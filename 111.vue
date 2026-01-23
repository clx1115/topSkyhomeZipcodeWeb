<template>
  <div class="error-page">
    <div class="error">
      <img src="@/assets/images/404.png">
      <div class="title">This page seems to be lost!</div>
      <NuxtLink class="error-link" to="/">GO HOME</NuxtLink>
    </div>
  </div>
</template>
<script lang="ts" setup>


</script>
<style lang="scss" scoped>
.error-page {
  padding: 1rem;
  background: #f7f8fb;
  color: #47494e;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-family: sans-serif;
  font-weight: 100 !important;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -webkit-font-smoothing: antialiased;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  .error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 960px;
  }

  .title {
    font-size: 1.5rem;
    margin-top: 15px;
    color: #47494e;
    margin-bottom: 8px;
  }
}

.error-link {
  display: block;
  margin-top: 24px;
  padding: 14px 24px;
  font-size: 18px;
  color: #fff;
  border-radius: 5px;
  background: #409EFF;
  text-decoration: none;
}
</style>