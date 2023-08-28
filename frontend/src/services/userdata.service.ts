import axios from '../axios-instance';
import authHeader from './auth-header';

//  const API_URL = "http://localhost:3000/";
const API_URL = "http://" + window.location.hostname + ":3000/";

class UserdataService {
    getUserData() {
        // console.log('userdata.service.ts getUserData()');
        // console.log(authHeader());
        return axios.get(API_URL + "user/data/me", { headers: authHeader() });
    }

    getLeaderboard() {
        // console.log('userdata.service.ts getLeaderboard()');
        // console.log(authHeader());
        return axios.get(API_URL + "user/data/leaderboard");
    }

    changeDisplayName(displayName: string) {
        // console.log('userdata.service.ts changeDisplayName()');
        // console.log('displayname', displayName);
        return axios.post(API_URL + "user/data/change/displayname", { displayName }, { headers: authHeader() });
    }

    getMatchHistory() {
        // console.log('userdata.service.ts getMatchHistory()');
        return axios.get(API_URL + "user/data/matchhistory", { headers: authHeader() });
    }

    uploadAvatar(formData) {
        // console.log('userdata.service.ts uploadAvatar()');
        // console.log('formDataaaaaaa', formData);
        return axios.post(API_URL + "user/data/upload/avatar",  formData , { headers: authHeader() });
    }

    getUserAvatar() {
        // console.log('userdata.service.ts getUserAvatar()');
        return axios.get(API_URL + "user/data/avatar", { headers: authHeader(), responseType: 'blob' });
    }

	getUsersAvatar(path) {
		return axios.post(API_URL + 'user/avatar', { path: path }, { headers: authHeader(), responseType: 'blob' });
	}

    getLeaderboardFriends() {
        // console.log('userdata.service.ts getLeaderboardFriends()');
        return axios.get(API_URL + "user/data/leaderboard/friends", { headers: authHeader() });
    }

    listAllUsers() {
        // console.log('userdata.service.ts listAllUsers()');
        return axios.get(API_URL + "user/data/listall", { headers: authHeader() });
    }

    listAllBlocked() {
        // console.log('userdata.service.ts listAllBlocked()');
        return axios.get(API_URL + "user/data/listall/blocked", { headers: authHeader() });
    }

    listAllNoFriends() {
        // console.log('userdata.service.ts listAllNoFriends()');
        return axios.get(API_URL + "user/data/listall/nofriends", { headers: authHeader() });
    }

    debanUser(id: number) {
        // console.log('userdata.service.ts debanUser()');
        return axios.post(API_URL + "user/data/deban", { id }, { headers: authHeader() });
    }

    addFriend(nom) {
        // console.log('userdata.service.ts addFriend()');
        return axios.post(API_URL + "user/data/addfriend", { nom : nom }, { headers: authHeader() });
    }

    unfriend(id: number) {
        // console.log('userdata.service.ts unfriend()');
        return axios.post(API_URL + "user/data/unfriend", { id }, { headers: authHeader() });
    }

    getListAdders() {
        // console.log('userdata.service.ts getListAdders()');
        return axios.get(API_URL + "user/data/listadd", { headers: authHeader() });
    }

    getSuccess() {
        // console.log('userdata.service.ts getSucces()');
        return axios.get(API_URL + "user/data/success", { headers: authHeader() });
    }
}

export default new UserdataService();