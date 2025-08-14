// 调试工具函数
import { DEFAULT_AVATAR_URL } from './constants.js'

/**
 * 检查当前登录状态
 */
export const debugLoginStatus = () => {
  console.log('=== 登录状态调试信息 ===')
  
  const token = localStorage.getItem('token')
  const userInfo = localStorage.getItem('userInfo')
  
  console.log('Token:', token)
  console.log('UserInfo:', userInfo)
  
  if (userInfo) {
    try {
      const parsedUserInfo = JSON.parse(userInfo)
      console.log('解析后的用户信息:', parsedUserInfo)
      console.log('用户ID:', parsedUserInfo.id)
      console.log('用户名:', parsedUserInfo.userName)
    } catch (error) {
      console.error('解析用户信息失败:', error)
    }
  }
  
  console.log('当前页面路径:', window.location.pathname)
  console.log('=== 调试信息结束 ===')
}

/**
 * 清除所有登录信息（调试用）
 */
export const clearAllAuthData = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  console.log('已清除所有登录信息')
}

/**
 * 模拟登录数据（调试用）
 */
export const mockLoginData = () => {
  const mockUser = {
    id: 1,
    userName: '测试用户',
    userAccount: 'test123',
    avatarUrl: DEFAULT_AVATAR_URL,
    gender: 1,
    phone: '13800138000',
    email: 'test@example.com',
    createTime: new Date(),
    profile: '这是一个测试用户'
  }
  
  localStorage.setItem('userInfo', JSON.stringify(mockUser))
  localStorage.setItem('token', 'mock-token-123')
  
  console.log('已设置模拟登录数据:', mockUser)
} 