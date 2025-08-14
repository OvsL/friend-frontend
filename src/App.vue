<script setup lang="ts">
import BasicLayout from "./components/layouts/BasicLayout.vue";
import userStore from "./utils/userStore.js";
import { onMounted, computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

// 初始化用户存储
onMounted(async () => {
  await userStore.init();
});

// 判断是否为登录或注册页面
const isAuthPage = computed(() => {
  return route.path === '/login' || route.path === '/register';
});
</script>

<template>
    <BasicLayout v-if="!isAuthPage" />
    <router-view v-else />
</template>

<style scoped>
.app-container {
    padding: 20px;
    font-family: Arial, sans-serif;
}
</style>
