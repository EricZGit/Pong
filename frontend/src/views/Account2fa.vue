<template>
<div class="homePage">    
    <p class="text1">2FA Identification</p>
    <div id="EmailCode">
		<button type="button" class="showEmail"  v-on:click="showEmail()">Show Email</button>
        <form id="TwoFAForm">
			<input type="password" name="emailCode" placeholder="Enter Code here">
			<button type="button" class="emailbutton" v-on:click="verifyEmailCode()">Verify 2A Code</button>
		</form>
	</div>
</div>
</template>

<script lang="ts">
    import { defineComponent } from 'vue';
    import { toast } from 'vue3-toastify';
    import 'vue3-toastify/dist/index.css';
    import AuthService from '../services/auth.service'

    interface Account2FAData
    {
        Email: string;
    }

    export default defineComponent ({
        name: 'Account2FA',
        data(): Account2FAData {
            return {
                Email: "",
            }
        },
        methods: {
            Ok_Toastify: function(message:string): void {
				toast.success(message);
			},
		    NotOk_Toastify: function(message:string): void {
			    toast.error(message);
            },
            Info_Toastify: function(message:string): void {
                toast.info(message);
            },
            verifyEmailCode: function(): void {
                let code: FormData = new FormData(document.getElementById("TwoFAForm") as HTMLFormElement);
                AuthService.checkEmailCode(code.get('emailCode')).then(
                    response => { 
                        if (response.data == true) {
                            this.Ok_Toastify('2FA code is good !');
                            this.$store.commit('go2FA', true);
                        }
                        else
                            this.NotOk_Toastify('Error ! 2FA code is not good...');
                    },
                    () => { this.NotOk_Toastify('Error ! 2FA code is not good...'); })
            },
            showEmail: function(): void {
                AuthService.showEmail().then(
                    response => { 
                        this.Info_Toastify('Your email is : ' + response.data);
                    },
                    () => { this.NotOk_Toastify('Error ! Email is not valid...'); })
            },
        }
    });
</script>

<style scoped>
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

input {
	padding: 0.5rem 1rem;
    border-radius: 1rem;
    border: solid 1px #959595;
	outline: none;
    margin-left: auto;
    margin-right: auto;
    display: flex;
}
.emailbutton {
	background-color: #39d88f;
	color: white;
	border-radius: 2rem;
	cursor: pointer;
	border: solid 1px #39d88f;
	transition: all 0.25s;
    margin-left: auto;
    margin-right: auto;
    display: flex;
}
.emailbutton:hover {
	border-color: #39d88f;
	color: #39d88f;
	background-color: white;
}
.homePage {
    width: 100%;
    display: block;
    background-color: #0b1933;
    z-index: 100;
}
.showEmail {
	padding: 0.25rem 1rem;
	background-color: red;
	color: white;
	cursor: pointer;
	border: solid 1px red;
	transition: all 0.25s;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    margin-top: 200px;
}
.showEmail:hover {
	border-color: red;
	color: red;
	background-color: white;
}
</style>