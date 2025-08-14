<script setup>
import { ref, computed } from 'vue';
import { Toast } from 'vant';
import { useRouter } from 'vue-router';
import { watch } from 'vue';

const router = useRouter();

const searchTag = ref('');
const onSearch = () => {
  if (selectedTags.value.length === 0) {
    Toast('请至少选择一个标签');
    return;
  }
  
  // 将选中的标签编码后传递给搜索结果页
  const tagsParam = encodeURIComponent(JSON.stringify(selectedTags.value));
  router.push({
    path: '/searchResult',
    query: { tags: tagsParam }
  });
};
const onCancel = () => router.push('/');

const activeIds = ref(['']);
    const activeIndex = ref(0);
    const items = [
      {
        text: '性别',
        children: [
          { text: '男', id: 1 },
          { text: '女', id: 2 },
        ],
      },
      {
        text: '江苏',
        children: [
          { text: '南京', id: 4 },
          { text: '无锡', id: 5 },
          { text: '徐州', id: 6 },
        ],
      },
      { text: '福建', disabled: true },
    ];

const selectedTags = ref([]);

// 监听 activeIds 变化，将新选中的标签加入 selectedTags，并移除未选中的标签
watch(activeIds, (newIds) => {
  // 添加新选中的标签
  items.forEach(group => {
    if (group.children) {
      group.children.forEach(child => {
        if (newIds.includes(child.id) && !selectedTags.value.some(tag => tag.id === child.id)) {
          selectedTags.value.push(child);
        }
      });
    }
  });
  // 移除未选中的标签
  selectedTags.value = selectedTags.value.filter(tag => newIds.includes(tag.id));
});



// 移除已选标签
const removeTag = (tag) => {
  selectedTags.value = selectedTags.value.filter(t => t.id !== tag.id);
  // 同时从 activeIds 移除
  activeIds.value = activeIds.value.filter(id => id !== tag.id);
};

// 高亮函数可选实现（如需高亮可加）
// const highlightText = (text, keyword) => {
//   if (!keyword) return text;
//   const reg = new RegExp(`(${keyword})`, 'gi');
//   return text.replace(reg, '<span style="color: #ee0a24;">$1</span>');
// };

const filteredItems = computed(() => {
  if (!searchTag.value) return items;
  return items.map(group => {
    if (!group.children) return group;
    const filteredChildren = group.children.filter(child => child.text.includes(searchTag.value));
    return {
      ...group,
      children: filteredChildren
    };
  }).filter(group => !group.children || group.children.length > 0);
});
</script>

<template>
  <van-search
      v-model="searchTag"
      show-action
      placeholder="请输入搜索关键词"
      @search="onSearch"
      @cancel="onCancel"
  />
  
  <van-divider content-position="left">已选标签</van-divider>
  <div>
    <van-tag
      v-for="tag in selectedTags"
      :key="tag.id"
      closeable
      size="medium"
      type="primary"
      @close="removeTag(tag)"
      style="margin-right: 8px; margin-bottom: 8px;"
    >
      {{ tag.text }}
    </van-tag>
  </div>
  
  <van-divider content-position="left">选择标签</van-divider>
  <van-tree-select
      v-model:active-id="activeIds"
      v-model:main-active-index="activeIndex"
      :items="filteredItems"
  />
  
  <!-- 添加搜索按钮 -->
  <div style="padding: 16px;">
    <van-button 
      type="primary" 
      block 
      size="large"
      :disabled="selectedTags.length === 0"
      @click="onSearch"
    >
      搜索用户 ({{ selectedTags.length }})
    </van-button>
  </div>
</template>

<style scoped>
</style>
