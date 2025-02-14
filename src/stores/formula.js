import axios from 'axios';
import { defineStore } from 'pinia';

export const useFormulaStore = defineStore('formula', {
    state: () => ({
        formulas:[]
        
    }),
    getters: {
        getFormulas: (state) => state.formulas,
        
    },
    actions: {
        async addFormula(token, formula) {

            try {
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/formulas/create`, formula
                    , {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `${token}`,
                        },
                    });  
                    this.getAllFormulas

            } catch (error) {
                console.error(error);
                throw error;
            }
        },

         async updateFormula(token, formulaId,formula) {
            try {
                await axios.put(
                    `${import.meta.env.VITE_API_URL}/api/v1/formulas/update/${formulaId}`,formula,
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
        async deleteFormula(token, formulaId) {

            try {
                const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/v1/formulas/delete/${formulaId}`
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

        async getAllFormulas(token) {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/formulas`, {
                    headers: {
                        Authorization: token,
                        "Content-Type": "application/json",
                    }
                },)

                this.formulas = response.data.reverse()
                console.log(response.data)
            } catch (error) {
                console.error(error);
                throw error;
            }

        },

        removeFormula(formulaId) {
        this.formulas = this.formulas.filter(formula => formula.formulaId !== formulaId);
        }

    },
});
