<script setup>
import { ref, onMounted } from 'vue'
import { showToast, showConfirmDialog, showSuccessToast } from 'vant'
import { useRouter, useRoute } from 'vue-router'
import { teamApi } from '../../api/team.js'
import userStore from '../../utils/userStore.js'

// 路由实例
const router = useRouter()
const route = useRoute()

// 当前用户信息
const currentUser = userStore.getUser()

// 响应式数据
const team = ref(null)
const loading = ref(false)
const showJoinDialog = ref(false)
const showExitDialog = ref(false)
const showEditDialog = ref(false)
const showStatusPicker = ref(false)

// 加入团队表单
const joinForm = ref({
  password: ''
})

// 编辑团队表单
const editForm = ref({
  teamName: '',
  description: '',
  maxNum: 5,
  expireTime: '',
  status: 0,
  password: ''
})

// 团队状态映射
const teamStatusMap = {
  0: { text: '公开', color: 'success' },
  1: { text: '私有', color: 'warning' },
  2: { text: '加密', color: 'danger' }
}

// 团队状态选项
const teamStatusOptions = [
  { text: '公开', value: 0 },
  { text: '私有', value: 1 },
  { text: '加密', value: 2 }
]

// 状态选择器列
const statusColumns = [
  { text: '公开', value: 0 },
  { text: '私有', value: 1 },
  { text: '加密', value: 2 }
]

// 获取团队详情
const fetchTeamDetail = async () => {
  const teamId = route.params.id
  if (!teamId) {
    showToast('团队ID不存在')
    router.back()
    return
  }

  loading.value = true
  try {
    const response = await teamApi.getTeamById(teamId)
    if (response.data && response.data.code === 0) {
      team.value = response.data.data
    } else {
      showToast(response.data?.message || '获取团队详情失败')
      router.back()
    }
  } catch (error) {
    console.error('获取团队详情失败:', error)
    showToast('获取团队详情失败')
    router.back()
  } finally {
    loading.value = false
  }
}

// 加入团队
const joinTeam = async () => {
  if (!team.value) return

  try {
    const teamData = {
      teamId: team.value.id,
      password: joinForm.value.password
    }
    
    const response = await teamApi.joinTeam(teamData)
    if (response.data && response.data.code === 0) {
      showSuccessToast('加入团队成功')
      showJoinDialog.value = false
      joinForm.value.password = ''
      await fetchTeamDetail()
    } else {
      showToast(response.data?.message || '加入团队失败')
    }
  } catch (error) {
    console.error('加入团队失败:', error)
    showToast('加入团队失败')
  }
}

// 退出团队
const exitTeam = async () => {
  if (!team.value) return

  try {
    await showConfirmDialog({
      title: '确认退出',
      message: '确定要退出这个团队吗？'
    })
    
    const response = await teamApi.exitTeam({ teamId: team.value.id })
    if (response.data && response.data.code === 0) {
      showSuccessToast('退出团队成功')
      router.back()
    } else {
      showToast(response.data?.message || '退出团队失败')
    }
  } catch (error) {
    if (error === 'cancel') return
    console.error('退出团队失败:', error)
    showToast('退出团队失败')
  }
}

// 解散团队
const dismissTeam = async () => {
  if (!team.value) return

  try {
    await showConfirmDialog({
      title: '确认解散',
      message: '确定要解散这个团队吗？此操作不可恢复！'
    })
    
    const response = await teamApi.dismissTeam({ teamId: team.value.id })
    if (response.data && response.data.code === 0) {
      showSuccessToast('解散团队成功')
      router.back()
    } else {
      showToast(response.data?.message || '解散团队失败')
    }
  } catch (error) {
    if (error === 'cancel') return
    console.error('解散团队失败:', error)
    showToast('解散团队失败')
  }
}

// 打开编辑对话框
const openEditDialog = () => {
  if (!team.value) return
  
  // 调试信息
  console.log('团队数据:', team.value)
  console.log('团队名称字段:', {
    teamName: team.value.teamName,
    name: team.value.name
  })
  console.log('最终使用的团队名称:', team.value.teamName || team.value.name || '无名称')
  
  editForm.value = {
    teamName: team.value.teamName || team.value.name || '',
    description: team.value.description,
    maxNum: team.value.maxNum,
    expireTime: team.value.expireTime ? new Date(team.value.expireTime).toISOString().slice(0, 16) : '',
    status: team.value.status,
    password: team.value.password || ''
  }
  
  console.log('编辑表单数据:', editForm.value)
  console.log('状态字段详情:', {
    teamStatus: team.value.status,
    teamStatusType: typeof team.value.status,
    editFormStatus: editForm.value.status,
    editFormStatusType: typeof editForm.value.status,
    mappedText: teamStatusMap[editForm.value.status]?.text
  })
  showEditDialog.value = true
}

// 编辑团队
const editTeam = async () => {
  if (!team.value) return
  
  // 表单验证
  if (!editForm.value.teamName.trim()) {
    showToast('请输入团队名称')
    return
  }
  if (!editForm.value.description.trim()) {
    showToast('请输入团队描述')
    return
  }
  if (editForm.value.maxNum < 1) {
    showToast('最大人数必须大于0')
    return
  }
  if (editForm.value.status === 2 && !editForm.value.password.trim()) {
    showToast('加密团队必须设置密码')
    return
  }
  
  try {
    const updateData = {
      id: team.value.id,
      teamName: editForm.value.teamName.trim(),
      description: editForm.value.description.trim(),
      maxNum: editForm.value.maxNum,
      status: editForm.value.status
    }
    
    // 只有当状态为加密时才添加密码字段
    if (editForm.value.status === 2 && editForm.value.password.trim()) {
      updateData.password = editForm.value.password.trim()
    }
    
    // 如果有过期时间，添加到更新数据中
    if (editForm.value.expireTime) {
      updateData.expireTime = new Date(editForm.value.expireTime)
    }
    
    console.log('发送的更新数据:', updateData)
    
    const response = await teamApi.updateTeam(updateData)
    if (response.data && response.data.code === 0) {
      showSuccessToast('编辑团队成功')
      showEditDialog.value = false
      await fetchTeamDetail() // 刷新团队详情
    } else {
      showToast(response.data?.message || '编辑团队失败')
    }
  } catch (error) {
    console.error('编辑团队失败:', error)
    showToast('编辑团队失败')
  }
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return '永久'
  return new Date(time).toLocaleString()
}

// 检查是否为团队创建者
const isTeamCreator = () => {
  return currentUser && team.value && team.value.userId === currentUser.id
}

// 检查是否可以加入团队
const canJoinTeam = () => {
  if (!currentUser || !team.value) return false
  if (team.value.status === 1) return false // 私有团队
  if (team.value.hasJoinNum >= team.value.maxNum) return false // 人数已满
  return true
}

// 状态选择器确认事件
const onStatusPickerConfirm = (value) => {
  console.log('状态选择器确认:', value)
  console.log('value类型:', typeof value)
  console.log('value内容:', JSON.stringify(value))
  
  // 根据 Vant Picker 的实际参数结构提取值
  let selectedValue = null
  
  if (value && typeof value === 'object') {
    // 优先使用 selectedValues 数组的第一个值
    if (value.selectedValues && Array.isArray(value.selectedValues) && value.selectedValues.length > 0) {
      selectedValue = value.selectedValues[0]
    }
    // 如果没有 selectedValues，尝试使用 selectedOptions 的第一个值
    else if (value.selectedOptions && Array.isArray(value.selectedOptions) && value.selectedOptions.length > 0) {
      selectedValue = value.selectedOptions[0].value
    }
  }
  
  console.log('解析后的值:', selectedValue)
  
  // 确保值是有效的数字
  if (typeof selectedValue === 'number' && [0, 1, 2].includes(selectedValue)) {
    editForm.value.status = selectedValue
    
    // 如果状态不是加密，清空密码字段
    if (selectedValue !== 2) {
      editForm.value.password = ''
    }
    
    showStatusPicker.value = false
    
    console.log('状态选择器更新后:', {
      editFormStatus: editForm.value.status,
      password: editForm.value.password
    })
  } else {
    console.error('无效的状态值:', selectedValue)
    showToast('选择状态失败，请重试')
  }
}

// 调试编辑表单
const debugEditForm = () => {
  console.log('=== 编辑表单调试 ===')
  console.log('当前团队数据:', team.value)
  console.log('编辑表单数据:', editForm.value)
  console.log('团队状态映射:', teamStatusMap)
  console.log('状态选择器列:', statusColumns)
  console.log('状态字段详情:', {
    teamStatus: team.value?.status,
    teamStatusType: typeof team.value?.status,
    editFormStatus: editForm.value.status,
    editFormStatusType: typeof editForm.value.status,
    mappedText: teamStatusMap[editForm.value.status]?.text
  })
}

// 页面初始化
onMounted(() => {
  fetchTeamDetail()
})
</script>

<template>
  <div class="team-detail-page">
    <!-- 页面头部 -->
    <van-nav-bar
      title="团队详情"
      left-arrow
      @click-left="router.back()"
    />

    <!-- 加载状态 -->
    <van-loading v-if="loading" class="loading" />

    <!-- 团队详情内容 -->
    <div v-else-if="team" class="team-detail-content">
      <!-- 团队基本信息 -->
      <van-cell-group title="基本信息" class="info-group">
        <van-cell title="团队名称" :value="team.teamName || team.name" />
        <van-cell title="团队描述" :value="team.description" />
        <van-cell title="团队状态">
          <template #value>
            <van-tag :type="teamStatusMap[team.status]?.color">
              {{ teamStatusMap[team.status]?.text }}
            </van-tag>
          </template>
        </van-cell>
        <van-cell title="最大人数" :value="`${team.hasJoinNum || 0}/${team.maxNum}`" />
        <van-cell title="过期时间" :value="formatTime(team.expireTime)" />
        <van-cell title="创建时间" :value="formatTime(team.createTime)" />
      </van-cell-group>

      <!-- 创建者信息 -->
      <van-cell-group title="创建者信息" class="info-group" v-if="team.createUser">
        <van-cell>
          <template #title>
            <div class="creator-info">
              <van-image
                :src="team.createUser.avatarUrl || '/default-avatar.png'"
                width="40"
                height="40"
                round
                fit="cover"
              />
              <div class="creator-details">
                <div class="creator-name">{{ team.createUser.userName || '未设置用户名' }}</div>
                <div class="creator-account">{{ team.createUser.userAccount }}</div>
              </div>
            </div>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <van-button 
          v-if="canJoinTeam()" 
          type="primary" 
          size="large"
          @click="showJoinDialog = true"
          block
        >
          加入团队
        </van-button>
        
        <van-button 
          v-if="isTeamCreator()" 
          type="info" 
          size="large"
          @click="openEditDialog"
          block
        >
          编辑团队
        </van-button>
        
        <van-button 
          v-if="isTeamCreator()" 
          type="default" 
          size="small"
          @click="debugEditForm"
          style="margin-top: 8px;"
        >
          调试编辑表单
        </van-button>
        
        <van-button 
          v-if="isTeamCreator()" 
          type="danger" 
          size="large"
          @click="dismissTeam"
          block
        >
          解散团队
        </van-button>
        
        <van-button 
          v-if="!isTeamCreator()" 
          type="warning" 
          size="large"
          @click="showExitDialog = true"
          block
        >
          退出团队
        </van-button>
      </div>
    </div>

    <!-- 团队不存在 -->
    <div v-else class="not-found">
      <van-empty description="团队不存在" />
    </div>

    <!-- 加入团队对话框 -->
    <van-dialog
      v-model:show="showJoinDialog"
      title="加入团队"
      show-cancel-button
      @confirm="joinTeam"
    >
      <van-field
        v-if="team && team.status === 2"
        v-model="joinForm.password"
        label="团队密码"
        type="password"
        placeholder="请输入团队密码"
        required
      />
      <div v-else class="dialog-content">
        <p>确定要加入团队 "{{ team?.teamName || team?.name }}" 吗？</p>
      </div>
    </van-dialog>

    <!-- 退出团队对话框 -->
    <van-dialog
      v-model:show="showExitDialog"
      title="退出团队"
      show-cancel-button
      @confirm="exitTeam"
    >
      <div class="dialog-content">
        <p>确定要退出团队 "{{ team?.teamName || team?.name }}" 吗？</p>
      </div>
    </van-dialog>

    <!-- 编辑团队对话框 -->
    <van-dialog
      v-model:show="showEditDialog"
      title="编辑团队"
      show-cancel-button
      @confirm="editTeam"
      :before-close="() => { showEditDialog = false }"
    >
      <div class="edit-form">
        <van-field
          v-model="editForm.teamName"
          label="团队名称"
          placeholder="请输入团队名称"
          required
        />
        
        <van-field
          v-model="editForm.description"
          label="团队描述"
          type="textarea"
          placeholder="请输入团队描述"
          rows="3"
          required
        />
        
        <van-field
          v-model="editForm.maxNum"
          label="最大人数"
          type="number"
          placeholder="请输入最大人数"
          required
          :min="1"
        />
        
        <van-field
          v-model="editForm.expireTime"
          label="过期时间"
          type="datetime-local"
          placeholder="请选择过期时间"
        />
        
        <van-field
          :model-value="teamStatusMap[editForm.status]?.text || `状态:${editForm.status}`"
          label="团队状态"
          readonly
          is-link
          @click="showStatusPicker = true"
        />
        <!-- 调试信息 -->
        <div style="font-size: 12px; color: #999; padding: 0 16px; margin-bottom: 8px;">
          调试: editForm.status = {{ editForm.status }}, 显示值 = {{ teamStatusMap[editForm.status]?.text || `状态:${editForm.status}` }}
          <br>
          状态类型: {{ typeof editForm.status }}, 状态映射: {{ JSON.stringify(teamStatusMap[editForm.status]) }}
        </div>
        
        <van-field
          v-if="editForm.status === 2"
          v-model="editForm.password"
          label="团队密码"
          type="password"
          placeholder="请输入团队密码"
          required
        />
      </div>
    </van-dialog>

    <!-- 状态选择器 -->
    <van-popup
      v-model:show="showStatusPicker"
      position="bottom"
      round
    >
      <van-picker
        :columns="statusColumns"
        @confirm="onStatusPickerConfirm"
        @cancel="showStatusPicker = false"
      />
    </van-popup>
  </div>
</template>

<style scoped>
.team-detail-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.team-detail-content {
  padding: 16px;
}

.info-group {
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.creator-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.creator-details {
  flex: 1;
}

.creator-name {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 4px;
}

.creator-account {
  font-size: 14px;
  color: #969799;
}

.action-buttons {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.not-found {
  padding: 40px 20px;
}

.dialog-content {
  padding: 16px;
  text-align: center;
}

.edit-form {
  padding: 16px;
}

.edit-form .van-field {
  margin-bottom: 12px;
}

:deep(.van-cell-group__title) {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  padding: 16px 16px 8px;
}

:deep(.van-cell) {
  padding: 12px 16px;
}
</style>
