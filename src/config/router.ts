import Index from '../components/pages/Index.vue'
import Team from '../components/pages/Team.vue';
import TeamDetail from '../components/pages/TeamDetail.vue';
import TestTeam from '../components/pages/TestTeam.vue';
import User from '../components/pages/User.vue';
import SearchTag from '../components/pages/SearchTag.vue';
import UserEditPage from '../components/pages/UserEditPage.vue';
import SearchResult from '../components/pages/SearchResult.vue'
import Login from '../components/pages/Login.vue'
import Register from '../components/pages/Register.vue'
import TestAuth from '../components/pages/TestAuth.vue'

// 路由配置
const routes = [
    { path: '/', component: Index},
    { path: '/home', component: Index},
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/test-auth', component: TestAuth },
    { path: '/team', component: Team },
    { path: '/team/:id', component: TeamDetail },
    { path: '/test-team', component: TestTeam },
    { path: '/user', component: User },
    { path: '/searchTag', component: SearchTag },
    { path: '/user/edit', component: UserEditPage },
    {
      path: '/searchResult',
      name: 'SearchResult',
      component: SearchResult
    },
]

export default routes;
