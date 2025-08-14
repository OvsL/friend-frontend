import { reactive } from 'vue'
import { getCurrentUser } from './auth.js'
import { DEFAULT_USER_INFO } from './constants.js'
import { userApi } from '../api/user.js'

// 用户状态管理
class UserStore {
  constructor() {
    this.user = reactive({ ...DEFAULT_USER_INFO })
    
    this.listeners = []
  }

  // 初始化用户信息
  async init() {
    const currentUser = getCurrentUser()
    if (currentUser) {
      Object.assign(this.user, currentUser)
      console.log('从本地存储加载用户信息:', currentUser)
      
      // 尝试从服务器获取最新的用户信息
      try {
        await this.fetchCurrentUser()
      } catch (error) {
        console.warn('初始化时获取用户信息失败，可能用户未登录或网络问题:', error)
      }
    } else {
      console.log('本地存储中无用户信息，跳过服务器获取')
      // 清除用户状态，确保状态一致
      this.clearUser()
    }
  }

  // 从服务器获取当前用户信息
  async fetchCurrentUser() {
    try {
      console.log('开始获取当前用户信息...')
      const response = await userApi.getCurrentUser()
      console.log('API响应:', response)
      console.log('响应数据结构:', {
        hasResponse: !!response,
        hasData: !!response?.data,
        responseType: typeof response?.data,
        responseKeys: response?.data ? Object.keys(response.data) : [],
        fullResponse: response?.data
      })
      
      // 检查多种可能的响应格式
      let userData = null
      
      if (response && response.data) {
        // 格式1: { code: 0, data: userData, message: "success" }
        if (response.data.code === 0 && response.data.data) {
          userData = response.data.data
          console.log('格式1 - 标准响应格式:', userData)
        }
        // 格式2: 直接返回用户对象 { id: 1, userName: "xxx", ... }
        else if (response.data.id || response.data.userName) {
          userData = response.data
          console.log('格式2 - 直接用户对象:', userData)
        }
        // 格式3: 错误响应 { code: -40000, msg: "请求参数错误", data: null }
        else if (response.data.code && response.data.code !== 0) {
          console.error('后端返回错误:', response.data)
          // 只有在明确表示用户未登录时才清除本地用户信息
          if (response.data.code === -40000 && response.data.msg && response.data.msg.includes('未登录')) {
            console.log('检测到用户未登录，清除本地用户信息')
            this.clearUser()
          }
          return null
        }
        // 格式4: 其他可能的格式
        else {
          console.log('未知响应格式:', response.data)
          // 尝试从响应中提取用户信息
          if (typeof response.data === 'object') {
            userData = response.data
          }
        }
      }
      
      if (userData) {
        console.log('获取到用户数据:', userData)
        this.updateUser(userData)
        return userData
      } else {
        console.error('获取当前用户信息失败: 无法解析用户数据')
        console.error('实际响应数据:', response?.data)
        return null
      }
    } catch (error) {
      console.error('获取当前用户信息失败:', error)
      console.error('错误详情:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config
      })
      
      // 如果是401错误，清除本地用户信息
      if (error.response && error.response.status === 401) {
        console.log('检测到401错误，清除本地用户信息')
        this.clearUser()
      }
      return null
    }
  }

  // 更新用户信息
  updateUser(userData) {
    Object.assign(this.user, userData)
    // 通知所有监听器
    this.notifyListeners()
  }

  // 清除用户信息
  clearUser() {
    Object.assign(this.user, { ...DEFAULT_USER_INFO })
    // 同时清除localStorage中的数据
    localStorage.removeItem('userInfo')
    localStorage.removeItem('token')
    this.notifyListeners()
  }

  // 添加监听器
  addListener(listener) {
    this.listeners.push(listener)
  }

  // 移除监听器
  removeListener(listener) {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  // 通知所有监听器
  notifyListeners() {
    this.listeners.forEach(listener => {
      if (typeof listener === 'function') {
        listener(this.user)
      }
    })
  }

  // 获取用户信息
  getUser() {
    return this.user
  }
}

// 创建全局用户状态实例
const userStore = new UserStore()

export default userStore 