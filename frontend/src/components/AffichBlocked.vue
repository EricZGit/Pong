<template>
    <div id="searchUser" style="margin-left: auto;margin-right: auto;">
        <div class="list_request_div">    
            <div class="lists_item_container">
                <div class="list_item">
                    <div class="flex">
                        <div class="refuse_button2" style="margin-top: -10px;">
                            <i class="fas fa-times" style="margin-left: 3px;">Deban User on click</i>
                        </div>
                        <div style="display: flex;" v-for="(listallblocked, index) in listAllBlocked" :key="listallblocked.nom">
                            {{ listAllBlocked[index].nom }}
                            <div class="refuse_button" v-on:click="debanUser(listallblocked.ID)">
                                <i class="fas fa-times" style="margin-left: 3px;"></i>
                            </div>    
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
        listAllBlocked: LeaderboardUser[];
    }

    export default defineComponent({
        name: 'AffichBlocked',
        components: {
        },
        data(): AffichBlockedData {
            return {
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
            debanUser: function(banId: number) {
                userdataService.debanUser(banId).then(
                    response => {
                        if (response.data.message === 'User debanned')
                            this.Ok_Toastify('User debanned : ' + this.listAllBlocked.filter((user) => user.ID === banId)[0].nom);
                        else
                            this.Ok_Toastify('User debanned : ' + this.listAllBlocked.filter((user) => user.ID === banId)[0].nom);
                        this.listAllBlocked = this.listAllBlocked.filter((user) => user.ID !== banId);
                    },
                    error => {
                        this.NotOk_Toastify(error.response.data.message);
                    }
                );
            },
        },
        mounted (): void {
            userdataService.listAllBlocked().then(
                response => {
                    this.listAllBlocked = response.data;
                },
                error => {
                    this.NotOk_Toastify(error.response.data.message);
                }
            );
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
.refuse_button {
	background-color: #c40707;
	color: white;
	cursor: pointer;
	border: solid 1px #c40707;
	box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 75%);
	transition: all 0.25s;
}
.refuse_button2 {
	background-color: #c40707;
	color: white;
	border: solid 1px #c40707;
	box-shadow: 5px 0px 15px 0px rgb(0 0 0 / 75%);
	transition: all 0.25s;
}
.flex {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
}
</style>