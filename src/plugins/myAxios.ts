import axios from 'axios';
import { clearUserInfo } from '../utils/auth.js';

// 创建实例时配置默认值
const instance = axios.create({
    baseURL: 'http://localhost:8080/api', // 修正为http协议
    timeout: 100000,
    withCredentials: true // 允许跨域请求携带cookie
});

// 添加请求拦截器
instance.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});

// 添加响应拦截器
instance.interceptors.response.use(function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    return response; // 直接返回完整响应，让调用方处理数据结构
}, function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    const { response } = error;
    
    if (response) {
        switch (response.status) {
            case 401:
                console.error('未授权，请重新登录');
                clearUserInfo();
                // 跳转到登录页面
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                break;
            case 403:
                console.error('拒绝访问');
                break;
            case 404:
                console.error('请求的资源不存在');
                break;
            case 500:
                console.error('服务器内部错误');
                break;
            default:
                console.error('网络错误');
        }
    } else {
        console.error('网络连接失败');
    }
    
    return Promise.reject(error);
});

export default instance;