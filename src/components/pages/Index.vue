<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { showToast } from 'vant'
import { getCurrentUser } from '../../utils/auth.js'
import userStore from '../../utils/userStore.js'
import { userApi } from '../../api/user.js'
import { DEFAULT_AVATAR_URL, GENDER_TEXT_MAP } from '../../utils/constants.js'

// 当前用户信息
const currentUser = userStore.getUser()

// 推荐用户列表
const recommendUsers = ref([])
const loadingRecommend = ref(false)
const pageLoaded = ref(false)
const pageNum = ref(1)
const pageSize = ref(10)

// 用户信息更新监听器
const userUpdateListener = (updatedUser) => {
  // 用户信息已通过响应式更新，无需手动更新
  console.log('首页用户信息已更新:', updatedUser)
}

// 获取推荐用户
const fetchRecommendUsers = async () => {
  loadingRecommend.value = true
  try {
    const response = await userApi.getRecommendUsers(pageNum.value, pageSize.value)
    console.log('推荐用户响应:', response)
    
    if (response.data && response.data.code === 0) {
      // 处理推荐用户数据
      recommendUsers.value = response.data.data.map(user => ({
        id: user.id,
        userName: user.userName || '未设置用户名',
        userAccount: user.userAccount,
        avatarUrl: user.avatarUrl || DEFAULT_AVATAR_URL,
        gender: GENDER_TEXT_MAP[user.gender] || '保密',
        tags: parseUserTags(user.tags),
        profile: user.profile || '暂无简介'
      }))
    } else {
      console.error('获取推荐用户失败:', response.data?.message)
    }
  } catch (error) {
    console.error('获取推荐用户失败:', error)
    showToast('获取推荐用户失败')
  } finally {
    loadingRecommend.value = false
  }
}

// 解析用户标签
const parseUserTags = (tagsString) => {
  if (!tagsString) return []
  
  try {
    const tagsArray = JSON.parse(tagsString)
    return Array.isArray(tagsArray) ? tagsArray : []
  } catch (error) {
    console.error('解析标签失败:', error)
    return []
  }
}

// 页面加载时初始化
onMounted(async () => {
  console.log('Index页面开始初始化...')
  
  // 初始化用户状态
  try {
    await userStore.init()
    console.log('用户存储初始化完成')
  } catch (error) {
    console.error('用户存储初始化失败:', error)
  }
  
  // 只有在用户已登录时才尝试获取最新用户信息
  const currentUser = userStore.getUser()
  const isLoggedIn = currentUser && currentUser.id && currentUser.id !== 0
  console.log('首页检查登录状态:', isLoggedIn, currentUser)
  
  if (isLoggedIn) {
    try {
      console.log('开始获取最新用户信息...')
      const userData = await userStore.fetchCurrentUser()
      console.log('获取用户信息结果:', userData)
    } catch (error) {
      console.error('获取最新用户信息失败:', error)
      // 不要因为获取最新信息失败而清除本地存储的用户信息
      // 保持用户登录状态，使用本地存储的信息
    }
  } else {
    console.log('用户未登录，跳过获取最新用户信息')
  }
  
  // 获取推荐用户
  await fetchRecommendUsers()
  
  // 添加用户信息更新监听器
  userStore.addListener(userUpdateListener)
  
  // 页面加载完成
  setTimeout(() => {
    pageLoaded.value = true
  }, 300)
  
  console.log('Index页面初始化完成')
})

// 页面卸载时移除监听器
onUnmounted(() => {
  userStore.removeListener(userUpdateListener)
})

import { useRouter } from 'vue-router'

// 路由实例
const router = useRouter()

// 跳转到登录页面
const goToLogin = () => {
  router.push('/login')
}

// 跳转到搜索页面
const goToSearch = () => {
  router.push('/searchTag')
}

// 跳转到标签搜索页面
const goToSearchTag = () => {
  router.push('/searchTag')
}

// 跳转到团队页面
const goToTeam = () => {
  router.push('/team')
}

// 查看用户详情
const viewUserDetail = (userId) => {
  router.push(`/user/${userId}`)
}
</script>

<template>
  <div class="index-page">
    <!-- 页面头部 -->
    <van-nav-bar
      title="星球项目"
    />

    <!-- 用户信息卡片 -->
    <div class="user-card" v-if="currentUser">
      <div class="user-info">
        <van-image
          :src="currentUser.avatarUrl || DEFAULT_AVATAR_URL"
          width="60"
          height="60"
          round
          fit="cover"
          class="user-avatar"
        />
        <div class="user-details">
          <h3 class="user-name">{{ currentUser.userName || '未设置用户名' }}</h3>
          <p class="user-account">{{ currentUser.userAccount }}</p>
        </div>
      </div>
    </div>

    <!-- 未登录提示 -->
    <div class="login-prompt" v-else>
      <van-empty description="请先登录" class="login-empty">
        <van-button type="primary" @click="goToLogin" size="large">立即登录</van-button>
      </van-empty>
    </div>

    <!-- 功能导航 -->
    <div class="nav-section" v-if="currentUser">
      <van-cell-group title="功能导航" class="nav-group">
        <van-cell
          title="搜索用户"
          icon="search"
          is-link
          @click="goToSearch"
          class="nav-cell"
        />
        <van-cell
          title="标签搜索"
          icon="tag-o"
          is-link
          @click="goToSearchTag"
          class="nav-cell"
        />
        <van-cell
          title="我的团队"
          icon="friends-o"
          is-link
          @click="goToTeam"
          class="nav-cell"
        />
        <van-cell
          title="团队功能测试"
          icon="setting-o"
          is-link
          @click="router.push('/test-team')"
          class="nav-cell"
        />
      </van-cell-group>
    </div>

    <!-- 推荐用户 -->
    <div class="recommend-section">
      <van-cell-group title="推荐用户" class="recommend-group">
        <van-loading v-if="loadingRecommend" style="text-align: center; padding: 20px;">
          加载中...
        </van-loading>
        
        <div v-else-if="recommendUsers.length === 0" style="text-align: center; padding: 20px; color: #969799;">
          暂无推荐用户
        </div>
        
        <van-cell
          v-else
          v-for="user in recommendUsers"
          :key="user.id"
          clickable
          @click="viewUserDetail(user.id)"
          class="recommend-cell"
        >
          <template #icon>
            <van-image
              :src="user.avatarUrl"
              width="40"
              height="40"
              round
              fit="cover"
              style="margin-right: 12px;"
              class="recommend-avatar"
            />
          </template>
          
          <template #title>
            <div class="recommend-user-info">
              <h3 class="recommend-user-name">{{ user.userName }}</h3>
              <p class="recommend-user-account">{{ user.userAccount }}</p>
              <p class="recommend-user-gender">性别：{{ user.gender }}</p>
            </div>
          </template>
          
          <template #label>
            <div class="recommend-user-tags">
              <van-tag
                v-for="(tag, index) in user.tags"
                :key="index"
                size="small"
                type="primary"
                style="margin-right: 4px; margin-bottom: 4px;"
                class="user-tag"
              >
                {{ tag }}
              </van-tag>
            </div>
            <p class="recommend-user-profile">{{ user.profile }}</p>
          </template>
        </van-cell>
      </van-cell-group>
    </div>
  </div>
</template>

<style scoped>
.index-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 20px;
  opacity: 0;
  animation: fadeIn 0.5s ease-in-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-card {
  background: rgba(255, 255, 255, 0.95);
  margin: 16px;
  padding: 20px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  animation: slideInUp 0.6s ease-out 0.2s both;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.user-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.user-avatar {
  transition: transform 0.3s ease;
}

.user-card:hover .user-avatar {
  transform: scale(1.05);
}

.user-details {
  margin-left: 16px;
}

.user-name {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 600;
  color: #323233;
}

.user-account {
  margin: 0;
  font-size: 14px;
  color: #969799;
}

.login-prompt {
  padding: 60px 20px;
  text-align: center;
}

.nav-section {
  margin: 16px;
  animation: slideInUp 0.6s ease-out 0.4s both;
}

.nav-section :deep(.van-cell-group) {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.nav-section :deep(.van-cell-group):hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.nav-cell {
  transition: background-color 0.3s ease;
}

.nav-cell:hover {
  background-color: rgba(25, 137, 250, 0.05);
}

.recommend-section {
  margin: 16px;
  animation: slideInUp 0.6s ease-out 0.6s both;
}

.recommend-section :deep(.van-cell-group) {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.recommend-section :deep(.van-cell-group):hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.recommend-cell {
  transition: all 0.3s ease;
}

.recommend-cell:hover {
  background-color: rgba(25, 137, 250, 0.05);
  transform: translateX(4px);
}

.recommend-avatar {
  transition: transform 0.3s ease;
}

.recommend-cell:hover .recommend-avatar {
  transform: scale(1.1);
}

.recommend-user-info {
  margin-left: 12px;
  flex: 1;
}

.recommend-user-name {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.recommend-user-account {
  margin: 0 0 2px;
  font-size: 14px;
  color: #969799;
}

.recommend-user-gender {
  margin: 0 0 4px;
  font-size: 12px;
  color: #646566;
}

.recommend-user-tags {
  margin: 4px 0;
}

.recommend-user-profile {
  margin: 4px 0 0;
  font-size: 12px;
  color: #969799;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

:deep(.van-nav-bar) {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

:deep(.van-nav-bar__title) {
  color: #323233;
  font-weight: 600;
  font-size: 18px;
}

:deep(.van-nav-bar__text) {
  color: #1989fa;
  font-weight: 500;
}

:deep(.van-cell-group__title) {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin: 20px 0 12px;
  padding: 0 20px;
}

:deep(.van-cell) {
  padding: 16px 20px;
  background: transparent;
}

:deep(.van-cell__title) {
  color: #323233;
  font-weight: 500;
}

:deep(.van-cell__icon) {
  color: #1989fa;
  font-size: 18px;
}

:deep(.van-cell__value) {
  color: #969799;
}

:deep(.van-tag) {
  border-radius: 12px;
  font-size: 11px;
  padding: 2px 8px;
}

.user-tag {
  transition: all 0.3s ease;
}

.user-tag:hover {
  transform: scale(1.1);
}

:deep(.van-button--primary) {
  border-radius: 12px;
  font-weight: 500;
}

:deep(.van-button--small) {
  border-radius: 8px;
  font-size: 12px;
  padding: 4px 12px;
}

:deep(.van-empty) {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  margin: 16px;
  padding: 40px 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

:deep(.van-loading) {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  margin: 16px;
  padding: 40px 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>
