<script lang="ts">
	import { defineComponent } from 'vue';
	import Leaderboard from '../components/Leaderboard.vue';
	import LoggingButton from '../components/LoggingButton.vue';
	import AuthService from '../services/auth.service';
	import { toast } from 'vue3-toastify';
	import 'vue3-toastify/dist/index.css';

	interface LoginData
	{
		registerInput: { username: string, password: string };
		loginInput: { username: string, password: string };
		login_or_register: string;
	}

	export default defineComponent ({
		name: 'Home',
		data(): LoginData {
			return {
					registerInput: { username: "", password: "" },
					loginInput: { username: "", password: "" },
					login_or_register: "login"
			}
		},
		components: {
				Leaderboard, LoggingButton
		},
		methods: {
			register: function() {
				AuthService.registerNewUser(this.registerInput.username, this.registerInput.password).then(
					() => {
						this.Ok_Toastify("User Registered")
						this.registerInput.username = "";
						this.registerInput.password = "";
					},
					(error) => {
						this.NotOk_Toastify(error.response.data.message);
						this.registerInput.username = "";
						this.registerInput.password = "";
					}
				)
			},
			login_or_registerMode(event, mode)
			{
				let elem = document.getElementById(this.login_or_register + '_button');
				if (elem)
					elem.classList.remove('conf_selected');
				event.currentTarget.classList.add('conf_selected');
				this.login_or_register = mode;
			},
			Ok_Toastify: function(message:string): void {
				toast.success(message);
			},
			NotOk_Toastify: function(message:string): void {
				toast.error(message);
			},
			login: async function() {
				try {
					const result = await this.$store.dispatch('NewUserLogin', { username: this.loginInput.username, password: this.loginInput.password });
					if (result.ID) {
						this.Ok_Toastify("User Logged In");
						this.$store.commit('LoginSuccess', result); 
					}
					else {
						this.NotOk_Toastify("User Not Logged In");
					} 
					this.loginInput.username = "";
					this.loginInput.password = "";
					}
					catch(e) {
						this.loginInput.username = "";
						this.loginInput.password = "";
						this.NotOk_Toastify("Logged In Failed(rules not respected)");
					}	
				}
		},		
})			
</script>

<template>
	<div class="homePage">
		
		<div class="container1">
			<p class="text1">WELCOME TO</p>
			<img class="pong" img src="../../public/icones/pong.jpg" alt="pong42">
		</div>
		<footer class="footer">
			<p style="text-align:center;">
			<span>&#169; 2023 by Ccravero Sbalesme Ezielins</span></p>
		</footer>
			
		<p class="text2" v-if="$store.state.status.loggedIn === false">Two-factor authentication</p>
		<p class="text2" v-else>Logout</p>
		<div class="container2" v-if="$store.state.status.loggedIn === false">
			<div class="auth">
				<div class="buttons_container">
					<div class="buttons_wrapper">
						<div class="conf_selected" id="login_button" @click="login_or_registerMode($event, 'login')">Login</div>
						<div id="register_button" @click="login_or_registerMode($event, 'register')">Register</div>
					</div>
				</div>
				<div class="containerregister" v-if="login_or_register === 'register'">
					<div><input type="text" name="registerUsername" v-model="registerInput.username" placeholder="Username" /></div>
					<div><input type="password" name="registerPassword" v-model="registerInput.password" placeholder="Password"/></div>
					<div style="margin-top: 10px;"><button type="button" @click="register()">Register</button></div>
				</div>
				<div class="containerlogin" v-if="login_or_register === 'login'">
					<div><input type="text" name="loginUsername" v-model="loginInput.username" placeholder="Username" /></div>
					<div><input type="password" name="loginPassword" v-model="loginInput.password" placeholder="Password"/></div>
					<div style="margin-top: 10px;"><button type="button" @click="login()">Login</button></div>
				</div>
			</div>
			<div class="auth_container42">
				<LoggingButton/>
			</div>
		</div>
		<div class="container2" v-else>
			<LoggingButton/>
		</div>
		
		<p class="text3">LeaderBoard</p>
		<div class="container3">
			<Leaderboard/>
		</div>

	</div>
</template>
	
<style scoped>
.homePage {
	width: 100%;
	display: block;
	background-color: #0b1933;
	z-index: 100;
}
.auth_container42 {
	display: flex;
	flex-direction: row-reverse;
	flex-wrap: wrap;
	justify-content: center;
	margin-bottom: 30px;
	margin-top: 20px;
}
.container1 {
	display: block;
	text-align: center; 
	position: relative;
}
.container2 {
	position: relative;
	display: flex;
	margin-left: auto;
	margin-right: auto;
	width: 600px;
	height: 100px;
	margin-top: 50px;
	background-color: #0b1933;
	box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 75%);
}
.container2 a {
	height: 100%;
	margin: auto;
	margin-top: 25px;
}
.container2 a:hover {
	cursor: pointer;
	transition: all 0.25s;
}
.pong {
	position: relative;
    text-align: center;
    margin-top: 100px;
    width: auto;
    height: auto;
}
.text1 {
	text-align: center;
    width: 100%;
    margin: 0 auto;
    color: whitesmoke;
    font-size:3.5em;
    font-weight: 700;
    letter-spacing: 0.1em;
    margin-bottom: 0.2em;
    background: black;
    position: relative; 
}
.text2 {
	margin-top: 100px;
	text-align: center;
    width: 100%;
    color: whitesmoke;
    font-size:2.5em;
    font-weight: 800;
    letter-spacing: 0.1em;
    margin-bottom: 0.2em;
    background: black;
    position: relative; 
}
.text3 {
	text-align: center;
	width: 100%;
	color: whitesmoke;
	font-size:2.5em;
	font-weight: 800;
	letter-spacing: 0.1em;
	margin-bottom: 0.2em;
	background: black;
	position: relative; 
}  	
.auth {
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	text-align: center;
	margin: auto;
	margin-right: 40px;
}
.auth button {
	padding: 0.25rem 2rem;
	margin-top: 7px;
	box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 75%);
	border: solid 3px transparent;
	background: #0b1933;
	color: white;
	cursor: pointer;
	transition: all 0.25s;
}
.auth button:hover {
	background: black;
	color: whitesmoke;
	border-color: whitesmoke;
}
.container2	{
	position: relative;
	margin-top: 2.5em;
	margin-bottom: 2.5em;
}
.container3 {
	width: 50vw;
	margin-top: 2.5em;
	margin: 0 auto;
	padding: 0 2rem;
}
.buttons_container {
	display: flex;
	justify-content: center;
	margin-bottom: 10px;
}
.buttons_wrapper {
	display: flex;
	flex-wrap: wrap;
	align-self: center;
}
.buttons_wrapper > div {
	padding: 0.25rem 1rem;
	box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 75%);
	border: solid 1px black;
	color: whitesmoke;
	font-size: 1rem;
	cursor: pointer;
	transition: all 0.25s;
}
.buttons_wrapper > .conf_selected {
	background-color: #b16b2a;
	color: white;
}
.footer {
	font-style: italic;
    color: whitesmoke;
}

input:placeholder
{
	font-size: 1rem;
}
</style>
	