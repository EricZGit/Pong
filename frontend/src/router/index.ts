import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'

const ifAuthenticated = (from, to, next) =>
{
	if (store.state.status.loggedIn === true) {
		next();
		return ;
	}
	next({name: 'Home'});
}

const routes = [
	{
		path: '/',
		name: 'Home',
		component: () => import('../views/Home.vue')
	},
	{
		path: '/account',
		name: 'Account',
		component: () => import('../views/Account.vue'),
		beforeEnter: ifAuthenticated
	},
	{
		path: '/chat',
		name: 'Chat',
		component: () => import('../components/Chat.vue'),
		beforeEnter: ifAuthenticated
	},
	{
		path: '/friends',
		name: 'Friends',
		component: () => import('../views/Friends.vue'),
		beforeEnter: ifAuthenticated
	},
	{
		path: '/game',
		name: 'Game',
		component: () => import('../views/Game.vue'),
		beforeEnter: ifAuthenticated
	},
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router