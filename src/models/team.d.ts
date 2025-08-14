/**
 * 团队信息
 */
export type Team = {
    id: number;
    name: string;
    description: string;
    maxNum: number;
    expireTime: Date;
    userId: number;
    status: number;
    password?: string;
    createTime: Date;
    updateTime: Date;
    isDelete: number;
};

/**
 * 团队用户视图对象
 */
export type TeamUserVo = {
    id: number;
    name: string;
    description: string;
    maxNum: number;
    expireTime: Date;
    userId: number;
    status: number;
    password?: string;
    createTime: Date;
    updateTime: Date;
    isDelete: number;
    createUser: {
        id: number;
        userName: string;
        userAccount: string;
        avatarUrl: string;
        gender: number;
        phone: string;
        email: string;
        userStatus: number;
        userRole: number;
        tags: string[];
        createTime: Date;
        profile: string;
    };
    hasJoinNum: number;
};

/**
 * 创建团队请求
 */
export type TeamAddRequest = {
    teamName: string;
    description: string;
    maxNum: number;
    expireTime: Date;
    status: number;
    password?: string;
};

/**
 * 更新团队请求
 */
export type TeamUpdateRequest = {
    id: number;
    teamName?: string;
    description?: string;
    maxNum?: number;
    expireTime?: Date;
    status?: number;
    password?: string;
};

/**
 * 查询团队请求
 */
export type TeamQueryRequest = {
    id?: number;
    name?: string;
    description?: string;
    maxNum?: number;
    userId?: number;
    status?: number;
    searchText?: string;
    pageNum?: number;
    pageSize?: number;
};

/**
 * 加入团队请求
 */
export type TeamJoinRequest = {
    teamId: number;
    password?: string;
};

/**
 * 退出团队请求
 */
export type TeamExitRequest = {
    teamId: number;
};
