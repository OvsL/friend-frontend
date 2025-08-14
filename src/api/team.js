import myAxios from '../plugins/myAxios.ts';

// 团队相关API
export const teamApi = {
    // 创建团队
    addTeam: (teamData) => {
        return myAxios.post('/team/add', teamData);
    },

    // 删除团队
    deleteTeam: (teamData) => {
        return myAxios.post('/team/delete', teamData);
    },

    // 更新团队
    updateTeam: (teamData) => {
        return myAxios.put('/team/update', teamData);
    },

    // 获取团队详情
    getTeamById: (id) => {
        return myAxios.get('/team/get', {
            params: { id }
        });
    },

    // 获取团队列表
    listTeams: (params) => {
        return myAxios.get('/team/list', { params });
    },

    // 获取团队分页列表
    listTeamByPage: (params) => {
        return myAxios.get('/team/list/page', { params });
    },

    // 获取我的团队列表
    listMyTeams: () => {
        return myAxios.get('/team/list/myTeam');
    },

    // 加入团队
    joinTeam: (teamData) => {
        return myAxios.post('/team/join', teamData);
    },

    // 退出团队
    exitTeam: (teamData) => {
        return myAxios.post('/team/exit', teamData);
    },

    // 解散队伍
    dismissTeam: (teamData) => {
        return myAxios.post('/team/dismiss', teamData);
    }
};
