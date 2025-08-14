/**
 * 当前用户信息
 */
export type CurrentUser = {
    id: number;
    userName?: string;
    userAccount: string;
    avatarUrl?: string;
    gender?: number;
    phone?: string;
    email?: string;
    userStatus: number;
    userRole: number;
    tags: string[];
    createTime: Date;
    profile?: string;
    token?: string; // 登录成功后返回的token
  };

/**
 * 登录请求参数
 */
export type UserLoginRequest = {
    userAccount: string;
    userPassword: string;
};