<template>
    <div id="searchUser" style="margin-left: auto;margin-right: auto;">
        <div class="list_request_div">    
            <div class="lists_item_container">
                <div class="list_item">
                    <div class="flex">
                        <div class="accept_button2" style="margin-top: -10px;">
                            <i class="fas fa-check" style="margin-left: 3px;">Add User in Friend</i>
                        </div>
                        <div style="display: flex;" v-for="(listalladders, index) in listAllAdders" :key="listalladders.nom">
                            {{ listAllAdders[index].nom }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">

    import { defineComponent } from 'vue';
    import { toast } from 'vue3-toastify';
    import 'vue3-toastify/dist/index.css';
    import { LeaderboardUser } from '@/types/user.interface';
    import userdataService from '@/services/userdata.service';

    interface AffichBlockedData {
        listAllAdders: LeaderboardUser[];
    }

    export default defineComponent({
        name: 'AffichBlocked',
        components: {
        },
        data(): AffichBlockedData {
            return {
                listAllAdders: [],
            }
        },
        methods: {
            Ok_Toastify: function(message:string): void {
                toast.success(message);
            },
            NotOk_Toastify: function(message:string): void {
                toast.error(message);
            },
        },
        mounted (): void {
            userdataService.getListAdders().then(
                response => {
                    this.listAllAdders = response.data;
                },
                () => {
                    console.log('Failed to retrieve leaderboard adders')})
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
}
.flex {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
}
.accept_button2 {
	background-color: green;
	color: white;
	border: solid 1px green;
	box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 75%);
	transition: all 0.25s;
}
</style>