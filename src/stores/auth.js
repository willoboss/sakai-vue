import router from '@/router';
import axios from 'axios';
import Cookies from 'js-cookie';
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        isAuthenticated: Cookies.get('isAuthenticated') ? Cookies.get('isAuthenticated') : false,
        token: Cookies.get('token') ? Cookies.get('token') : null,
        user: Cookies.get('user') ? JSON.parse(Cookies.get('user')) : null,
        menus: Cookies.get('menus') ? JSON.parse(Cookies.get('menus')) : null
    }),
    getters: {
        getUser: (state) => state.user,
        getAuth: (state) => state.isAuthenticated,
        getMenus:(state)=> state.menus,
    },
    actions: {
        async login(userEntry) {
            console.log(userEntry);
            const minutes = 1 //jour
            try {
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/users/login`, userEntry, {
                    headers: { "Content-Type": "application/json" },
                });
                console.log(response.data.menus);
                this.menus = response.data.menus
                this.token = response.headers.authorization;
                this.user = response.data
                this.isAuthenticated = true;
                Cookies.set('menus', JSON.stringify(this.menus), { expires: minutes })
                Cookies.set('isAuthenticated', this.isAuthenticated, { expires: minutes })
                Cookies.set('user', JSON.stringify(this.user), { expires: minutes });
                Cookies.set('token', this.token, { expires: minutes });
                router.push(response.data.menus[0].items[0].to);
                console.log(Cookies.get('user'));
            } catch (error) {
                console.error(error);
                throw error;
            }
        },
        logout() {
            this.isAuthenticated= false;
            Cookies.remove('user');
            Cookies.remove('token');
            router.push("/auth/login");
        },
        checkAuth() {
            
            const userCookie = Cookies.get('user'); 
            const tokenCookie = Cookies.get('token');
            if (userCookie && tokenCookie) {
                
                this.user = JSON.parse(userCookie);
                this.token = tokenCookie;
                this.isAuthenticated = true;
            }
        },
    }
});