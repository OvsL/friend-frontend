<template>
    <van-nav-bar
        v-if="!isSearchPage && !isAuthPage"
        title="标题"
        left-arrow
        @click-left="onClickLeft"
        @click-right="onClickRight"
    >
    <template #right>
        <van-icon name="search" size="18" />
    </template> 
    </van-nav-bar>

    <div id ="content">
        <router-view />
    </div>

    <van-tabbar v-if="!isAuthPage" route v-model="active" >
    <van-tabbar-item replace to="/" icon="home-o" name="index">主页</van-tabbar-item>
    <van-tabbar-item replace to="/team" icon="search" name="team">组队</van-tabbar-item>
    <van-tabbar-item replace to="/user" icon="friends-o" name="user">个人</van-tabbar-item>
    </van-tabbar>
    
</template>





<script setup lang="ts">
import { showToast } from 'vant';
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const isSearchPage = computed(() => route.path === '/searchTag');
const isAuthPage = computed(() => route.path === '/login' || route.path === '/register');

const onClickLeft = () => alert('点击左侧按钮');
const onClickRight = () => router.push('/searchTag');
const active = ref('index');
    

</script>

<style scoped>
.van-nav-bar {
    background-color: #f8f8f8;
    color: #333;
}
</style>
