<template>
    <div class="subscription-listing">
        <h1>Listes des abonnements</h1>
        <div class="pt-8">
            <div class="card">
                <DataTable
                    v-model:filters="filters"
                    :value="subscriptionData"
                    paginator
                    :rows="10"
                    dataKey="subscriptionId"
                    filterDisplay="row"
                    :loading="loadingData"
                    :rowsPerPageOptions="[5, 10, 20, 50]"
                    :globalFilterFields="['customer', 'numberAccount', 'formula', 'amount', 'creditLimit', 'status', 'createdAt', 'updateAt']"
                >
                    <template #header>
                        <div class="flex justify-end">
                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                            </IconField>
                        </div>
                    </template>
                    <template #empty> No subscribe found. </template>
                    <template #loading> Loading subscribes data. Please wait. </template>
                    <Column field="customer" header="Client" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.customer }}
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" placeholder="" />
                        </template>
                    </Column>
                    <Column field="numberAccount" header="Numero de compte" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.numberAccount }}
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" placeholder="" />
                        </template>
                    </Column>
                    <Column field="formula" header="Formule" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.formula }}
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" placeholder="" />
                        </template>
                    </Column>

                    <Column field="amount" header="Montant" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.amount }}
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" placeholder="" />
                        </template>
                    </Column>

                    <Column field="creditLimit" header="Formula" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.creditLimit }}
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" placeholder="" />
                        </template>
                    </Column>
                    <Column field="status" header="Etat" :showFilterMenu="false" style="min-width: 12rem">
                        <template #body="{ data }">
                            <Tag :value="data.status" :severity="getSeverity(data.status)" />
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <Select v-model="filterModel.value" @change="filterCallback()" :options="statuses" placeholder="Select One" style="min-width: 12rem" :showClear="true">
                                <template #option="slotProps">
                                    <Tag :value="slotProps.option" :severity="getSeverity(slotProps.option)" />
                                </template>
                            </Select>
                        </template>
                    </Column>
                    <Column header="Date de creation" field="createdAt" style="min-width: 10rem">
                        <template #body="{ data }">
                            {{ formatDate(data.createdAt) }}
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" />
                        </template>
                    </Column>
                    <Column header="Date de modification" field="updateAt" style="min-width: 10rem">
                        <template #body="{ data }">
                            {{ formatDate(data.updateAt) }}
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useAccountStore } from '@/stores/account';
import { useAuthStore } from '@/stores/auth';
import { useFormulaStore } from '@/stores/formula';
import { useSubscriptionStore } from '@/stores/subscription';
import { computed, onMounted, ref } from 'vue';
import { z } from 'zod';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import Swal from 'sweetalert2';
import { useToast } from 'primevue/usetoast';

import { FilterMatchMode, FilterOperator } from '@primevue/core/api';

const toast = useToast();

const authStore = useAuthStore();
const subscriptionStore = useSubscriptionStore();

const loading = ref(false);

const loadingData = ref(true);

const subscriptions = computed(() => subscriptionStore.getSubscriptions);


const isOpen = ref(false);

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    customer: { value: null, matchMode: FilterMatchMode.CONTAINS },
    numberAccount: { value: null, matchMode: FilterMatchMode.CONTAINS },
    formula: { value: null, matchMode: FilterMatchMode.CONTAINS },
    amount: { value: null, matchMode: FilterMatchMode.CONTAINS },
    creditLimit: { value: null, matchMode: FilterMatchMode.CONTAINS },
    status: { value: null, matchMode: FilterMatchMode.EQUALS },
    createdAt: { value: null, matchMode: FilterMatchMode.CONTAINS },
    updateAt: { value: null, matchMode: FilterMatchMode.SCONTAINS }
});


const statuses = ref([0, 'renewal']);

const getSeverity = (status) => {
    switch (status) {
        case 0:
            return 'warn';

        case 'renewal':
            return null;
    }
};

const subscriptionData = ref([]);

const mapSubscriptionData = (data) => {
    return data.map((d) => {
        return {
            subscriptionId: d.subscriptionId,
            customer: d.accountDto.customer.firstname + ' ' + d.accountDto.customer.lastname,
            numberAccount: d.accountDto.numberAccount,
            formula: d.formulaDto.label,
            amount: d.formulaDto.amount,
            creditLimit: d.formulaDto.creditLimit,
            status: d.status,
            createdAt: d.createdAt,
            updateAt: d.updateAt
        };
    });
};


const loadSubscription = (data) => {
    subscriptionData.value = mapSubscriptionData(data);
    loadingData.value = false;
};

onMounted(async () => {
    if (authStore.token) {
        await subscriptionStore.getAllSubscriptions(authStore.token);
        loadSubscription(subscriptions.value);
        console.log('Subscriptions:', subscriptions.value);
    }
});


function getCurrentFormattedDate() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const milliseconds = String(date.getMilliseconds()).padStart(6, '0'); // Assure 6 chiffres

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
}

function convertDate(dateString) {
    const cleanDateString = dateString.split('.')[0];
    const date = new Date(cleanDateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year}`;
}

function formatDate(value) {
    if (value) {
        return convertDate(value);
    }
    return null;
}




</script>


<style scoped>
.subscription-listing {
    padding: 20px;
}

.subscription-listing h1 {
    font-size: 24px;
    margin-bottom: 20px;
}

.subscription-listing ul {
    list-style-type: none;
    padding: 0;
}

.subscription-listing li {
    padding: 10px;
    border-bottom: 1px solid #ccc;
}
</style>
