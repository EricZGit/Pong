<template>
    <div id="searchUser" style="margin-left: auto;margin-right: auto;">
        <div class="list_request_div">    
            <div class="lists_item_container">
                <div class="list_item">
                    <div style="display: flex;" v-for="(listallusers, index) in listAllUsers" :key="listallusers.nom">
                        <router-link :to="getUserProfile( listAllUsers[index].ID )"> {{ listAllUsers[index].nom }} </router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">

    import userdataService from '@/services/userdata.service';
    import { LeaderboardUser } from '@/types/user.interface';
    import { defineComponent } from 'vue';
    import { toast } from 'vue3-toastify';
    import 'vue3-toastify/dist/index.css';

    interface AffichRequestsData {
        listAllUsers: LeaderboardUser[];
        listAllBlocked: LeaderboardUser[];
    }

    export default defineComponent({
        name: 'AffichRequests',
        components: {
        },
        data(): AffichRequestsData {
            return {
                listAllUsers: [],
                listAllBlocked: [],
            }
        },
        methods: {
            Ok_Toastify: function(message:string): void {
                toast.success(message);
            },
            NotOk_Toastify: function(message:string): void {
                toast.error(message);
            },
            getUserProfile(user_id: number) {
				return "/user/" + user_id;
		    },
        },
        mounted (): void {
            userdataService.listAllUsers().then(
                (response) => {
                    this.listAllUsers = response.data;
                    this.Ok_Toastify("List of all users");
                },
                (error) => {
                    this.NotOk_Toastify(error.response.data.message);
                }
            )
            userdataService.listAllBlocked().then(
                (response) => {
                    this.listAllBlocked = response.data;
                },
                (error) => {
                    this.NotOk_Toastify(error.response.data.message);
                }
            )
        }
    })
</script>

<style scoped>
.list_request_div {
	display: flex;
	width: 70%;
	height: 110%;
	padding: 1rem;
	background:  #b16b2a;
}
.lists_item_container {
	display: flex;
	flex-direction: column;
	overflow-y: auto;
	width: 400px;
	margin-left: 35px;
	padding: 1rem;
}
.list_item {
	height: 3rem;
	background: #b16b2a;
	margin: 0.25rem 0;
}
</style>