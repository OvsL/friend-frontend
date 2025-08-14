<script setup>
import { ref, onMounted } from 'vue'
import { showToast } from 'vant'
import { teamApi } from '../../api/team.js'
import userStore from '../../utils/userStore.js'

// 当前用户信息
const currentUser = userStore.getUser()

// 测试结果
const testResults = ref([])

// 添加测试结果
const addTestResult = (testName, success, message) => {
  testResults.value.push({
    name: testName,
    success,
    message,
    time: new Date().toLocaleTimeString()
  })
}

// 测试获取团队列表
const testListTeams = async () => {
  try {
    const response = await teamApi.listTeams({})
    if (response.data && response.data.code === 0) {
      addTestResult('获取团队列表', true, `成功获取 ${response.data.data?.length || 0} 个团队`)
    } else {
      addTestResult('获取团队列表', false, response.data?.message || '获取失败')
    }
  } catch (error) {
    addTestResult('获取团队列表', false, error.message)
  }
}

// 测试获取我的团队
const testListMyTeams = async () => {
  try {
    const response = await teamApi.listMyTeams()
    if (response.data && response.data.code === 0) {
      addTestResult('获取我的团队', true, `成功获取 ${response.data.data?.length || 0} 个团队`)
    } else {
      addTestResult('获取我的团队', false, response.data?.message || '获取失败')
    }
  } catch (error) {
    addTestResult('获取我的团队', false, error.message)
  }
}

// 测试创建团队
const testCreateTeam = async () => {
  try {
    const teamData = {
      teamName: '测试团队',
      description: '这是一个测试团队',
      maxNum: 5,
      status: 0
    }
    
    console.log('发送的团队数据:', teamData)
    
    const response = await teamApi.addTeam(teamData)
    console.log('创建团队响应:', response)
    
    if (response.data && response.data.code === 0) {
      addTestResult('创建团队', true, `成功创建团队，ID: ${response.data.data}`)
    } else {
      addTestResult('创建团队', false, response.data?.message || '创建失败')
    }
  } catch (error) {
    console.error('创建团队错误详情:', error)
    addTestResult('创建团队', false, error.message)
  }
}

// 运行所有测试
const runAllTests = async () => {
  testResults.value = []
  
  if (!currentUser || !currentUser.id) {
    addTestResult('用户登录状态', false, '用户未登录')
    return
  }
  
  addTestResult('用户登录状态', true, `用户已登录: ${currentUser.userName || currentUser.userAccount}`)
  
  await testListTeams()
  await testListMyTeams()
  await testCreateTeam()
  
  showToast('测试完成')
}

// 页面初始化
onMounted(() => {
  runAllTests()
})
</script>

<template>
  <div class="test-team-page">
    <!-- 页面头部 -->
    <van-nav-bar title="团队功能测试" />

    <!-- 测试控制 -->
    <div class="test-controls">
      <van-button type="primary" @click="runAllTests" size="large" block>
        重新运行测试
      </van-button>
      <van-button type="success" @click="testCreateTeam" size="large" block style="margin-top: 12px;">
        单独测试创建团队
      </van-button>
    </div>

    <!-- 测试结果 -->
    <div class="test-results">
      <van-cell-group title="测试结果">
        <van-cell
          v-for="result in testResults"
          :key="result.time"
          :title="result.name"
          :value="result.success ? '成功' : '失败'"
        >
          <template #label>
            <div class="test-message">
              <span :class="{ 'success': result.success, 'error': !result.success }">
                {{ result.message }}
              </span>
              <span class="test-time">{{ result.time }}</span>
            </div>
          </template>
          <template #right-icon>
            <van-icon
              :name="result.success ? 'success' : 'cross'"
              :color="result.success ? '#07c160' : '#ee0a24'"
            />
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <!-- 用户信息 -->
    <div class="user-info" v-if="currentUser">
      <van-cell-group title="当前用户信息">
        <van-cell title="用户ID" :value="currentUser.id" />
        <van-cell title="用户名" :value="currentUser.userName || '未设置'" />
        <van-cell title="账号" :value="currentUser.userAccount" />
      </van-cell-group>
    </div>
  </div>
</template>

<style scoped>
.test-team-page {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.test-controls {
  padding: 16px;
}

.test-results {
  padding: 0 16px;
}

.test-message {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.test-message .success {
  color: #07c160;
}

.test-message .error {
  color: #ee0a24;
}

.test-time {
  font-size: 12px;
  color: #969799;
}

.user-info {
  padding: 16px;
  margin-top: 16px;
}

:deep(.van-cell-group__title) {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  padding: 16px 16px 8px;
}
</style>
