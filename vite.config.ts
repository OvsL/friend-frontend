import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// 引入组件自动导入插件及其解析器
import ComponentsPlugin from 'unplugin-vue-components/vite';
import { VantResolver } from 'unplugin-vue-components/resolvers';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // 配置组件自动导入插件
    ComponentsPlugin({
      resolvers: [VantResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});