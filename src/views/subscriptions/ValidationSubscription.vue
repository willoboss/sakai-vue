<template>
    <div class="subscription-listing">
        <h1>Validations des abonnements</h1>
        <div class="pt-8">
            <div class="card">
                <DataTable
                    v-model:filters="filters"
                    v-model:selection="selectedSubscriptionData"
                    :value="subscriptionData"
                    paginator
                    :rows="5"
                    dataKey="subscriptionId"
                    :loading="loadingData"
                    :rowsPerPageOptions="[5, 10, 20, 50]"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :globalFilterFields="['customer', 'numberAccount', 'formula', 'amount', 'creditLimit', 'status', 'createdAt', 'updateAt']"
                >
                    <template #header>
                        <div class="flex justify-start">
                            <IconField>
                                <Button label="Valider" icon="pi pi-thumbs-up-fill" outlined @click="confirmDeleteSelected" :disabled="!selectedSubscriptionData || !selectedSubscriptionData.length" />
                            </IconField>
                        </div>
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

                    <Column selectionMode="multiple" s="subscriptionId" style="width: 3rem" :exportable="false"></Column>
                    <Column field="subscriptionId" header="Id" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.subscriptionId }}
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" placeholder="" />
                        </template>
                    </Column>
                    <Column field="customer" header="Client" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.customer }}
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" placeholder="" />
                        </template>
                    </Column>

                    <Column field="numberAccount" sortable header="Numero de compte" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.numberAccount }}
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" placeholder="" />
                        </template>
                    </Column>
                    <Column field="formula" header="Formule" sortable style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.formula }}
                        </template>
                        <template #filter="{ filterModel, filterCallback }">
                            <InputText v-model="filterModel.value" type="text" @input="filterCallback()" placeholder="" />
                        </template>
                    </Column>

                    <Column field="amount" header="Montant" sortable style="min-width: 12rem">
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

                <Dialog v-model:visible="valideSubcribeDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex items-center gap-4">
                        <i class="pi pi-exclamation-triangle !text-3xl" />
                        <span v-if="product">Veux-tu valider ces abonnements?</span>
                    </div>
                    <template #footer>
                        <Button label="Non" icon="pi pi-times" text @click="valideSubcribeDialog = false" />
                        <Button label="Oui" icon="pi pi-check" text @click="valideSelectedSubscribe" />
                    </template>
                </Dialog>
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

const subscriptions = computed(() => subscriptionStore.getSubscriptionsWaiting);

const selectedSubscriptionData = ref();

const isOpen = ref(false);

const subscribesRequest = ref({
    subscribesId:[]
});

const dt = ref();
const products = ref();
const productDialog = ref(false);
const valideSubcribeDialog = ref(false);
const product = ref({});

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    subscriptionId: { value: null, matchMode: FilterMatchMode.CONTAINS },
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
            subscriptionId: d.subscritionId,
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
        await subscriptionStore.findSubscriptionsWaiting(authStore.token);
        loadSubscription(subscriptions.value);
        console.log('SubscriptionsData:', subscriptionData.value);
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

const openNew = () => {
    product.value = {};
    submitted.value = false;
    productDialog.value = true;
};
const hideDialog = () => {
    productDialog.value = false;
    submitted.value = false;
};
const saveProduct = () => {
    submitted.value = true;

    if (product?.value.name?.trim()) {
        if (product.value.id) {
            product.value.inventoryStatus = product.value.inventoryStatus.value ? product.value.inventoryStatus.value : product.value.inventoryStatus;
            products.value[findIndexById(product.value.id)] = product.value;
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Updated', life: 3000 });
        } else {
            product.value.id = createId();
            product.value.code = createId();
            product.value.image = 'product-placeholder.svg';
            product.value.inventoryStatus = product.value.inventoryStatus ? product.value.inventoryStatus.value : 'INSTOCK';
            products.value.push(product.value);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000 });
        }

        productDialog.value = false;
        product.value = {};
    }
};
const editProduct = (prod) => {
    product.value = { ...prod };
    productDialog.value = true;
};
const confirmDeleteProduct = (prod) => {
    product.value = prod;
    deleteProductDialog.value = true;
};
const deleteProduct = () => {
    products.value = products.value.filter((val) => val.id !== product.value.id);
    deleteProductDialog.value = false;
    product.value = {};
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
};
const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < products.value.length; i++) {
        if (products.value[i].id === id) {
            index = i;
            break;
        }
    }

    return index;
};
const createId = () => {
    let id = '';
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 5; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
};
const exportCSV = () => {
    dt.value.exportCSV();
};
const confirmDeleteSelected = () => {
    valideSubcribeDialog.value = true;
};
const valideSelectedSubscribe = async () => {
    try {
        if (!selectedSubscriptionData.value || selectedSubscriptionData.value.length === 0) {
            toast.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Aucune sélection à valider',
                life: 3000
            });
            return;
        }

        // Suppression des abonnements validés de la liste d'affichage
        subscriptionData.value = subscriptionData.value.filter((val) => !selectedSubscriptionData.value.includes(val));

        // Masquer la boîte de dialogue
        valideSubcribeDialog.value = false;

        // Appel API pour validation des abonnements
        selectedSubscriptionData.value.forEach((subscribe) => {
            subscribesRequest.value.subscribesId.push(subscribe.subscriptionId);
        });
        console.log('SubscribesRequest:', subscribesRequest.value.subscribesId);
        await subscriptionStore.checkValidate(authStore.token, subscribesRequest.value.subscribesId);

        // Message de succès
        toast.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Abonnements validés avec succès',
            life: 3000
        });

        // Réinitialisation de la sélection
        selectedSubscriptionData.value = [];
    } catch (error) {
        console.error('Erreur lors de la validation des abonnements :', error);
        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Échec de la validation des abonnements. Veuillez réessayer.',
            life: 4000
        });
    }
};
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
