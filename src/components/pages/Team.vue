<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { showToast, showConfirmDialog, showSuccessToast, showLoadingToast } from 'vant'
import { useRouter } from 'vue-router'
import { teamApi } from '../../api/team.js'
import userStore from '../../utils/userStore.js'
import { getCurrentUser } from '../../utils/auth.js'

// 路由实例
const router = useRouter()

// 当前用户信息
const currentUser = userStore.getUser()

// 响应式数据
const teams = ref([])
const myTeams = ref([])
const loading = ref(false)
const activeTab = ref(0)
const showCreateDialog = ref(false)
const showJoinDialog = ref(false)
const showStatusPicker = ref(false)
const showFilterDialog = ref(false)
const showStatusFilterPicker = ref(false)
const showMaxNumFilterPicker = ref(false)
const selectedTeam = ref(null)

// 临时筛选条件（用于对话框显示）
const tempFilterStatus = ref(-1)
const tempFilterMaxNum = ref(-1)

// 搜索和筛选
const searchKeyword = ref('')
const filterStatus = ref(-1) // -1表示全部
const filterMaxNum = ref(-1) // -1表示全部
const showSearchBar = ref(false)

// 创建团队表单
const createForm = ref({
  teamName: '',
  description: '',
  maxNum: 5,
  expireTime: '',
  status: 0, // 0-公开，1-私有，2-加密
  password: ''
})

// 加入团队表单
const joinForm = ref({
  teamId: '',
  password: ''
})

// 团队状态映射
const teamStatusMap = {
  0: { text: '公开', color: 'success', icon: 'friends-o' },
  1: { text: '私有', color: 'warning', icon: 'lock' },
  2: { text: '加密', color: 'danger', icon: 'shield-o' }
}

// 计算属性
const isLoggedIn = computed(() => {
  return currentUser && currentUser.id && currentUser.id !== 0
})

// 筛选后的团队列表（现在直接使用服务器返回的结果）
const filteredTeams = computed(() => {
  return teams.value
})

// 获取团队列表
const fetchTeams = async (filters = {}) => {
  loading.value = true
  try {
    // 构建查询参数
    const params = {}
    
    // 搜索关键词
    if (filters.searchText) {
      params.searchText = filters.searchText
    }
    
    // 状态筛选
    if (filters.status !== undefined && filters.status !== -1) {
      params.status = filters.status
    }
    
    // 人数筛选
    if (filters.maxNum !== undefined && filters.maxNum !== -1) {
      params.maxNum = filters.maxNum
    }
    
    console.log('发送筛选参数:', params)
    
    const response = await teamApi.listTeams(params)
    if (response.data && response.data.code === 0) {
      teams.value = response.data.data || []
      console.log('获取到的团队列表:', teams.value)
      if (teams.value.length > 0) {
        console.log('第一个团队数据结构:', teams.value[0])
      }
    } else {
      showToast(response.data?.message || '获取团队列表失败')
    }
  } catch (error) {
    console.error('获取团队列表失败:', error)
    showToast('获取团队列表失败')
  } finally {
    loading.value = false
  }
}

// 获取我的团队
const fetchMyTeams = async () => {
  try {
    const response = await teamApi.listMyTeams()
    if (response.data && response.data.code === 0) {
      myTeams.value = response.data.data || []
      console.log('获取到的我的团队:', myTeams.value)
      if (myTeams.value.length > 0) {
        console.log('第一个我的团队数据结构:', myTeams.value[0])
      }
    } else {
      showToast(response.data?.message || '获取我的团队失败')
    }
  } catch (error) {
    console.error('获取我的团队失败:', error)
    showToast('获取我的团队失败')
  }
}

// 创建团队
const createTeam = async () => {
  if (!createForm.value.teamName.trim()) {
    showToast('请输入团队名称')
    return
  }
  
  if (!createForm.value.description.trim()) {
    showToast('请输入团队描述')
    return
  }
  
  if (createForm.value.maxNum < 2 || createForm.value.maxNum > 20) {
    showToast('团队人数应在2-20之间')
    return
  }
  
  if (createForm.value.status === 2 && !createForm.value.password.trim()) {
    showToast('加密团队需要设置密码')
    return
  }
  
  const loadingToast = showLoadingToast({
    message: '创建中...',
    forbidClick: true,
  })
  
  try {
    const teamData = {
      ...createForm.value,
      expireTime: createForm.value.expireTime ? new Date(createForm.value.expireTime) : null
    }
    
    const response = await teamApi.addTeam(teamData)
    loadingToast.close()
    
    if (response.data && response.data.code === 0) {
      showSuccessToast('创建团队成功')
      showCreateDialog.value = false
      resetCreateForm()
      await fetchTeams()
      await fetchMyTeams()
    } else {
      showToast(response.data?.message || '创建团队失败')
    }
  } catch (error) {
    loadingToast.close()
    console.error('创建团队失败:', error)
    showToast('创建团队失败')
  }
}

// 加入团队
const joinTeam = async () => {
  let teamId = joinForm.value.teamId
  
  // 如果是从团队卡片点击加入，使用选中的团队ID
  if (selectedTeam.value) {
    teamId = selectedTeam.value.id
  }
  
  if (!teamId) {
    showToast('请选择要加入的团队')
    return
  }
  
  const loadingToast = showLoadingToast({
    message: '加入中...',
    forbidClick: true,
  })
  
  try {
    const teamData = {
      teamId: parseInt(teamId),
      password: joinForm.value.password
    }
    
    const response = await teamApi.joinTeam(teamData)
    loadingToast.close()
    
    if (response.data && response.data.code === 0) {
      showSuccessToast('加入团队成功')
      showJoinDialog.value = false
      resetJoinForm()
      selectedTeam.value = null
      await fetchTeams()
      await fetchMyTeams()
    } else {
      showToast(response.data?.message || '加入团队失败')
    }
  } catch (error) {
    loadingToast.close()
    console.error('加入团队失败:', error)
    showToast('加入团队失败')
  }
}

// 退出团队
const exitTeam = async (teamId) => {
  try {
    await showConfirmDialog({
      title: '确认退出',
      message: '确定要退出这个团队吗？'
    })
    
    const loadingToast = showLoadingToast({
      message: '退出中...',
      forbidClick: true,
    })
    
    const response = await teamApi.exitTeam({ teamId })
    loadingToast.close()
    
    if (response.data && response.data.code === 0) {
      showSuccessToast('退出团队成功')
      await fetchTeams()
      await fetchMyTeams()
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
const dismissTeam = async (teamId) => {
  try {
    await showConfirmDialog({
      title: '确认解散',
      message: '确定要解散这个团队吗？此操作不可恢复！'
    })
    
    const loadingToast = showLoadingToast({
      message: '解散中...',
      forbidClick: true,
    })
    
    const response = await teamApi.dismissTeam({ teamId })
    loadingToast.close()
    
    if (response.data && response.data.code === 0) {
      showSuccessToast('解散团队成功')
      await fetchTeams()
      await fetchMyTeams()
    } else {
      showToast(response.data?.message || '解散团队失败')
    }
  } catch (error) {
    if (error === 'cancel') return
    console.error('解散团队失败:', error)
    showToast('解散团队失败')
  }
}

// 重置创建表单
const resetCreateForm = () => {
  createForm.value = {
    teamName: '',
    description: '',
    maxNum: 5,
    expireTime: '',
    status: 0,
    password: ''
  }
}

// 重置加入表单
const resetJoinForm = () => {
  joinForm.value = {
    teamId: '',
    password: ''
  }
}

// 重置筛选条件
const resetFilters = () => {
  searchKeyword.value = ''
  filterStatus.value = -1
  filterMaxNum.value = -1
  // 同时重置临时筛选条件
  tempFilterStatus.value = -1
  tempFilterMaxNum.value = -1
  
  // 重新获取所有团队数据
  fetchTeams()
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return '永久'
  return new Date(time).toLocaleString()
}

// 格式化相对时间
const formatRelativeTime = (time) => {
  if (!time) return '永久'
  const now = new Date()
  const target = new Date(time)
  const diff = target - now
  
  if (diff < 0) return '已过期'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days > 0) return `${days}天后过期`
  if (hours > 0) return `${hours}小时后过期`
  return '即将过期'
}

// 检查是否为团队创建者
const isTeamCreator = (team) => {
  return currentUser && team.userId === currentUser.id
}

// 检查是否可以加入团队
const canJoinTeam = (team) => {
  if (!currentUser) return false
  if (team.status === 1) return false // 私有团队
  
  const hasJoinNum = team.hasJoinNum || 0
  const maxNum = team.maxNum || 1
  
  if (hasJoinNum >= maxNum) return false // 人数已满
  return true
}

// 检查团队是否已过期
const isTeamExpired = (team) => {
  if (!team.expireTime) return false
  return new Date(team.expireTime) < new Date()
}

// 获取团队进度百分比
const getTeamProgress = (team) => {
  const hasJoinNum = team.hasJoinNum || 0
  const maxNum = team.maxNum || 1
  
  if (maxNum <= 0) return 0
  
  const percentage = Math.round((hasJoinNum / maxNum) * 100)
  return Math.min(percentage, 100) // 确保不超过100%
}

// 页面初始化
onMounted(async () => {
  if (isLoggedIn.value) {
    await fetchTeams()
    await fetchMyTeams()
  }
})

// 搜索处理函数
const onSearch = () => {
  console.log('执行搜索，关键词:', searchKeyword.value)
  
  // 隐藏搜索栏，显示搜索结果
  if (searchKeyword.value.trim()) {
    showSearchBar.value = false
  }
  
  // 调用服务器API进行搜索
  const filters = {
    searchText: searchKeyword.value.trim(),
    status: filterStatus.value !== -1 ? filterStatus.value : undefined,
    maxNum: filterMaxNum.value !== -1 ? filterMaxNum.value : undefined
  }
  
  fetchTeams(filters)
}

// 应用筛选条件
const applyFilters = () => {
  // 将临时筛选条件应用到实际筛选条件
  filterStatus.value = tempFilterStatus.value
  filterMaxNum.value = tempFilterMaxNum.value
  
  console.log('应用筛选条件:', {
    status: filterStatus.value,
    maxNum: filterMaxNum.value
  })
  
  // 关闭筛选对话框
  showFilterDialog.value = false
  
  // 显示筛选结果提示
  const activeFilters = []
  if (filterStatus.value !== -1) {
    activeFilters.push(`状态: ${teamStatusMap[filterStatus.value]?.text}`)
  }
  if (filterMaxNum.value !== -1) {
    activeFilters.push(`人数: ${filterMaxNum.value}人`)
  }
  
  if (activeFilters.length > 0) {
    showToast(`已应用筛选: ${activeFilters.join(', ')}`)
  }
  
  // 调用服务器API获取筛选后的结果
  const filters = {
    searchText: searchKeyword.value.trim() || undefined,
    status: filterStatus.value !== -1 ? filterStatus.value : undefined,
    maxNum: filterMaxNum.value !== -1 ? filterMaxNum.value : undefined
  }
  
  fetchTeams(filters)
}

// 打开筛选对话框
const openFilterDialog = () => {
  // 初始化临时筛选条件为当前筛选条件
  tempFilterStatus.value = filterStatus.value
  tempFilterMaxNum.value = filterMaxNum.value
  
  console.log('打开筛选对话框:', {
    currentStatus: filterStatus.value,
    currentMaxNum: filterMaxNum.value,
    tempStatus: tempFilterStatus.value,
    tempMaxNum: tempFilterMaxNum.value
  })
  
  showFilterDialog.value = true
}

// 取消筛选
const cancelFilters = () => {
  // 重置临时筛选条件
  tempFilterStatus.value = filterStatus.value
  tempFilterMaxNum.value = filterMaxNum.value
  showFilterDialog.value = false
}

// 状态选择器确认事件
const onStatusPickerConfirm = (value) => {
  console.log('状态选择器确认:', value)
  console.log('value类型:', typeof value)
  console.log('value内容:', JSON.stringify(value))
  
  // 尝试不同的方式获取值
  let selectedValue = value
  if (value && typeof value === 'object' && 'value' in value) {
    selectedValue = value.value
  } else if (value && typeof value === 'object' && 'text' in value) {
    selectedValue = value.text
  }
  
  console.log('解析后的值:', selectedValue)
  
  // 如果是文本，转换为对应的数值
  if (typeof selectedValue === 'string') {
    if (selectedValue === '公开') selectedValue = 0
    else if (selectedValue === '私有') selectedValue = 1
    else if (selectedValue === '加密') selectedValue = 2
    else if (selectedValue === '全部状态') selectedValue = -1
  }
  
  tempFilterStatus.value = selectedValue
  showStatusFilterPicker.value = false
  
  console.log('状态选择器更新后:', {
    tempFilterStatus: tempFilterStatus.value,
    filterStatus: filterStatus.value
  })
}

// 人数选择器确认事件
const onMaxNumPickerConfirm = (value) => {
  console.log('人数选择器确认:', value)
  console.log('value类型:', typeof value)
  console.log('value内容:', JSON.stringify(value))
  
  // 尝试不同的方式获取值
  let selectedValue = value
  if (value && typeof value === 'object' && 'value' in value) {
    selectedValue = value.value
  } else if (value && typeof value === 'object' && 'text' in value) {
    selectedValue = value.text
  }
  
  console.log('解析后的值:', selectedValue)
  
  // 如果是文本，转换为对应的数值
  if (typeof selectedValue === 'string') {
    if (selectedValue === '全部人数') selectedValue = -1
    else if (selectedValue.includes('人')) {
      selectedValue = parseInt(selectedValue.replace('人', ''))
    }
  }
  
  tempFilterMaxNum.value = selectedValue
  showMaxNumFilterPicker.value = false
  
  console.log('人数选择器更新后:', {
    tempFilterMaxNum: tempFilterMaxNum.value,
    filterMaxNum: filterMaxNum.value
  })
}

// 测试筛选功能
const testFilters = () => {
  console.log('=== 筛选功能测试 ===')
  console.log('当前筛选条件:', {
    searchKeyword: searchKeyword.value,
    filterStatus: filterStatus.value,
    filterMaxNum: filterMaxNum.value
  })
  console.log('团队数据:', teams.value)
  console.log('筛选结果:', filteredTeams.value)
  
  // 测试当前筛选条件
  const currentFilters = {
    searchText: searchKeyword.value.trim() || undefined,
    status: filterStatus.value !== -1 ? filterStatus.value : undefined,
    maxNum: filterMaxNum.value !== -1 ? filterMaxNum.value : undefined
  }
  
  console.log('当前筛选参数:', currentFilters)
  console.log('团队总数:', teams.value.length)
}

// 调试临时筛选变量
const debugTempFilters = () => {
  console.log('=== 临时筛选变量调试 ===')
  console.log('实际筛选条件:', {
    filterStatus: filterStatus.value,
    filterMaxNum: filterMaxNum.value
  })
  console.log('临时筛选条件:', {
    tempFilterStatus: tempFilterStatus.value,
    tempFilterMaxNum: tempFilterMaxNum.value
  })
  console.log('筛选对话框状态:', showFilterDialog.value)
  console.log('状态选择器状态:', showStatusFilterPicker.value)
  console.log('人数选择器状态:', showMaxNumFilterPicker.value)
}

// 监听搜索关键词变化
watch(searchKeyword, () => {
  // 可以在这里添加防抖逻辑
})
</script>

<template>
  <div class="team-page">
    <!-- 页面头部 -->
    <van-nav-bar
      title="团队管理"
      left-arrow
      @click-left="router.back()"
    >
      <template #right>
        <van-icon 
          name="search" 
          @click="showSearchBar = !showSearchBar"
          :class="{ 'active': showSearchBar }"
        />
        <van-icon 
          name="filter-o" 
          @click="openFilterDialog"
          style="margin-left: 16px;"
        />
        <van-icon 
          name="setting-o" 
          @click="testFilters"
          style="margin-left: 16px;"
          title="测试筛选"
        />
        <van-icon 
          name="info-o" 
          @click="debugTempFilters"
          style="margin-left: 16px;"
          title="调试临时筛选"
        />
      </template>
    </van-nav-bar>

    <!-- 搜索栏 -->
    <van-search
      v-if="showSearchBar"
      v-model="searchKeyword"
      placeholder="搜索团队名称、描述或创建者"
      show-action
      @search="onSearch"
      @cancel="showSearchBar = false"
    />

    <!-- 筛选标签 -->
    <div class="filter-tags" v-if="filterStatus !== -1 || filterMaxNum !== -1 || searchKeyword">
      <van-tag 
        v-if="searchKeyword" 
        type="primary" 
        closeable 
        @close="() => { searchKeyword = ''; fetchTeams() }"
      >
        搜索: {{ searchKeyword }}
      </van-tag>
      <van-tag 
        v-if="filterStatus !== -1" 
        type="success" 
        closeable 
        @close="() => { filterStatus = -1; fetchTeams() }"
      >
        状态: {{ teamStatusMap[filterStatus]?.text }}
      </van-tag>
      <van-tag 
        v-if="filterMaxNum !== -1" 
        type="warning" 
        closeable 
        @close="() => { filterMaxNum = -1; fetchTeams() }"
      >
        人数: {{ filterMaxNum }}人
      </van-tag>
      <van-button 
        size="small" 
        type="default" 
        @click="resetFilters"
        style="margin-left: 8px;"
      >
        清除全部
      </van-button>
    </div>

    <!-- 未登录提示 -->
    <div class="login-prompt" v-if="!isLoggedIn">
      <van-empty description="请先登录" class="login-empty">
        <van-button type="primary" @click="router.push('/login')" size="large">立即登录</van-button>
      </van-empty>
    </div>

    <!-- 团队管理内容 -->
    <div class="team-content" v-else>
      <!-- 功能按钮 -->
      <div class="action-buttons">
        <van-button type="primary" @click="showCreateDialog = true" icon="plus">创建团队</van-button>
        <van-button type="success" @click="showJoinDialog = true" icon="friends-o">加入团队</van-button>
      </div>

      <!-- 统计信息 -->
      <div class="stats-section">
        <van-grid :column-num="3" :border="false">
          <van-grid-item>
            <div class="stat-item">
              <div class="stat-number">{{ teams.length }}</div>
              <div class="stat-label">总团队数</div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-item">
              <div class="stat-number">{{ myTeams.length }}</div>
              <div class="stat-label">我的团队</div>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-item">
              <div class="stat-number">{{ filteredTeams.length }}</div>
              <div class="stat-label">筛选结果</div>
            </div>
          </van-grid-item>
        </van-grid>
      </div>

      <!-- 标签页 -->
      <van-tabs v-model:active="activeTab" sticky>
        <van-tab title="所有团队">
          <van-pull-refresh v-model="loading" @refresh="fetchTeams">
            <van-list
              v-model:loading="loading"
              :finished="true"
              finished-text="没有更多了"
            >
              <van-cell-group v-for="team in filteredTeams" :key="team.id" class="team-card">
                <van-cell @click="router.push(`/team/${team.id}`)">
                  <template #title>
                    <div class="team-header">
                      <div class="team-title">
                        <span class="team-name">{{ team.teamName || team.name }}</span>
                        <van-tag 
                          :type="teamStatusMap[team.status]?.color"
                          size="small"
                        >
                          <van-icon :name="teamStatusMap[team.status]?.icon" />
                          {{ teamStatusMap[team.status]?.text }}
                        </van-tag>
                        <van-tag 
                          v-if="isTeamExpired(team)" 
                          type="danger" 
                          size="small"
                        >
                          已过期
                        </van-tag>
                      </div>
                    </div>
                  </template>
                  <template #label>
                    <div class="team-info">
                      <p class="team-description">{{ team.description }}</p>
                      <div class="team-meta">
                        <span class="meta-item">
                          <van-icon name="user-o" />
                          {{ team.createUser?.userName || '未知' }}
                        </span>
                        <span class="meta-item">
                          <van-icon name="friends-o" />
                          {{ team.hasJoinNum }}/{{ team.maxNum }}
                        </span>
                        <span class="meta-item">
                          <van-icon name="clock-o" />
                          {{ formatRelativeTime(team.expireTime) }}
                        </span>
                      </div>
                      <!-- 团队进度条 -->
                      <div class="team-progress">
                        <van-progress 
                          :percentage="getTeamProgress(team)" 
                          :color="getTeamProgress(team) >= 100 ? '#ee0a24' : '#1989fa'"
                          :show-pivot="false"
                        />
                      </div>
                    </div>
                  </template>
                  <template #right-icon>
                    <div class="team-actions">
                      <van-button 
                        v-if="canJoinTeam(team) && !isTeamExpired(team)" 
                        size="small" 
                        type="primary"
                        @click.stop="() => { selectedTeam = team; showJoinDialog = true }"
                      >
                        加入
                      </van-button>
                      <van-button 
                        v-if="isTeamCreator(team)" 
                        size="small" 
                        type="danger"
                        @click.stop="dismissTeam(team.id)"
                      >
                        解散
                      </van-button>
                      <van-button 
                        v-if="isTeamExpired(team)" 
                        size="small" 
                        type="default"
                        disabled
                      >
                        已过期
                      </van-button>
                    </div>
                  </template>
                </van-cell>
              </van-cell-group>
              
              <!-- 空状态 -->
              <van-empty 
                v-if="filteredTeams.length === 0 && !loading" 
                description="暂无符合条件的团队"
              />
            </van-list>
          </van-pull-refresh>
        </van-tab>

        <van-tab title="我的团队">
          <van-pull-refresh v-model="loading" @refresh="fetchMyTeams">
            <van-list
              v-model:loading="loading"
              :finished="true"
              finished-text="没有更多了"
            >
              <van-cell-group v-for="team in myTeams" :key="team.id" class="team-card">
                <van-cell @click="router.push(`/team/${team.id}`)">
                  <template #title>
                    <div class="team-header">
                      <div class="team-title">
                        <span class="team-name">{{ team.teamName || team.name }}</span>
                        <van-tag 
                          :type="teamStatusMap[team.status]?.color"
                          size="small"
                        >
                          <van-icon :name="teamStatusMap[team.status]?.icon" />
                          {{ teamStatusMap[team.status]?.text }}
                        </van-tag>
                        <van-tag 
                          v-if="isTeamCreator(team)" 
                          type="primary" 
                          size="small"
                        >
                          创建者
                        </van-tag>
                      </div>
                    </div>
                  </template>
                  <template #label>
                    <div class="team-info">
                      <p class="team-description">{{ team.description }}</p>
                      <div class="team-meta">
                        <span class="meta-item">
                          <van-icon name="friends-o" />
                          {{ team.hasJoinNum }}/{{ team.maxNum }}
                        </span>
                        <span class="meta-item">
                          <van-icon name="clock-o" />
                          {{ formatRelativeTime(team.expireTime) }}
                        </span>
                      </div>
                      <!-- 团队进度条 -->
                      <div class="team-progress">
                        <van-progress 
                          :percentage="getTeamProgress(team)" 
                          :color="getTeamProgress(team) >= 100 ? '#ee0a24' : '#1989fa'"
                          :show-pivot="false"
                        />
                      </div>
                    </div>
                  </template>
                  <template #right-icon>
                    <div class="team-actions">
                      <van-button 
                        v-if="!isTeamCreator(team)" 
                        size="small" 
                        type="warning"
                        @click.stop="exitTeam(team.id)"
                      >
                        退出
                      </van-button>
                      <van-button 
                        v-if="isTeamCreator(team)" 
                        size="small" 
                        type="danger"
                        @click.stop="dismissTeam(team.id)"
                      >
                        解散
                      </van-button>
                    </div>
                  </template>
                </van-cell>
              </van-cell-group>
              
              <!-- 空状态 -->
              <van-empty 
                v-if="myTeams.length === 0 && !loading" 
                description="您还没有加入任何团队"
              />
            </van-list>
          </van-pull-refresh>
        </van-tab>
      </van-tabs>
    </div>

    <!-- 创建团队对话框 -->
    <van-dialog
      v-model:show="showCreateDialog"
      title="创建团队"
      show-cancel-button
      @confirm="createTeam"
      @cancel="resetCreateForm"
    >
      <van-form>
        <van-field
          v-model="createForm.teamName"
          label="团队名称"
          placeholder="请输入团队名称"
          required
        />
        <van-field
          v-model="createForm.description"
          label="团队描述"
          type="textarea"
          placeholder="请输入团队描述"
          required
        />
        <van-field
          v-model="createForm.maxNum"
          label="最大人数"
          type="number"
          placeholder="请输入最大人数(2-20)"
          required
        />
        <van-field
          v-model="createForm.expireTime"
          label="过期时间"
          type="datetime-local"
          placeholder="请选择过期时间(可选)"
        />
        <van-field
          :model-value="teamStatusMap[createForm.status]?.text || '公开'"
          label="团队状态"
          readonly
          is-link
          @click="showStatusPicker = true"
        />
        <van-popup v-model:show="showStatusPicker" position="bottom">
          <van-picker
            :columns="[
              { text: '公开', value: 0 },
              { text: '私有', value: 1 },
              { text: '加密', value: 2 }
            ]"
            @confirm="(value) => { createForm.status = value.value; showStatusPicker = false }"
            @cancel="showStatusPicker = false"
          />
        </van-popup>
        <van-field
          v-if="createForm.status === 2"
          v-model="createForm.password"
          label="团队密码"
          type="password"
          placeholder="请输入团队密码"
          required
        />
      </van-form>
    </van-dialog>

    <!-- 加入团队对话框 -->
    <van-dialog
      v-model:show="showJoinDialog"
      title="加入团队"
      show-cancel-button
      @confirm="joinTeam"
      @cancel="() => { resetJoinForm(); selectedTeam = null }"
    >
      <van-form>
        <van-field
          v-if="!selectedTeam"
          v-model="joinForm.teamId"
          label="团队ID"
          type="number"
          placeholder="请输入团队ID"
          required
        />
        <van-field
          v-if="selectedTeam"
          :model-value="`${selectedTeam.teamName || selectedTeam.name} (ID: ${selectedTeam.id})`"
          label="团队信息"
          readonly
        />
        <van-field
          v-if="selectedTeam && selectedTeam.status === 2"
          v-model="joinForm.password"
          label="团队密码"
          type="password"
          placeholder="请输入团队密码"
          required
        />
        <van-field
          v-if="!selectedTeam"
          v-model="joinForm.password"
          label="团队密码"
          type="password"
          placeholder="请输入团队密码(如果是加密团队)"
        />
      </van-form>
    </van-dialog>

    <!-- 筛选对话框 -->
    <van-dialog
      v-model:show="showFilterDialog"
      title="筛选条件"
      show-cancel-button
      @confirm="applyFilters"
      @cancel="cancelFilters"
    >
      <van-form>
        <van-field
          :model-value="tempFilterStatus === -1 ? '全部状态' : teamStatusMap[tempFilterStatus]?.text"
          label="团队状态"
          readonly
          is-link
          @click="showStatusFilterPicker = true"
        />
        <!-- 调试信息 -->
        <div style="font-size: 12px; color: #999; padding: 0 16px; margin-bottom: 8px;">
          调试: tempFilterStatus = {{ tempFilterStatus }}, 显示值 = {{ tempFilterStatus === -1 ? '全部状态' : teamStatusMap[tempFilterStatus]?.text }}
        </div>
        
        <van-popup
          v-model:show="showStatusFilterPicker"
          position="bottom"
          round
        >
          <van-picker
            :columns="[
              { text: '全部状态', value: -1 },
              { text: '公开', value: 0 },
              { text: '私有', value: 1 },
              { text: '加密', value: 2 }
            ]"
            @confirm="onStatusPickerConfirm"
            @cancel="showStatusFilterPicker = false"
          />
        </van-popup>
        <van-field
          :model-value="tempFilterMaxNum === -1 ? '全部人数' : `${tempFilterMaxNum}人`"
          label="最大人数"
          readonly
          is-link
          @click="showMaxNumFilterPicker = true"
        />
        <!-- 调试信息 -->
        <div style="font-size: 12px; color: #999; padding: 0 16px; margin-bottom: 8px;">
          调试: tempFilterMaxNum = {{ tempFilterMaxNum }}, 显示值 = {{ tempFilterMaxNum === -1 ? '全部人数' : `${tempFilterMaxNum}人` }}
        </div>
        
        <van-popup
          v-model:show="showMaxNumFilterPicker"
          position="bottom"
          round
        >
          <van-picker
            :columns="[
              { text: '全部人数', value: -1 },
              { text: '2人', value: 2 },
              { text: '3人', value: 3 },
              { text: '5人', value: 5 },
              { text: '10人', value: 10 },
              { text: '20人', value: 20 }
            ]"
            @confirm="onMaxNumPickerConfirm"
            @cancel="showMaxNumFilterPicker = false"
          />
        </van-popup>
      </van-form>
    </van-dialog>
  </div>
</template>

<style scoped>
.team-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.login-prompt {
  padding: 40px 20px;
}

.team-content {
  padding: 16px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.filter-tags {
  padding: 8px 16px;
  background-color: white;
  border-bottom: 1px solid #ebedf0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.stats-section {
  margin-bottom: 16px;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-item {
  text-align: center;
  padding: 12px 0;
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #1989fa;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #969799;
}

.team-card {
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.team-card:hover {
  transform: translateY(-2px);
}

.team-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.team-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.team-name {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.team-info {
  margin-top: 8px;
}

.team-description {
  color: #646566;
  margin: 4px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.team-meta {
  display: flex;
  gap: 16px;
  margin: 8px 0;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #969799;
  font-size: 12px;
}

.team-progress {
  margin-top: 8px;
}

.team-actions {
  display: flex;
  gap: 8px;
  flex-direction: column;
}

:deep(.van-tabs__content) {
  padding: 16px 0;
}

:deep(.van-cell-group) {
  margin-bottom: 12px;
}

:deep(.van-field__label) {
  width: 80px;
}

:deep(.van-nav-bar__right .van-icon) {
  font-size: 18px;
  color: #323233;
  cursor: pointer;
  transition: color 0.2s ease;
}

:deep(.van-nav-bar__right .van-icon:hover) {
  color: #1989fa;
}

:deep(.van-nav-bar__right .van-icon.active) {
  color: #1989fa;
}

:deep(.van-tag) {
  display: flex;
  align-items: center;
  gap: 2px;
}

:deep(.van-progress) {
  height: 4px;
}

:deep(.van-grid-item__content) {
  padding: 12px 8px;
}

:deep(.van-empty) {
  padding: 40px 20px;
}
</style>
