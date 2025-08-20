import myAxios from '../plugins/myAxios.ts';

// 用户相关API
export const userApi = {
    // 根据标签搜索用户
    searchUsersByTags: (tagNameList) => {
        // 确保tagNameList是数组格式
        const params = new URLSearchParams();
        if (Array.isArray(tagNameList)) {
            tagNameList.forEach(tag => {
                params.append('tagNameList', tag);
            });
        }
        
        return myAxios.get('/user/search/tags', {
            params: params
        });
    },
    
    // 获取推荐用户
    getRecommendUsers: (pageNum = 1, pageSize = 10) => {
        return myAxios.get('/user/recommend', {
            params: { pageNum, pageSize }
        });
    },
    
    // 获取用户信息
    getUserInfo: (userId) => {
        return myAxios.get(`/user/${userId}`);
    },
    
    // 更新用户信息
    updateUserInfo: (userId, data) => {
        return myAxios.put(`/user/${userId}`, data);
    },
    
    // 更新用户信息 (新的接口)
    updateUser: (userData) => {
        return myAxios.post('/user/update', userData);
    },
    
    // 搜索用户
    searchUsers: (keyword) => {
        return myAxios.get('/user/search', {
            params: { keyword }
        });
    },
    
    // 获取用户列表
    getUserList: (params) => {
        return myAxios.get('/user/list', { params });
    },
    
    // 用户登录
    login: (loginData) => {
        return myAxios.post('/user/login', loginData);
    },
    
    // 用户注册
    register: (registerData) => {
        return myAxios.post('/user/register', registerData);
    },
    
    // 用户登出
    logout: () => {
        return myAxios.post('/user/logout');
    },
    
    // 匹配用户
    matchUsers: (pageSize = 10) => {
        return myAxios.get('/user/match', {
            params: { pageSize }
        });
    },
    
    // 获取当前用户信息
    getCurrentUser: () => {
        return myAxios.get('/user/current');
    }
}; 