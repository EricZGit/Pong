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

const ifTwoFA = (from, to, next) =>
{
	if (store.state.TwoFA === true) {
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
		path: '/account2fa',
		name: 'Account2FA',
		component: () => import('../views/Account2fa.vue'),
		beforeEnter: ifTwoFA
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
		path: '/gamesalon',
	 	name: 'GameSalon',
	 	component: () => import('../views/GameSalon.vue'),
	 	beforeEnter: ifAuthenticated
	},
	{
		path: '/gamesalonprivate',
	 	name: 'GameSalonPrivate',
	 	component: () => import('../views/GameSalonPrivate.vue'),
	 	beforeEnter: ifAuthenticated
	},
	{
		path: '/user/:id',
		name: 'User',
		component: () => import('../views/User.vue'),
		beforeEnter: ifAuthenticated
	},
	{
		path: '/auth/oauth_callback',
		name: 'Callback',
		component: () => import('../views/BackFrom42.vue')
	},
	{
		path: '/matchlive',
		name: 'MatchLive',
		component: () => import('../components/MatchLive.vue'),
		beforeEnter: ifAuthenticated
	},
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router