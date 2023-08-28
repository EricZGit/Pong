import axios from "../axios-instance";
import authHeader from './auth-header';

// const API_URL = "http://localhost:3000/";
const API_URL = "http://" + window.location.hostname + ":3000/";


class AuthService {
	registerNewUser(username: string, password: string) {
		return axios.post(API_URL + "login/new_user_register", { username: username, password: password });
	}
	
	async loginNewUser(username: string, password: string) {
		const response = await axios.post(API_URL + "login/new_user_login", { username: username, password: password });
		if ( response.data.ID )
			localStorage.setItem('user', JSON.stringify(response.data));
			else 
			throw new Error(response.data);
		return response.data;
	}

	async login42(codename: string, codepass: string) {
		// console.log('login42', codename, codepass);
		if (!codename || !codepass || codepass != 'stateok')
			throw new Error('Bad login');
		const response = await axios.post(API_URL + 'login', { codename: codename, codepass: codepass });
		// console.log('login42', response);
		if (response.data.ID) 
			localStorage.setItem('user', JSON.stringify(response.data));
		else 
			throw new Error(response.data);
		return response.data;
	}

	turnOn2FA() {
		// console.log('turnOn2FA', authHeader());
		return axios.post(API_URL + "2fa/turn-on", '', { headers: authHeader() });
	}

	turnOff2FA() {
		return axios.post(API_URL + "2fa/turn-off", '', { headers: authHeader() });
	}

	uploadEmailCode(code) {
		// console.log('uploadEmailCode', code);
		return axios.post(API_URL + "2fa/upload-email-code", { code: code }, { headers: authHeader() });
	}

	showEmail() {
		return axios.get(API_URL + "2fa/show-email", { headers: authHeader() });
	}

	checkEmailCode(code) {
		return axios.post(API_URL + "2fa/check-email-code", { code: code }, { headers: authHeader() });
	}

	loginPushToBack() {
		return axios.post(API_URL + "login/push-to-back", '', { headers: authHeader() });
	}

	logoutPushToBack() {
		return axios.post(API_URL + "login/out-push-to-back", '', { headers: authHeader() });
	}
}

export default new AuthService();
