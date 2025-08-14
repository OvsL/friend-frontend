<template>
  <div class="login-page">
    <!-- 登录表单 -->
    <div class="login-container">
      <!-- Logo区域 -->
      <div class="logo-section">
        <van-image
          src="https://img.yzcdn.cn/vant/cat.jpeg"
          width="80"
          height="80"
          round
          fit="cover"
        />
        <h2 class="app-title">星球项目</h2>
        <p class="app-subtitle">找到志同道合的伙伴</p>
      </div>

      <!-- 登录表单 -->
      <van-form @submit="handleLogin" class="login-form">
        <van-cell-group>
          <van-field
            v-model="loginForm.userAccount"
            label="账号"
            placeholder="请输入账号"
            :rules="[{ required: true, message: '请输入账号' }]"
            left-icon="user-o"
          />
          
          <van-field
            v-model="loginForm.userPassword"
            label="密码"
            type="password"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请输入密码' }]"
            left-icon="lock"
          />
        </van-cell-group>

        <!-- 登录按钮 -->
        <div class="login-button-section">
          <van-button
            type="primary"
            size="large"
            block
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </van-button>
        </div>

        <!-- 其他选项 -->
        <div class="login-options">
          <van-cell
            title="注册新账号"
            is-link
            @click="goToRegister"
          />
          <van-cell
            title="忘记密码"
            is-link
            @click="goToForgetPassword"
          />
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import { userApi } from '../../api/user.js'
import { saveUserInfo } from '../../utils/auth.js'
import userStore from '../../utils/userStore.js'

// 路由实例
const router = useRouter()
const route = useRoute()

// 登录表单数据
const loginForm = reactive({
  userAccount: '',
  userPassword: ''
})

// 加载状态
const loading = ref(false)

// 获取重定向路径
const getRedirectPath = () => {
  return route.query.redirect || '/home'
}



// 处理登录
const handleLogin = async () => {
  // 表单验证
  if (!loginForm.userAccount.trim()) {
    showToast('请输入账号')
    return
  }
  if (!loginForm.userPassword.trim()) {
    showToast('请输入密码')
    return
  }

  loading.value = true

  try {
    // 调用登录接口
    const response = await userApi.login(loginForm)
    
    console.log('登录响应:', response)
    
    if (response.data && response.data.code === 0) {
      // 登录成功
      const userData = response.data.data
      
      console.log('用户数据:', userData)
      
      // 保存用户信息到本地存储
      const token = userData.token || response.headers?.authorization || 'mock-token-' + Date.now()
      
      console.log('保存用户信息:', userData)
      console.log('保存token:', token)
      
      saveUserInfo(userData, token)
      
      // 更新用户状态
      userStore.updateUser(userData)
      
      // 登录成功后，立即调用getCurrentUser接口确保session正确设置
      try {
        console.log('登录成功后，验证session设置...')
        const currentUserResponse = await userApi.getCurrentUser()
        console.log('验证session响应:', currentUserResponse)
        
        if (currentUserResponse.data && currentUserResponse.data.code === 0) {
          console.log('session设置成功')
          showSuccessToast('登录成功')
        } else {
          console.warn('session设置可能有问题:', currentUserResponse.data)
          showSuccessToast('登录成功，但session验证失败')
        }
      } catch (sessionError) {
        console.error('session验证失败:', sessionError)
        showSuccessToast('登录成功，但session验证失败')
      }
      
      // 跳转到目标页面或首页
      setTimeout(() => {
        const redirectPath = getRedirectPath()
        router.push(redirectPath)
      }, 1000)
    } else {
      showToast(response.data?.message || '登录失败，请检查账号密码')
    }
  } catch (error) {
    console.error('登录失败:', error)
    showToast('登录失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}

// 跳转到注册页面
const goToRegister = () => {
  router.push('/register')
}

// 跳转到忘记密码页面
const goToForgetPassword = () => {
  showToast('忘记密码功能开发中...')
  // 这里可以跳转到忘记密码页面
  // window.location.href = '/forget-password'
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-container {
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.logo-section {
  text-align: center;
  margin-bottom: 40px;
}

.app-title {
  margin: 16px 0 8px;
  color: white;
  font-size: 24px;
  font-weight: 600;
}

.app-subtitle {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.login-form {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.login-button-section {
  margin: 24px 0;
}

.login-options {
  margin-top: 16px;
}

:deep(.van-field__label) {
  color: #646566;
  font-weight: 500;
}

:deep(.van-field__control) {
  color: #323233;
}

:deep(.van-button--primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}

:deep(.van-cell) {
  padding: 12px 0;
}

:deep(.van-cell__title) {
  color: #1989fa;
  font-size: 14px;
}
</style> 