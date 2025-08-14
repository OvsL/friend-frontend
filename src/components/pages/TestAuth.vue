<template>
  <div class="test-auth-page">
    <van-nav-bar title="认证测试" />
    
    <div class="test-container">
      <h3>认证功能测试</h3>
      
      <van-cell-group title="登录状态">
        <van-cell title="是否已登录" :value="isLoggedIn ? '是' : '否'" />
        <van-cell title="Token" :value="token || '无'" />
        <van-cell title="用户信息" :value="userInfoText" />
      </van-cell-group>
      
      <van-cell-group title="测试操作">
        <van-cell title="检查登录状态" is-link @click="checkLoginStatus" />
        <van-cell title="设置模拟登录" is-link @click="setMockLogin" />
        <van-cell title="清除登录信息" is-link @click="clearLoginData" />
        <van-cell title="测试网络连接" is-link @click="testNetworkConnection" />
        <van-cell title="测试获取当前用户API" is-link @click="testGetCurrentUser" />
        <van-cell title="测试Session设置" is-link @click="testSessionSetup" />
        <van-cell title="跳转到个人页面" is-link @click="goToUserPage" />
        <van-cell title="检查当前登录状态" is-link @click="checkCurrentLoginStatus" />
      </van-cell-group>
      
      <div class="test-results" v-if="testResult">
        <h4>测试结果:</h4>
        <pre>{{ JSON.stringify(testResult, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { showToast } from 'vant'
import { isLoggedIn, getCurrentUser, getToken } from '../../utils/auth.js'
import { debugLoginStatus, mockLoginData, clearAllAuthData } from '../../utils/debug.js'
import { userApi } from '../../api/user.js'
import userStore from '../../utils/userStore.js'

const testResult = ref(null)

// 计算属性
const token = computed(() => getToken())
const userInfoText = computed(() => {
  const user = getCurrentUser()
  return user ? `${user.userName} (ID: ${user.id})` : '无'
})

// 检查登录状态
const checkLoginStatus = () => {
  debugLoginStatus()
  testResult.value = {
    isLoggedIn: isLoggedIn(),
    token: getToken(),
    userInfo: getCurrentUser(),
    currentPath: window.location.pathname
  }
  showToast('已检查登录状态，请查看下方结果')
}

// 设置模拟登录
const setMockLogin = () => {
  mockLoginData()
  showToast('已设置模拟登录数据')
  setTimeout(() => {
    checkLoginStatus()
  }, 100)
}

// 清除登录数据
const clearLoginData = () => {
  clearAllAuthData()
  showToast('已清除登录数据')
  setTimeout(() => {
    checkLoginStatus()
  }, 100)
}

// 测试网络连接
const testNetworkConnection = async () => {
  try {
    showToast('正在测试网络连接...')
    
    // 测试后端API连接
    const response = await fetch('http://localhost:8080/api/user/current', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken() || ''}`
      }
    })
    
    testResult.value = {
      success: response.ok,
      message: response.ok ? '网络连接正常' : '网络连接失败',
      status: response.status,
      statusText: response.statusText,
      url: response.url
    }
    
    if (response.ok) {
      showToast('网络连接正常')
    } else {
      showToast('网络连接失败')
    }
  } catch (error) {
    testResult.value = {
      success: false,
      message: '网络连接失败',
      error: error.message,
      details: '可能是后端服务未启动或网络问题'
    }
    showToast('网络连接失败')
  }
}

// 测试获取当前用户API
const testGetCurrentUser = async () => {
  try {
    showToast('正在测试获取当前用户API...')
    const response = await userApi.getCurrentUser()
    
    console.log('API测试响应:', response)
    console.log('响应数据结构:', {
      hasResponse: !!response,
      hasData: !!response?.data,
      responseType: typeof response?.data,
      responseKeys: response?.data ? Object.keys(response.data) : [],
      fullResponse: response?.data
    })
    
    // 分析响应格式
    let userData = null
    let formatType = 'unknown'
    let isError = false
    let errorMessage = ''
    
    if (response && response.data) {
      // 格式1: { code: 0, data: userData, message: "success" }
      if (response.data.code === 0 && response.data.data) {
        userData = response.data.data
        formatType = 'standard'
      }
      // 格式2: 直接返回用户对象 { id: 1, userName: "xxx", ... }
      else if (response.data.id || response.data.userName) {
        userData = response.data
        formatType = 'direct'
      }
      // 格式3: 错误响应 { code: -40000, msg: "请求参数错误", data: null }
      else if (response.data.code && response.data.code !== 0) {
        formatType = 'error'
        isError = true
        errorMessage = response.data.msg || response.data.message || '未知错误'
      }
      // 格式4: 其他可能的格式
      else {
        formatType = 'unknown'
        if (typeof response.data === 'object') {
          userData = response.data
        }
      }
    }
    
    testResult.value = {
      success: !isError,
      response: response.data,
      status: response.status,
      message: isError ? 'API返回错误' : 'API调用成功',
      userData: userData,
      formatType: formatType,
      isError: isError,
      errorMessage: errorMessage,
      analysis: {
        hasResponse: !!response,
        hasData: !!response?.data,
        responseType: typeof response?.data,
        responseKeys: response?.data ? Object.keys(response.data) : [],
        expectedCode: response?.data?.code,
        hasUserData: !!userData,
        formatDetected: formatType,
        isErrorResponse: isError
      }
    }
    showToast(isError ? 'API返回错误' : 'API测试成功')
  } catch (error) {
    console.error('API测试失败:', error)
    testResult.value = {
      success: false,
      error: {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      },
      message: 'API调用失败',
      analysis: {
        hasResponse: !!error.response,
        hasData: !!error.response?.data,
        errorType: error.name,
        errorMessage: error.message
      }
    }
    showToast('API测试失败，请查看结果')
  }
}

// 测试Session设置
const testSessionSetup = () => {
  showToast('正在测试Session设置...')
  // 模拟设置Session
  localStorage.setItem('sessionToken', 'test-session-token-123')
  localStorage.setItem('sessionUser', JSON.stringify({ id: 1, userName: 'TestUser' }))
  localStorage.setItem('sessionExpiry', Date.now() + 3600000) // 1小时后过期
  
  showToast('已设置模拟Session数据')
  setTimeout(() => {
    checkLoginStatus()
  }, 100)
}

// 检查当前登录状态
const checkCurrentLoginStatus = () => {
  const token = localStorage.getItem('token')
  const userInfo = localStorage.getItem('userInfo')
  const currentUser = userStore.getUser()
  
  console.log('=== 当前登录状态检查 ===')
  console.log('localStorage token:', token)
  console.log('localStorage userInfo:', userInfo)
  console.log('userStore currentUser:', currentUser)
  
  let parsedUserInfo = null
  if (userInfo) {
    try {
      parsedUserInfo = JSON.parse(userInfo)
    } catch (error) {
      console.error('解析userInfo失败:', error)
    }
  }
  
  console.log('解析后的userInfo:', parsedUserInfo)
  
  const isLoggedInFromAuth = isLoggedIn()
  const isLoggedInFromStore = currentUser && currentUser.id && currentUser.id !== 0
  
  console.log('isLoggedIn() 结果:', isLoggedInFromAuth)
  console.log('userStore 登录状态:', isLoggedInFromStore)
  
  // 检查状态一致性
  const isConsistent = isLoggedInFromAuth === isLoggedInFromStore
  console.log('状态一致性:', isConsistent)
  
  if (!isConsistent) {
    console.warn('警告：localStorage和userStore状态不一致！')
  }
  
  showToast(`登录状态: ${isLoggedInFromAuth ? '已登录' : '未登录'} (${isConsistent ? '一致' : '不一致'})`)
  
  // 更新测试结果
  testResult.value = {
    localStorage: {
      token: token,
      userInfo: parsedUserInfo
    },
    userStore: {
      currentUser: currentUser
    },
    authCheck: {
      isLoggedInFromAuth: isLoggedInFromAuth,
      isLoggedInFromStore: isLoggedInFromStore,
      isConsistent: isConsistent
    }
  }
}

import { useRouter } from 'vue-router'

// 路由实例
const router = useRouter()

// 跳转到个人页面
const goToUserPage = () => {
  router.push('/user')
}

// 页面加载时检查状态
onMounted(() => {
  checkLoginStatus()
})
</script>

<style scoped>
.test-auth-page {
  padding: 20px;
}

.test-container {
  max-width: 600px;
  margin: 0 auto;
}

.test-results {
  margin-top: 20px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.test-results pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 12px;
  color: #333;
}
</style> 