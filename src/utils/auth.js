// 用户认证相关工具函数

/**
 * 检查用户是否已登录
 * @returns {boolean}
 */
export const isLoggedIn = () => {
  const token = localStorage.getItem('token')
  const userInfo = localStorage.getItem('userInfo')
  
  // 如果token或userInfo为空，则未登录
  if (!token || !userInfo) {
    console.log('isLoggedIn检查 - token或userInfo为空')
    return false
  }
  
  try {
    // 尝试解析用户信息，确保数据有效
    const parsedUserInfo = JSON.parse(userInfo)
    const isLoggedIn = !!(parsedUserInfo && parsedUserInfo.id && parsedUserInfo.id !== 0)
    console.log('isLoggedIn检查 - 用户信息:', parsedUserInfo)
    console.log('isLoggedIn检查 - 登录状态:', isLoggedIn)
    return isLoggedIn
  } catch (error) {
    console.error('解析用户信息失败:', error)
    // 如果解析失败，清除无效数据
    clearUserInfo()
    return false
  }
}

/**
 * 获取当前登录用户信息
 * @returns {Object|null}
 */
export const getCurrentUser = () => {
  const userInfo = localStorage.getItem('userInfo')
  if (userInfo) {
    try {
      return JSON.parse(userInfo)
    } catch (error) {
      console.error('解析用户信息失败:', error)
      return null
    }
  }
  return null
}

/**
 * 获取用户token
 * @returns {string|null}
 */
export const getToken = () => {
  return localStorage.getItem('token')
}

/**
 * 保存用户登录信息
 * @param {Object} userData - 用户数据
 * @param {string} token - 用户token
 */
export const saveUserInfo = (userData, token) => {
  localStorage.setItem('userInfo', JSON.stringify(userData))
  localStorage.setItem('token', token || '')
}

/**
 * 清除用户登录信息
 */
export const clearUserInfo = () => {
  localStorage.removeItem('userInfo')
  localStorage.removeItem('token')
}

/**
 * 用户登出
 */
export const logout = () => {
  clearUserInfo()
  // 跳转到登录页面
  window.location.href = '/login'
}

/**
 * 检查是否需要登录
 * 如果未登录，跳转到登录页面
 * @returns {boolean} 是否已登录
 */
export const checkAuth = () => {
  if (!isLoggedIn()) {
    // 避免循环跳转，检查当前页面
    const currentPath = window.location.pathname
    if (currentPath !== '/login' && currentPath !== '/register') {
      console.log('用户未登录，跳转到登录页面')
      window.location.href = '/login'
    }
    return false
  }
  return true
} 