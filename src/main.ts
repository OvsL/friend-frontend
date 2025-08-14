import { createApp } from 'vue'
// import './style.css' 默认样式
import App from './App.vue'
import { Button, Cell, CellGroup, Divider, Icon, NavBar, Search, Tabbar, TabbarItem, Tag, TreeSelect, Image, Form, Field, Popup, Picker, Toast, ActionSheet } from 'vant';
import { createRouter, createWebHistory } from 'vue-router'
import routes from './config/router';

// 引入axios插件
import './plugins/myAxios'


const app = createApp(App);
app.use(Button);
app.use(NavBar);
app.use(Icon);
app.use(Tabbar);
app.use(TabbarItem);
app.use(Search);
app.use(Tag);
app.use(Divider);
app.use(TreeSelect);
app.use(Cell);
app.use(CellGroup);
app.use(Image);
app.use(Form);
app.use(Field);
app.use(Popup);
app.use(Picker);
app.use(Toast);
app.use(ActionSheet);

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// 添加路由守卫
router.beforeEach((to, from, next) => {
    // 不需要认证的页面
    const publicPages = ['/login', '/register', '/test-auth']
    
    // 如果是公开页面，直接允许访问
    if (publicPages.includes(to.path)) {
        next()
        return
    }
    
    // 检查用户是否已登录
    const token = localStorage.getItem('token')
    const userInfo = localStorage.getItem('userInfo')
    
    console.log('路由守卫检查 - 目标路径:', to.path)
    console.log('路由守卫检查 - token存在:', !!token)
    console.log('路由守卫检查 - userInfo存在:', !!userInfo)
    
    // 验证登录状态
    let isLoggedIn = false
    if (token && userInfo) {
        try {
            const parsedUserInfo = JSON.parse(userInfo)
            isLoggedIn = !!(parsedUserInfo && parsedUserInfo.id && parsedUserInfo.id !== 0)
            console.log('路由守卫检查 - 解析的用户信息:', parsedUserInfo)
            console.log('路由守卫检查 - 登录状态:', isLoggedIn)
        } catch (error) {
            console.error('解析用户信息失败:', error)
            // 清除无效数据
            localStorage.removeItem('userInfo')
            localStorage.removeItem('token')
        }
    }
    
    if (!isLoggedIn) {
        console.log('用户未登录，跳转到登录页面')
        // 保存原始目标路径，登录后可以跳转回去
        if (to.path !== '/login') {
            next({
                path: '/login',
                query: { redirect: to.fullPath }
            })
        } else {
            next()
        }
        return
    }
    
    console.log('用户已登录，允许访问:', to.path)
    // 已登录，允许访问
    next()
})

app.use(router);
app.mount('#app');


