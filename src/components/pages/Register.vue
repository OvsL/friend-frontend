<template>
  <div class="register-page">
    <!-- 注册表单 -->
    <div class="register-container">
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
        <p class="app-subtitle">加入我们，找到志同道合的伙伴</p>
      </div>

      <!-- 注册表单 -->
      <van-form @submit="handleRegister" class="register-form">
        <van-cell-group>
          <van-field
            v-model="registerForm.userName"
            label="用户名"
            placeholder="请输入用户名"
            :rules="[{ required: true, message: '请输入用户名' }]"
            left-icon="user-o"
          />
          
          <van-field
            v-model="registerForm.userAccount"
            label="账号"
            placeholder="请输入账号"
            :rules="[{ required: true, message: '请输入账号' }]"
            left-icon="contact"
          />
          
          <van-field
            v-model="registerForm.userPassword"
            label="密码"
            type="password"
            placeholder="请输入密码"
            :rules="[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码长度至少6位' }
            ]"
            left-icon="lock"
          />
          
          <van-field
            v-model="registerForm.checkPassword"
            label="确认密码"
            type="password"
            placeholder="请再次输入密码"
            :rules="[
              { required: true, message: '请确认密码' },
              { validator: validatePassword, message: '两次输入的密码不一致' }
            ]"
            left-icon="lock"
          />
          
          <van-field
            v-model="registerForm.planetCode"
            label="星球编号"
            placeholder="请输入星球编号（可选）"
            left-icon="star-o"
          />
        </van-cell-group>

        <!-- 注册按钮 -->
        <div class="register-button-section">
          <van-button
            type="primary"
            size="large"
            block
            :loading="loading"
            @click="handleRegister"
          >
            {{ loading ? '注册中...' : '注册' }}
          </van-button>
        </div>

        <!-- 其他选项 -->
        <div class="register-options">
          <van-cell
            title="已有账号？立即登录"
            is-link
            @click="goToLogin"
          />
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import { userApi } from '../../api/user.js'

// 路由实例
const router = useRouter()

// 注册表单数据
const registerForm = reactive({
  userName: '',
  userAccount: '',
  userPassword: '',
  checkPassword: '',
  planetCode: ''
})

// 加载状态
const loading = ref(false)



// 验证密码一致性
const validatePassword = (value) => {
  return value === registerForm.userPassword
}

// 处理注册
const handleRegister = async () => {
  // 表单验证
  if (!registerForm.userName.trim()) {
    showToast('请输入用户名')
    return
  }
  if (!registerForm.userAccount.trim()) {
    showToast('请输入账号')
    return
  }
  if (!registerForm.userPassword.trim()) {
    showToast('请输入密码')
    return
  }
  if (registerForm.userPassword.length < 6) {
    showToast('密码长度至少6位')
    return
  }
  if (registerForm.userPassword !== registerForm.checkPassword) {
    showToast('两次输入的密码不一致')
    return
  }

  loading.value = true

  try {
    // 构建注册数据
    const registerData = {
      userName: registerForm.userName,
      userAccount: registerForm.userAccount,
      userPassword: registerForm.userPassword,
      checkPassword: registerForm.checkPassword,
      planetCode: registerForm.planetCode || undefined
    }
    
    // 调用注册接口
    const response = await userApi.register(registerData)
    
    if (response.data && response.data.code === 0) {
      showSuccessToast('注册成功')
      
      // 跳转到登录页面
      setTimeout(() => {
        router.push('/login')
      }, 1000)
    } else {
      showToast(response.data?.message || '注册失败，请重试')
    }
  } catch (error) {
    console.error('注册失败:', error)
    showToast('注册失败，请重试')
  } finally {
    loading.value = false
  }
}

// 跳转到登录页面
const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-container {
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

.register-form {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.register-button-section {
  margin: 24px 0;
}

.register-options {
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