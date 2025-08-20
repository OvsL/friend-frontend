<script setup>
import { ref, onMounted } from 'vue'
import { showToast } from 'vant'
import { useRouter, useRoute } from 'vue-router'
import { userApi } from '../../api/user.js'
import userStore from '../../utils/userStore.js'

const router = useRouter()
const route = useRoute()

// 状态
const users = ref([])
const loading = ref(false)
const pageSize = ref(10)
const showPicker = ref(false)

// 解析用户标签（与 Index/SearchResult 保持一致）
const parseUserTags = (tagsString) => {
  if (!tagsString) return []
  try {
    const tagsArray = JSON.parse(tagsString)
    return Array.isArray(tagsArray) ? tagsArray : []
  } catch (e) {
    console.error('解析标签失败:', e)
    return []
  }
}

// 拉取匹配用户
const fetchMatchedUsers = async () => {
  loading.value = true
  try {
    const response = await userApi.matchUsers(pageSize.value)
    let data = []
    if (response?.data?.code === 0) {
      data = response.data.data || []
    } else if (Array.isArray(response?.data)) {
      data = response.data
    } else {
      console.warn('未知响应格式:', response?.data)
    }

    users.value = data.map(user => ({
      id: user.id,
      userName: user.userName || '未设置用户名',
      userAccount: user.userAccount,
      avatarUrl: user.avatarUrl,
      tags: parseUserTags(user.tags),
      gender: user.gender,
      email: user.email,
      phone: user.userPhone,
      profile: user.profile || ''
    }))
  } catch (error) {
    console.error('获取匹配用户失败:', error)
    showToast('获取匹配用户失败')
  } finally {
    loading.value = false
  }
}

// 跳转用户详情
const goToUserDetail = (userId) => {
  router.push(`/user/${userId}`)
}

// 页面挂载
onMounted(async () => {
  // 确保用户状态就绪
  await userStore.init()
  const currentUser = userStore.getUser()
  const isLoggedIn = currentUser && currentUser.id && currentUser.id !== 0
  if (!isLoggedIn) {
    showToast('请先登录')
    router.push('/login')
    return
  }
  const openPicker = route.query.openPicker === '1'
  if (openPicker) {
    showPicker.value = true
  } else {
    await fetchMatchedUsers()
  }
})

// pageSize 变更
const onChangePageSize = async (value) => {
  pageSize.value = value
  await fetchMatchedUsers()
}
</script>

<template>
  <div>
    <van-nav-bar title="为你匹配" />

    <div style="padding: 12px 16px;">
      <van-field
        is-link
        readonly
        :model-value="`${pageSize} 条`"
        label="每次匹配数量"
        placeholder="选择数量"
        @click="showPicker = true"
      />
      <van-popup v-model:show="showPicker" position="bottom">
        <van-picker
          :columns="[
            { text: '5 条', value: 5 },
            { text: '10 条', value: 10 },
            { text: '20 条', value: 20 }
          ]"
          @confirm="({ selectedOptions }) => { onChangePageSize(selectedOptions?.[0]?.value || 10); showPicker = false }"
          @cancel="() => { showPicker = false; if (!loading && users.length === 0) { fetchMatchedUsers() } }"
        />
      </van-popup>
    </div>

    <van-loading v-if="loading" style="text-align:center; padding: 20px;">加载中...</van-loading>

    <div v-else>
      <div v-if="users.length === 0" style="text-align:center; padding: 20px; color:#969799;">
        暂无匹配结果
      </div>

      <van-cell-group v-else>
        <van-cell
          v-for="u in users"
          :key="u.id"
          clickable
          @click="goToUserDetail(u.id)"
        >
          <template #icon>
            <van-image :src="u.avatarUrl || 'https://img.yzcdn.cn/vant/cat.jpeg'" width="40" height="40" round style="margin-right:12px;" />
          </template>
          <template #title>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-weight:600;">{{ u.userName }}</span>
              <van-tag type="primary" size="small">{{ u.userAccount }}</van-tag>
            </div>
          </template>
          <template #label>
            <div style="margin:4px 0;">
              <van-tag v-for="(tag, idx) in u.tags" :key="idx" type="success" size="small" style="margin-right:4px;">{{ tag }}</van-tag>
            </div>
            <div style="color:#969799; font-size:12px;">{{ u.profile }}</div>
          </template>
        </van-cell>
      </van-cell-group>
    </div>
  </div>
  
  <van-back-top right="16" bottom="80" />
</template>

<style scoped>
</style>


