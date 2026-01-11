import { createRouter, createWebHistory } from 'vue-router' 
import Dashboard from '../pages/Dashboard.vue'
import Login from '../pages/Login.vue'
import Profile from '../pages/Profile.vue'
import Teams from '../pages/Teams.vue'
import Planning from '../pages/Planning.vue'
import AdminUsers from '../pages/admin/AdminUsers.vue'
import AdminTeams from '../pages/admin/AdminTeams.vue'
import AdminPlannings from '../pages/admin/AdminPlannings.vue'
import AdminClocks from '../pages/admin/AdminClocks.vue'
import AdminRoles from '../pages/admin/AdminRoles.vue'
import AdminReports from '../pages/admin/AdminReports.vue'
import ClocksHistory from '../pages/ClocksHistory.vue'
import Kpis from '../pages/Kpis.vue'

const routes = [
  { path: '/', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/kpis', component: Kpis, meta: { requiresAuth: true, managerOnly: true } },
  { path: '/profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/teams', component: Teams, meta: { requiresAuth: true } },
  { path: '/login', component: Login },
  { path: '/planning', component: Planning },
  { path: '/admin/users', component: AdminUsers, meta: { requiresAuth: true, adminOnly: true } },
  { path: '/admin/teams', component: AdminTeams, meta: { requiresAuth: true, adminOnly: true } },
  { path: '/admin/plannings', component: AdminPlannings, meta: { requiresAuth: true, adminOnly: true } },
  { path: '/admin/clocks', component: AdminClocks, meta: { requiresAuth: true, adminOnly: true } },
  { path: '/admin/roles', component: AdminRoles, meta: { requiresAuth: true, adminOnly: true } },
  { path: '/admin/reports', component: AdminReports, meta: { requiresAuth: true, adminOnly: true } },
  { path: '/clocks/:userId', component: ClocksHistory, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const isLoggedIn = !!localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (to.meta.requiresAuth && !isLoggedIn) {
    return next('/login');
  }

  if (to.path === '/login' && isLoggedIn) {
    return next('/');
  }

  // Admin-only pages
  if (to.meta.adminOnly && user.profile !== 'admin') {
    return next('/');
  }

  if (to.meta.managerOnly && !(user.profile === 'manager' || user.profile === 'admin')) {
    return next('/');
  }

  next();
});


export default router
