import { ActionTree } from 'vuex';
import { RootLoggedState } from '../types/store.interface';
import { User } from '../types/user.interface';
import AuthService from '../services/auth.service';


export const actions: ActionTree<RootLoggedState, RootLoggedState> = {
	async NewUserLogin({ commit }, payload: { username: string, password: string }): Promise<User | string> {
		try {
			if (!commit) throw new Error('No commit');
			const user = await AuthService.loginNewUser(payload.username, payload.password);
			return Promise.resolve(user);
		} 
		catch(e) {
			throw new Error('NewUserLogin error');
		}
	},
	async Login42({ commit }, payload: { codename: string, codepass: string }): Promise<User | string> {
		try {
			if (!commit) throw new Error('No commit');
			const user = await AuthService.login42(payload.codename, payload.codepass);
			return Promise.resolve(user);
		}
		catch(e) {
			throw new Error('Login42 error');
		}
	},
	logout({ commit }) {
		commit('logout');
	},
}
