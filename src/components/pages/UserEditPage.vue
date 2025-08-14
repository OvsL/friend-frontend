<template>
  <div class="edit-page">
    <!-- 页面头部 -->
    <van-nav-bar
      title="编辑资料"
      left-text="取消"
      right-text="保存"
      @click-left="goBack"
      @click-right="saveProfile"
    />

    <!-- 头像编辑区域 -->
    <div class="avatar-section">
      <div class="avatar-wrapper">
        <van-image
          :src="formData.avatarUrl || DEFAULT_AVATAR_URL"
          width="100"
          height="100"
          round
          fit="cover"
        />
        <div class="avatar-edit" @click="showImagePicker = true">
          <van-icon name="photograph" size="20" />
        </div>
      </div>
      <p class="avatar-tip">点击头像更换</p>
    </div>

    <!-- 编辑表单 -->
    <div class="form-section">
      <van-form @submit="saveProfile">
        <van-cell-group title="基本信息">
          <van-field
            v-model="formData.userName"
            label="用户名"
            placeholder="请输入用户名"
            :rules="[{ required: true, message: '请输入用户名' }]"
          />
          
          <van-cell
            title="性别"
            :value="formData.gender"
            is-link
            @click="showGenderPicker = true"
          />

          <van-field
            v-model="formData.phone"
            label="手机号码"
            placeholder="请输入手机号码"
            :rules="[
              { required: true, message: '请输入手机号码' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
            ]"
          />

          <van-field
            v-model="formData.email"
            label="邮箱地址"
            placeholder="请输入邮箱地址"
            :rules="[
              { required: true, message: '请输入邮箱地址' },
              { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '请输入正确的邮箱地址' }
            ]"
          />
        </van-cell-group>

        <van-cell-group title="个人简介">
          <van-field
            v-model="formData.bio"
            label="个人简介"
            type="textarea"
            placeholder="介绍一下自己吧..."
            rows="3"
            maxlength="200"
            show-word-limit
          />
        </van-cell-group>
      </van-form>
    </div>

    <!-- 性别选择弹窗 -->
    <van-action-sheet
      v-model:show="showGenderPicker"
      title="选择性别"
      :actions="genderActions"
      @select="onGenderSelect"
    />

    <!-- 图片选择弹窗 -->
    <van-popup v-model:show="showImagePicker" position="bottom">
      <van-cell-group>
        <van-cell title="拍照" @click="takePhoto" />
        <van-cell title="从相册选择" @click="chooseFromAlbum" />
        <van-cell title="取消" @click="showImagePicker = false" />
      </van-cell-group>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { showToast, showSuccessToast } from 'vant'
import { userApi } from '../../api/user.js'
import { getCurrentUser, checkAuth, saveUserInfo } from '../../utils/auth.js'
import userStore from '../../utils/userStore.js'
import { DEFAULT_AVATAR_URL, GENDER_TEXT_MAP } from '../../utils/constants.js'

// 表单数据
const formData = reactive({
  userName: '张三',
  gender: '男',
  phone: '1234567890',
  email: '1234567890@qq.com',
  avatarUrl: DEFAULT_AVATAR_URL,
  bio: '这是一个示例的个人简介，可以在这里介绍自己的兴趣爱好、工作经历等信息。'
})

// 弹窗控制
const showGenderPicker = ref(false)
const showImagePicker = ref(false)

// 性别选项
const genderOptions = ['男', '女', '保密']

// 性别选择项
const genderActions = [
  { name: '男' },
  { name: '女' },
  { name: '保密' }
]

// 页面加载时检查登录状态并初始化数据
onMounted(async () => {
  // 检查登录状态
  const isLoggedIn = checkAuth()
  if (!isLoggedIn) {
    console.log('用户未登录，无法访问编辑页面')
    return
  }
  
  try {
    // 从服务器获取最新用户信息
    const userData = await userStore.fetchCurrentUser()
    if (userData) {
      // 使用服务器返回的最新数据填充表单
      formData.userName = userData.userName || ''
      formData.gender = GENDER_TEXT_MAP[userData.gender] || '保密'
      formData.phone = userData.phone || ''
      formData.email = userData.email || ''
      formData.avatarUrl = userData.avatarUrl || DEFAULT_AVATAR_URL
      formData.bio = userData.profile || ''
    } else {
      // 如果服务器获取失败，使用本地存储的数据
      const currentUser = getCurrentUser()
      if (currentUser) {
        formData.userName = currentUser.userName || ''
        formData.gender = GENDER_TEXT_MAP[currentUser.gender] || '保密'
        formData.phone = currentUser.phone || ''
        formData.email = currentUser.email || ''
        formData.avatarUrl = currentUser.avatarUrl || DEFAULT_AVATAR_URL
        formData.bio = currentUser.profile || ''
      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    // 使用本地存储的数据作为备选
    const currentUser = getCurrentUser()
    if (currentUser) {
      formData.userName = currentUser.userName || ''
      formData.gender = GENDER_TEXT_MAP[currentUser.gender] || '保密'
      formData.phone = currentUser.phone || ''
      formData.email = currentUser.email || ''
      formData.avatarUrl = currentUser.avatarUrl || DEFAULT_AVATAR_URL
      formData.bio = currentUser.profile || ''
    }
  }
})

// 返回上一页
const goBack = () => {
  history.back()
}

// 保存资料
const saveProfile = async () => {
  try {
    // 获取当前用户信息
    const currentUser = getCurrentUser()
    if (!currentUser || !currentUser.id) {
      showToast('用户信息不完整，请重新登录')
      return
    }
    
    // 构建要提交的用户数据
    const userData = {
      id: currentUser.id, // 使用正确的id字段
      userName: formData.userName,
      gender: formData.gender === '男' ? 1 : formData.gender === '女' ? 2 : 0, // 转换为数字格式
      phone: formData.phone,
      email: formData.email,
      avatarUrl: formData.avatarUrl,
      profile: formData.bio // 个人简介
    }
    
    console.log('提交的用户数据:', userData)
    
    // 调用后端更新用户接口
    const response = await userApi.updateUser(userData)
    
    if (response.data && response.data.code === 0) {
      // 更新本地存储的用户信息
      const updatedUser = { ...currentUser, ...userData }
      saveUserInfo(updatedUser, localStorage.getItem('token'))
      
      // 更新用户状态
      userStore.updateUser(updatedUser)
      
      showSuccessToast('保存成功')
      goBack()
    } else {
      showToast(response.data?.message || '保存失败，请重试')
    }
  } catch (error) {
    console.error('更新用户信息失败:', error)
    showToast('保存失败，请重试')
  }
}

// 性别选择
const onGenderSelect = (action) => {
  formData.gender = action.name
  showGenderPicker.value = false
}

// 拍照
const takePhoto = () => {
  showImagePicker.value = false
  showToast('拍照功能开发中...')
  // 这里可以调用相机API
}

// 从相册选择
const chooseFromAlbum = () => {
  showImagePicker.value = false
  showToast('相册选择功能开发中...')
  // 这里可以调用相册API
}
</script>

<style scoped>
.edit-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.avatar-section {
  background: white;
  padding: 30px 0;
  text-align: center;
  margin-bottom: 12px;
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 12px;
}

.avatar-edit {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
}

.avatar-tip {
  margin: 0;
  font-size: 14px;
  color: #969799;
}

.form-section {
  background: white;
}

:deep(.van-cell-group__title) {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin: 16px 0 8px;
  padding: 0 16px;
}

:deep(.van-field__label) {
  color: #646566;
  font-weight: 500;
}

:deep(.van-field__control) {
  color: #323233;
}

:deep(.van-nav-bar) {
  background: white;
}

:deep(.van-nav-bar__title) {
  color: #323233;
  font-weight: 600;
}

:deep(.van-nav-bar__text) {
  color: #1989fa;
}

:deep(.van-action-sheet) {
  z-index: 2000;
}
</style>
