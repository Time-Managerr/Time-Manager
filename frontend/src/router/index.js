import { createRouter, createWebHistory } from 'vue-router' 
import Dashboard from '../pages/Dashboard.vue'
import Login from '../pages/Login.vue'
import Profile from '../pages/Profile.vue'
import Teams from '../pages/Teams.vue'
import Planning from '../pages/Planning.vue'

const routes = [
  { path: '/', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/teams', component: Teams, meta: { requiresAuth: true } },
  { path: '/login', component: Login },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const isLoggedIn = !!localStorage.getItem('token');

  if (to.meta.requiresAuth && !isLoggedIn) {
    return next('/login');
  }

  if (to.path === '/login' && isLoggedIn) {
    return next('/');
  }

  next();
});


export default router
