<script lang="ts">
	import { defineComponent } from 'vue';

  	export default defineComponent({
		name: 'Login',
		methods: {
			logout() : void {
				this.$store.dispatch('logout');
			},
			redirectTo42() : void {
				const user = localStorage.getItem('user');
				if (!user) {
					// window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-badc85f0173f07c74b1c770a6efcaa8159af6258c09f185d0531adf6e44b85c1&redirect_uri=http%3A%2F%2F127.0.0.1%3A8080&%2Fauth%2Foauth_callback&response_type=code&scope=public&state=T35KLszNwBy2ta5gZieh'
					// window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-3f5dca20f582720004697aed0423520a2a709fba4a95d573e0a34c4f8c739323&redirect_uri=http%3A%2F%2F127.0.0.1%3A8080%2Fauth%2Foauth_callback&response_type=code&scope=public&state=stateok'
					//    window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-3f5dca20f582720004697aed0423520a2a709fba4a95d573e0a34c4f8c739323&redirect_uri=http%3A%2F%2F172.28.179.15%3A8080%2Fauth%2Foauth_callback&response_type=code&scope=public&state=stateok'
					window.location.href = process.env.VUE_APP_ROOT_API;
				}
				else {
					localStorage.removeItem('user');
					console.log(process.env.VUE_APP_API_URL);
					// console.log(process.env.VUE_APP_API_KEY);
					// console.log ("rewdsfks");
					// console.log(process.env.VUE_APP_API_URL);
					// console.log(process.env.VUE_APP_API_KEY);
					// console.log(process.env.VUE_APP_ROOT_API);
					window.location.href = process.env.VUE_APP_ROOT_API;
				}	
			},
		},
		// mounted() {
		// 	console.log("mounted");
		// 	console.log(process.env.VUE_APP_API_URL);
		// 	console.log(process.env.VUE_APP_API_KEY);
		// 	console.log ("rewdsfks");
		// 	console.log(process.env.VUE_APP_API_URL);
		// 	console.log(process.env.VUE_APP_API_KEY);
		// 	console.log(process.env.VUE_APP_ROOT_API);
		// }
		}
	)
</script>

<template>
<div>
  	<div class="buttonLogin">
		 <div v-if="$store.state.status.loggedIn === false">
			<button type="button" style="background: #0b1933;border:0px" v-on:click="redirectTo42()"><img class="loginin" src="../../public/icones/login.jpg" alt="logout"></button>
    	</div> 
		<div v-else>
			<button style="background: #0b1933;border:0px" v-on:click="logout()"><img class="loginout" style="margin-left:265px;margin-top:15px" src="../../public/icones/logout.svg" alt="logout"></button>
		</div>
  	</div>
</div>
</template>


<style scoped>
.loginin {
	position: relative;
	width: auto;
	height: 50%;
	margin-left: 75px;
	margin-top: auto;
	margin-bottom: auto;
  margin-right: 50px;
  display: flex;
	box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 75%);
}
.loginin:hover {
  border-color: whitesmoke;
  cursor: pointer;
  transition: all 0.25s;
  box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 75%);
}
.loginout {
	position: relative;
  display: flex;
	height: 70px;
	box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 75%);
  background: #b16b2a;
}	
.loginout:hover {
  border-color: #b16b2a;
	box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 75%);
	border: solid 3px;
	background: #b16b2a;
	cursor: pointer;
	transition: all 0.25s;
}	
</style>
