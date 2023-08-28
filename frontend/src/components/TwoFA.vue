<script lang="ts">

import { defineComponent } from 'vue'
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import AuthService from '../services/auth.service'


export default defineComponent({
    name: 'TwoFA',
    components: {
    },
    methods: {
        turnOn2FA: function(): void {
            AuthService.turnOn2FA().then(
                response => { 
					if (!response)
						this.NotOk_Toastify('Error ! 2FA is not activated...');
                    this.Ok_Toastify('Two factor authentication successfully activated');
					this.$store.commit('setTwoFA', true);
                },
                () => { this.NotOk_Toastify('Error ! 2FA is not activated...'); })
        },

        turnOff2FA: function(): void {
            AuthService.turnOff2FA().then(
                response => { 
					if (!response)
						this.NotOk_Toastify('Error ! 2FA is not desactivated...');
                    this.Ok_Toastify('Two factor authentication successfully desactivated');
					this.$store.commit('setTwoFA', false);
                },
                () => { this.NotOk_Toastify('Error ! 2FA is not desactivated...'); })
        },
        Ok_Toastify: function(message:string): void {
				toast.success(message);
			},
		NotOk_Toastify: function(message:string): void {
			toast.error(message);
        },
		uploadEmailCode: function(): void {
			let code: FormData = new FormData(document.getElementById("TwoFAForm") as HTMLFormElement);
			AuthService.uploadEmailCode(code.get('emailCode')).then(
				response => { 
				if (response.data == true)
				{
					this.Ok_Toastify('Email code successfully activated');
					this.$store.commit('setTwoFA', true);
				}
				},
				() => { this.NotOk_Toastify('Error ! Email code is not activated...'); })
		},
	},
})
</script>

<template>
	<div class="avatarDiv">
	    <div v-if="$store.state.TwoFA == false">
			<p>TwoFA is <span style="color:#FF0000">disabled</span></p>
				<div style="text-align: center;">
					<form id="TwoFAForm" style="display: flex;margin-left: 30px;margin-top: 20px;">
						<input name="emailCode" placeholder="Enter Email here" style="margin-right: -200px;">
						<button type="button" class="emailbutton" v-on:click="uploadEmailCode()">Send Email</button>
					</form>
					<button type="button" class="twoFAbuttonOn" v-on:click="turnOn2FA()">Turn on 2FA</button>
				</div>
		</div>
		<div v-else>
			<p>TwoFA is <span style="color:#27AE60">enabled</span></p>
			<button type="button" class="twoFAbuttonOff" v-on:click="turnOff2FA()">Turn off 2FA</button>
		</div>
	</div>
</template>

<style scoped>

input {
	/* padding: 0.5rem 1rem; */
    border-radius: 1rem;
    border: solid 1px #959595;
	outline: none;
}
.twoFAbuttonOn {
	padding: 0.25rem 1rem;
	background-color: #39d88f;
	color: white;
	border-radius: 2rem;
	margin-right: 1rem;
	cursor: pointer;
	border: solid 1px #39d88f;
	transition: all 0.25s;
    margin-left: 95px;
    margin-top: 50px;
}
.twoFAbuttonOn:hover {
	border-color: #39d88f;
	color: #39d88f;
	background-color: white;
}
.twoFAbuttonOff {
	padding: 0.25rem 1rem;
	background-color: red;
	color: white;
	border-radius: 2rem;
	margin-right: 1rem;
	cursor: pointer;
	border: solid 1px red;
	transition: all 0.25s;
    margin-left: 95px;
    margin-top: 50px;
}
.twoFAbuttonOff:hover {
	border-color: red;
	color: red;
	background-color: white;
}
.emailbutton {
	background-color: #39d88f;
	color: white;
	border-radius: 2rem;
	cursor: pointer;
	border: solid 1px #39d88f;
	transition: all 0.25s;
    margin-left: 110px;
    margin-top: 45px;
}
.emailbutton:hover {
	border-color: #39d88f;
	color: #39d88f;
	background-color: white;
}
.avatarDiv {
	color: whitesmoke;
	text-align: center;
}
.avatarDiv p {
	margin-left: 20px;
	color: black;
	font: bold;
	font-weight: 900;
	background: #b16b2a;
	box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 75%);
}
</style>