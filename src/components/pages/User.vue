<template>
  <div class="user-page">
    <!-- 用户头像和基本信息区域 -->
    <div class="user-header">
      <div class="avatar-section">
        <van-image
          :src="avatarUrl"
          width="80"
          height="80"
          round
          fit="cover"
        />
        <div class="user-info">
          <h2 class="username">{{ user.userName || '未设置用户名' }}</h2>
          <p class="user-account">账号：{{ user.userAccount }}</p>
        </div>
      </div>
    </div>

    <!-- 个人信息列表 -->
    <div class="info-section">
      <van-cell-group title="基本信息">
        <van-cell title="用户名" :value="user.userName || '未设置'" />
        <van-cell title="性别" :value="genderText" />
        <van-cell title="注册时间" :value="formattedCreateTime" />
      </van-cell-group>

      <van-cell-group title="联系方式">
        <van-cell title="手机号码" :value="user.phone || '未设置'" />
        <van-cell title="邮箱地址" :value="user.email || '未设置'" />
      </van-cell-group>

      <van-cell-group title="个人简介">
        <van-cell title="个人简介" :value="user.profile || '暂无简介'" />
      </van-cell-group>

      <van-cell-group title="账号信息">
        <van-cell title="用户ID" :value="user.id.toString()" />
        <van-cell title="账号状态" value="正常" />
      </van-cell-group>
    </div>

    <!-- 操作按钮 -->
    <div class="action-section">
      <van-button type="primary" block @click="editProfile">
        编辑资料
      </van-button>
      <van-button type="default" block @click="refreshUserInfo">
        刷新信息
      </van-button>
      <van-button type="default" block @click="changePassword">
        修改密码
      </van-button>
      <van-button type="default" block @click="debugAuth">
        调试登录状态
      </van-button>
      <van-button type="danger" block @click="logout">
        退出登录
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { getCurrentUser, logout as logoutUser, checkAuth } from '../../utils/auth.js'
import userStore from '../../utils/userStore.js'
import { debugLoginStatus } from '../../utils/debug.js'
import { DEFAULT_AVATAR_URL, GENDER_TEXT_MAP } from '../../utils/constants.js'

// 用户信息
const user = userStore.getUser()

// 用户信息更新监听器
const userUpdateListener = (updatedUser) => {
  // 用户信息已通过响应式更新，无需手动更新
  console.log('用户信息已更新:', updatedUser)
}

// 页面加载时初始化
onMounted(async () => {
  // 检查登录状态
  const isLoggedIn = checkAuth()
  if (!isLoggedIn) {
    console.log('用户未登录，无法访问个人页面')
    return
  }
  
  // 初始化用户状态
  userStore.init()
  
  // 尝试从服务器获取最新用户信息
  try {
    await userStore.fetchCurrentUser()
  } catch (error) {
    console.error('获取最新用户信息失败:', error)
  }
  
  // 添加用户信息更新监听器
  userStore.addListener(userUpdateListener)
})

// 页面卸载时移除监听器
onUnmounted(() => {
  userStore.removeListener(userUpdateListener)
})

// 计算属性：头像URL，带默认值
const avatarUrl = computed(() => {
  return user.avatarUrl || DEFAULT_AVATAR_URL
})

// 计算属性：格式化性别显示
const genderText = computed(() => {
  return GENDER_TEXT_MAP[user.gender] || '保密'
})

// 计算属性：格式化注册时间
const formattedCreateTime = computed(() => {
  return formatDate(user.createTime)
})

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

import { useRouter } from 'vue-router'

// 路由实例
const router = useRouter()

// 编辑资料
const editProfile = () => {
  router.push('/user/edit')
}

// 刷新用户信息
const refreshUserInfo = async () => {
  try {
    const userData = await userStore.fetchCurrentUser()
    if (userData) {
      showToast('用户信息已刷新')
    } else {
      showToast('刷新失败，请重试')
    }
  } catch (error) {
    console.error('刷新用户信息失败:', error)
    showToast('刷新失败，请重试')
  }
}

// 调试登录状态
const debugAuth = () => {
  debugLoginStatus()
  showToast('请查看控制台调试信息')
}

// 修改密码
const changePassword = () => {
  showToast('修改密码功能开发中...')
}

// 退出登录
const logout = async () => {
  try {
    await showConfirmDialog({
      title: '确认退出',
      message: '确定要退出登录吗？'
    })
    
    logoutUser()
  } catch (error) {
    // 用户取消退出
  }
}
</script>

<style scoped>
.user-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 20px;
}

.user-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px 30px;
  color: white;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  flex: 1;
}

.username {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.user-account {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.info-section {
  margin-top: -20px;
  padding: 0 16px;
}

.action-section {
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

:deep(.van-cell-group__title) {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin: 16px 0 8px;
}

:deep(.van-cell) {
  padding: 16px 0;
}

:deep(.van-cell__title) {
  color: #646566;
}

:deep(.van-cell__value) {
  color: #323233;
}
</style>
