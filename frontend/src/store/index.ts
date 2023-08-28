import VueX, { StoreOptions } from 'vuex';
// import store from '.store/index';
import { RootLoggedState } from '../types/store.interface';
import { actions } from './auth.actions';
import { mutations } from './auth.mutations';
import { LocalStorageUser } from '../types/user.interface';


const user: LocalStorageUser = JSON.parse(localStorage.getItem('user') as string);

let initialState: RootLoggedState;

initialState = { status: { loggedIn: false }, user: null, avatar: '', roomId: -1 ,TwoFA: false, challenger: false, opponent: false
	, socketchallenger: null, socketopponent: null, ischatconnected: false, nameofmatch: ''};

if (user)	{
			
			if (user.twofactorauth === true)	{
				initialState = { status: { loggedIn: true }, user: user, avatar : '', roomId: -1, TwoFA: true, challenger: false, opponent: false,
				socketchallenger: null, socketopponent: null, ischatconnected: false, nameofmatch: ''};
			}
			else	{
				initialState = { status: { loggedIn: true }, user: user, avatar : '', roomId: -1, TwoFA: false, challenger: false, opponent: false,
				socketchallenger: null, socketopponent: null, ischatconnected: false, nameofmatch: ''};
			}
		initialState = { status: { loggedIn: false }, user: null, avatar: '', TwoFA: false, roomId: -1, challenger: false, opponent: false,
		socketchallenger: null, socketopponent: null, ischatconnected: false, nameofmatch: ''};

	}

	const defineStore: StoreOptions<RootLoggedState> = {
	state: initialState,
	actions,
	mutations,
}

export default new VueX.Store<RootLoggedState>(defineStore);
