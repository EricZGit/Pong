import axios from 'axios'
import store from './store/index'

const instance = axios.create();

instance.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  if (error && error.response.status === 401) {
    store.commit('DisconnectedUser', { message: "Your session has expired" });
  }
return Promise.reject(error);
});

instance.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  if (error && error.response.status === 444) {
    store.commit('DisconnectedUser', { message: "You are not allowed to access this page" });
  }
return Promise.reject(error);
});

instance.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  if (error && error.response.status === 445) {
    store.commit('DisconnectedUser', { message: "You are not allowed to access this page" });
  }
return Promise.reject(error);
});

instance.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  if (error && error.response.status === 404) {
    // console.log("404");
  }
return Promise.reject(error);
});

export default instance;
