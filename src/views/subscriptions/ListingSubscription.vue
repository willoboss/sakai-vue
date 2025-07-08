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
                    :globalFilterFields="['numberAccount', 'formula', 'creditLimit', 'createdAt', 'updateAt']"
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
                    <Column header="" style="min-width: 16rem">
                        <template #body="{ data }">
                            <ToggleSwitch v-model="data.severity" :invalid="!data.severity" @click="handlerStatus(data)" />
                            <Message :severity="data.color" variant="simple">{{ data.message }}</Message>
                        </template>
                    </Column>

                    <Column header="Actions">
                        <template #body="{ data }">
                            <Button label="Résilier" severity="danger" variant="text" raised />
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
        case 2:
            return true;
        case 3:
            return false;
    }
};

const getMessage = (status) => {
    if (status === 2) {
        return 'Abonnement actif';
    } else if (status === 3) {
        return 'Abonnement inactif';
    } else {
    }
};

const getColor = (status) => {
    if (status === 2) {
        return 'success';
    } else if (status === 3) {
        return 'error';
    } else {
    }
};

const subscriptionData = ref([]);

const handlerStatus = async (subscription) => {
    const status = subscription.status;

    const isActive = status === 2;
    const actionText = isActive ? 'désactiver' : status === 3 ? 'activer' : null;

    if (!actionText) {
        toast.add({ severity: 'warn', summary: 'Attention', detail: 'Action non supportée pour ce statut.' });
        return;
    }

    const actionMethod = isActive ? subscriptionStore.checkDesactivate : subscriptionStore.checkActivate;

    try {
        const result = await Swal.fire({
            title: 'Confirmation',
            text: `Êtes-vous sûr de vouloir ${actionText} cet abonnement ?`,
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Non',
            confirmButtonText: 'Oui',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            await actionMethod(authStore.token, subscription, subscription.subscriptionId);
            updateSubscriptionStatus(subscription.subscriptionId, isActive ? 3 : 2);
            loadSubscription(subscriptions.value);
            console.log(`Action ${actionText} réussie pour l'abonnement ID: ${subscription.subscriptionId}`);
            toast.add({ severity: 'success', summary: 'Succès', detail: `Abonnement ${actionText} avec succès.` });
        } else {
            updateSubscriptionStatus(subscription.subscriptionId, status);
            loadSubscription(subscriptions.value);
            console.log(`Action ${actionText} annulée pour l'abonnement ID: ${subscription.subscriptionId}`);
            toast.add({ severity: 'warn', summary: 'Annulé', detail: `Action annulée.`, life: 4000 });
        }
    } catch (error) {
        console.error(`Erreur lors de la tentative de ${actionText} :`, error);
        toast.add({ severity: 'error', summary: 'Erreur', detail: `Impossible de ${actionText} l'abonnement.`, life: 4000 });
    }
};

const mapSubscriptionData = (data) => {
    return data.map((d) => {
        return {
            subscriptionId: d.subscritionId,
            customer: d.accountDto.customer.firstname + ' ' + d.accountDto.customer.lastname,
            numberAccount: d.accountDto.numberAccount,
            formula: d.formulaDto.label,
            amount: d.formulaDto.amount,
            creditLimit: d.formulaDto.creditLimit,
            status: d.status,
            createdAt: d.createdAt,
            updateAt: d.updateAt,
            severity: getSeverity(d.status),
            message: getMessage(d.status),
            color: getColor(d.status)
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

const updateSubscriptionStatus = (subscriptionId, newStatus) => {
    const index = subscriptions.value.findIndex((sub) => sub.subscritionId === subscriptionId);

    if (index !== -1) {
        subscriptions.value[index].status = newStatus;
        subscriptions.value[index].updatedAt = new Date().toISOString(); // ou Date.now() ou format ISO
        console.log('Mise à jour réussie :', subscriptionData.value[index]);
    } else {
        console.warn("Abonnement introuvable pour l'id :", subscriptionId);
    }
};

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
