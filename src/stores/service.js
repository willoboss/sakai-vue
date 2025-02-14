import axios from 'axios';
import { defineStore } from 'pinia';

export const useServiceStore = defineStore('service', {
    state: () => ({
        service: null,
        services: [],
    }),
    getters: {
        getServices: (state) => state.services,
    },
    actions: {
        async addService(token, service) {
            try {
                await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/v1/services/create`,
                    service,                     {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,
                        },
                    }
                );
            } catch (error) {
                console.error("Erreur lors de l'ajout du service :", error);
                throw error;
            }
        },

        async deleteService(token, serviceId) {
            try {
                await axios.delete(
                    `${import.meta.env.VITE_API_URL}/api/v1/services/delete/${serviceId}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,
                        },
                    }
                );
            } catch (error) {
                console.error("Erreur lors de la suppression du service :", error);
                throw error;
            }
        },
        async updateService(token, serviceId,service) {
            try {
                await axios.put(
                    `${import.meta.env.VITE_API_URL}/api/v1/services/update/${serviceId}`,service,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`,
                        },
                    }
                );
            } catch (error) {
                console.error("Erreur lors de la suppression du service :", error);
                throw error;
            }
        },

        async getAllServices(token) {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/v1/services`,
                    {
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                this.services = response.data.reverse();
                console.log("Liste des services :", response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des services :", error);
                throw error;
            }
        },

        removeService(serviceId) {
        this.services = this.services.filter(service => service.serviceId !== serviceId);
        }

    },
});
