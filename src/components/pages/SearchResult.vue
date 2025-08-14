<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast } from 'vant';
import { userApi } from '../../api/user.js';

const route = useRoute();
const router = useRouter();

const searchTags = ref([]);
const searchResults = ref([]);
const loading = ref(false);

onMounted(() => {
  // 从路由参数获取搜索标签
  const tags = route.query.tags;
  if (tags) {
    try {
      searchTags.value = JSON.parse(decodeURIComponent(tags));
      searchUsersByTags();
    } catch (error) {
      console.error('解析标签参数失败:', error);
      showToast('标签参数错误');
    }
  }
});

// 根据标签搜索用户
const searchUsersByTags = async () => {
  if (searchTags.value.length === 0) {
    showToast('请选择搜索标签');
    return;
  }

  loading.value = true;
  try {
    // 提取标签名称列表
    const tagNameList = searchTags.value.map(tag => tag.text);
    console.log('搜索标签:', tagNameList);
    
    // 调用后端API
    const response = await userApi.searchUsersByTags(tagNameList);
    console.log('搜索结果:', response);
    
    // 检查响应格式并提取用户数据
    let userData = [];
    if (response.data && response.data.code === 0) {
      // 标准响应格式：{ code: 0, data: [...], msg: 'ok' }
      userData = response.data.data || [];
    } else if (Array.isArray(response.data)) {
      // 直接返回数组格式
      userData = response.data;
    } else {
      console.error('未知的响应格式:', response.data);
      showToast('响应格式错误');
      return;
    }
    
    // 处理用户数据
    searchResults.value = userData.map(user => ({
      id: user.id,
      name: user.userName,
      avatar: user.avatarUrl || 'https://img.yzcdn.cn/vant/cat.jpeg',
      tags: parseUserTags(user.tags), // 解析标签字符串
      description: `账号: ${user.userAccount} | 性别: ${user.gender === 0 ? '男' : '女'} | 邮箱: ${user.email}`,
      userAccount: user.userAccount,
      gender: user.gender,
      email: user.email,
      phone: user.userPhone
    })) || [];
    
    if (searchResults.value.length === 0) {
      showToast('未找到匹配的用户');
    }
  } catch (error) {
    console.error('搜索用户失败:', error);
    showToast('搜索失败，请重试');
  } finally {
    loading.value = false;
  }
};

// 解析用户标签字符串
const parseUserTags = (tagsString) => {
  if (!tagsString) return [];
  
  try {
    const tagsArray = JSON.parse(tagsString);
    return tagsArray.map((tag, index) => ({
      id: index,
      text: tag,
      name: tag
    }));
  } catch (error) {
    console.error('解析标签失败:', error);
    return [];
  }
};

const goToUserDetail = (userId) => {
  router.push(`/user/${userId}`);
};

const goBack = () => {
  router.push('/searchTag');
};

// 获取用户的标签文本
const getUserTagsText = (user) => {
  if (user.tags && Array.isArray(user.tags)) {
    return user.tags.map(tag => tag.text || tag.name).join(', ');
  }
  return '';
};

// 格式化用户数据，确保数据结构一致
const formatUserData = (user) => {
  return {
    id: user.id,
    name: user.name,
    avatar: user.avatar,
    tags: user.tags || [],
    description: user.description
  };
};
</script>

<template>
  <div>
    <van-nav-bar
      title="搜索结果"
      left-text="返回"
      left-arrow
      @click-left="goBack"
    />
    
    <!-- 搜索标签展示 -->
    <div style="padding: 16px;">
      <van-divider content-position="left">搜索标签</van-divider>
      <div>
        <van-tag
          v-for="tag in searchTags"
          :key="tag.id"
          size="medium"
          type="primary"
          style="margin-right: 8px; margin-bottom: 8px;"
        >
          {{ tag.text }}
        </van-tag>
      </div>
    </div>

    <!-- 搜索结果 -->
    <van-divider content-position="left">搜索结果 ({{ searchResults.length }})</van-divider>
    
    <van-loading v-if="loading" style="text-align: center; padding: 20px;">
      搜索中...
    </van-loading>
    
    <div v-else-if="searchResults.length === 0" style="text-align: center; padding: 20px; color: #969799;">
      暂无匹配的用户
    </div>
    
    <van-cell-group v-else>
      <van-cell
        v-for="user in searchResults"
        :key="user.id"
        :title="formatUserData(user).name"
        :label="formatUserData(user).description"
        is-link
        @click="goToUserDetail(user.id)"
      >
        <template #icon>
          <van-image
            :src="formatUserData(user).avatar"
            width="40"
            height="40"
            round
            style="margin-right: 12px;"
          />
        </template>
        <template #right-icon>
          <div style="margin-top: 8px;">
            <van-tag
              v-for="tag in formatUserData(user).tags"
              :key="tag.id"
              size="small"
              type="success"
              style="margin-right: 4px;"
            >
              {{ tag.text || tag.name }}
            </van-tag>
          </div>
        </template>
      </van-cell>
    </van-cell-group>
  </div>
</template>

<style scoped>
</style> 