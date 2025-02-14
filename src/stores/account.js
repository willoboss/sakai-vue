import axios from 'axios';
import { defineStore } from 'pinia';

export const useAccountStore = defineStore('account', {
    state: () => ({
        accounts: [],
        account: {},
    }),
    getters: {
        getAccounts: (state) => state.accounts,
        getAccount:(state)=>state.account
    },
    actions: {
        async getAllAccounts(token) {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/accounts`, {
                    headers: {
                        Authorization: token,
                        "Content-Type": "application/json",
                    }
                },)

                this.accounts = response.data
                console.log(response.data)
            } catch (error) {
                console.error(error);
                throw error;
            }
        },

        async searchAccount(token,numberAccount) {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/accounts/search/${numberAccount}`, {
                    headers: {
                        Authorization: token,
                        "Content-Type": "application/json",
                    }
                },)

                this.account = response.data
                console.log(response.data)
            } catch (error) {
                console.error(error);
                throw error;
            }
        },
    },
});
