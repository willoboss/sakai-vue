import axios from 'axios';
import { defineStore } from 'pinia';

export const useSubscriptionStore = defineStore('subscription', {
    state: () => ({
        subscription: {},
        subscriptionsWaiting: [],
        subscriptionsTerminate: [],
        subscriptionsActivate: [],
        subscriptionsValidate: [],
        subscriptionsDesactivate:[],
        subscriptions: []
    }),
    getters: {
        getSubscriptionsWaiting:(state)=>state.subscriptionsWaiting,
        getSubscriptionsTerminate: (state) => state.subscriptionsTerminate,
        getSubscriptionsActivate: (state) => state.subscriptionsActivate,
        getSubscriptionsVatidate: (state) => state.subscriptionsValidate,
        getSubscriptionsDesactivate:(state) => state.subscriptionsDesactivate,
        getSubscriptions: (state) => state.subscriptions
    },
    actions: {
        async addSubscription(token, subscription) {

            try {
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/subscriptions/create`, subscription
                    , {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `${token}`,
                        },
                    });
            } catch (error) {
                console.error(error);
                throw error;
            }
        },

        async checkActivateMultiple(token, subscriptions) {

            try {
                const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/v1/subscriptions/activate`, subscriptions
                    , {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `${token}`,
                        },
                    });
                this.findSubscriptionsValidate(token)
            } catch (error) {
                console.error(error);
                throw error;
            }
        },

        async checkValidate(token, subscriptions) {

            try {
                const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/v1/subscriptions/validate`, subscriptions
                    , {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `${token}`,
                        },
                    });
                    this.findSubscriptionsWaiting(token)
            } catch (error) {
                console.error(error);
                throw error;
            }
        },

        async checkDesactivate(token, subscription, id) {

            try {
                const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/v1/subscriptions/desactivate/${id}`, subscription
                    , {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `${token}`,
                        },
                    });
                this.findSubscriptionsActivate(token)
            } catch (error) {
                console.error(error);
                throw error;
            }
        },

         async checkActivate(token, subscription, id) {

            try {
                const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/v1/subscriptions/activate/${id}`, subscription
                    , {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `${token}`,
                        },
                    });
                    
            } catch (error) {
                console.error(error);
                throw error;
            }
        },


        async checkTerminate(token, subscription, id) {

            try {
                const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/v1/subscriptions/terminate/${id}`, subscription
                    , {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `${token}`,
                        },
                    });

                this.findSubscriptionsTerminate(token)
            } catch (error) {
                console.error(error);
                throw error;
            }
        },

        async findSubscriptionsWaiting(token) {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/subscriptions/waiting`, {
                    headers: {
                        Authorization: token,
                        "Content-Type": "application/json",
                    }
                },)

                this.subscriptionsWaiting = response.data.reverse()
                console.log(response.data)
            } catch (error) {
                console.error(error);
                throw error;
            }


        },
        async findSubscriptionsValidate(token) {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/subscriptions/validating`, {
                    headers: {
                        Authorization: token,
                        "Content-Type": "application/json",
                    }
                },)

                this.subscriptionsValidate = response.data.reverse()
                console.log(response.data)
            } catch (error) {
                console.error(error);
                throw error;
            }


        },
        async findSubscriptionsActivate(token) {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/subscriptions/activating`, {
                    headers: {
                        Authorization: token,
                        "Content-Type": "application/json",
                    }
                },)

                this.subscriptionsActivate = response.data.reverse()
                console.log(response.data)
            } catch (error) {
                console.error(error);
                throw error;
            }


        },
        async findSubscriptionsDesactivate(token) {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/subscriptions/desactivating`, {
                    headers: {
                        Authorization: token,
                        "Content-Type": "application/json",
                    }
                },)

                this.subscriptionsDesactivate = response.data.reverse()
                console.log(response.data)
            } catch (error) {
                console.error(error);
                throw error;
            }


        },

        async getAllSubscriptions(token) {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/subscriptions`, {
                    headers: {
                        Authorization: token,
                        "Content-Type": "application/json",
                    }
                },)

                this.subscriptions = response.data.reverse()
                console.log(response.data)
            } catch (error) {
                console.error(error);
                throw error;
            }
        }

    },
});
