import { MutationTree } from 'vuex';
import { RootLoggedState } from '../types/store.interface';
import router from '../router/index';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import AuthService from '@/services/auth.service';


export const mutations: MutationTree<RootLoggedState> = {
	LoginSuccess(state, user) {
		if (user.twofactorauth === true) {
			state.TwoFA = true;
			state.user = user;
			state.avatar = '';
			AuthService.loginPushToBack();
			router.push('/account2fa');
		}
		else 
		{
		state.status.loggedIn = true;
		state.user = user;
		state.avatar = '';
		state.TwoFA = false;
		AuthService.loginPushToBack();
		router.push('/account');
		}
	},
	DisconnectedUser(state, payload) {
		localStorage.removeItem('user');
		state.status.loggedIn = false;
		state.user = null;
		state.avatar = '';
		toast.error(payload);
		router.push('/');
	},
	logout(state) {
		AuthService.logoutPushToBack();
		localStorage.removeItem('user');
		state.status.loggedIn = false;
		state.user = null;
		state.avatar = '';
		toast.success('You are logout');
		router.push('/');
	},
	setTwoFA(state, payload) {
		state.TwoFA = payload;
		state.status.loggedIn = false;
		state.user = JSON.parse(localStorage.getItem('user') || '{}');
		toast.success('You are logout because you have 2FA changed');
		router.push('/');
	},
	go2FA(state, payload) {
		state.TwoFA = payload;
		state.status.loggedIn = true;
		toast.success('You are loggin with 2FA activated');
		state.avatar = '';
		state.user = JSON.parse(localStorage.getItem('user') || '{}');
		router.push('/account');
	},
}
