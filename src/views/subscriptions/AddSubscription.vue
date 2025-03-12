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
const formulaStore = useFormulaStore();
const accountStore = useAccountStore();
const subscriptionStore = useSubscriptionStore();

const loading = ref(false);

const loadingData = ref(true);

const formulas = computed(() => formulaStore.getFormulas);
const account = computed(() => accountStore.getAccount);
const subscriptionsWaiting = computed(() => subscriptionStore.getSubscriptionsWaiting);
const numberAccount = ref('');

const subscription = ref({
    formulasId: [],
    accountId: ''
});

const initialValues = ref({
    numberAccount: ''
});

const initialValuesSub = ref({
    formulasId: []
});

const isOpen = ref(false);

const customers = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    code: { value: null, matchMode: FilterMatchMode.CONTAINS },
    customer: { value: null, matchMode: FilterMatchMode.CONTAINS },
    numberAccount: { value: null, matchMode: FilterMatchMode.CONTAINS },
    formula: { value: null, matchMode: FilterMatchMode.CONTAINS },
    amount: { value: null, matchMode: FilterMatchMode.CONTAINS },
    creditLimit: { value: null, matchMode: FilterMatchMode.CONTAINS },
    status: { value: null, matchMode: FilterMatchMode.EQUALS },
    createdAt: { value: null, matchMode: FilterMatchMode.CONTAINS },
    updateAt: { value: null, matchMode: FilterMatchMode.SCONTAINS }
});
const representatives = ref([
    { name: 'Amy Elsner', image: 'amyelsner.png' },
    { name: 'Anna Fali', image: 'annafali.png' },
    { name: 'Asiya Javayant', image: 'asiyajavayant.png' },
    { name: 'Bernardo Dominic', image: 'bernardodominic.png' },
    { name: 'Elwin Sharvill', image: 'elwinsharvill.png' },
    { name: 'Ioni Bowcher', image: 'ionibowcher.png' },
    { name: 'Ivan Magalhaes', image: 'ivanmagalhaes.png' },
    { name: 'Onyama Limba', image: 'onyamalimba.png' },
    { name: 'Stephen Shaw', image: 'stephenshaw.png' },
    { name: 'XuXue Feng', image: 'xuxuefeng.png' }
]);
const statuses = ref([0, 'renewal']);

const getCustomers = (data) => {
    return [...(data || [])].map((d) => {
        d.date = new Date(d.date);

        return d;
    });
};
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
            code: d.code,
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

// Exemple d'utilisation avec une donnée fictive
const loadSubscription = (data) => {
    subscriptionData.value = mapSubscriptionData(data);
    loadingData.value = false;
};

onMounted(async () => {
    if (authStore.token) {
        await formulaStore.getAllFormulas(authStore.token);
        await subscriptionStore.findSubscriptionsWaiting(authStore.token);
        console.log(formulas.value);
        loadSubscription(subscriptionsWaiting.value);
        console.log('Subscriptions Waiting:', subscriptionsWaiting.value);
    }
});

const addSubcription = async () => {
    try {
        subscription.value.accountId = account.value.accountId;
        console.log(subscription.value);
        await subscriptionStore.addSubscription(authStore.token, subscription.value);
        alertSuccess('abonnement effectué en attente de validation!');
        loadingData.value = true;
        await subscriptionStore.findSubscriptionsWaiting(authStore.token);

    if (subscriptionsWaiting.value.length > subscriptionData.value.length) {
      loadSubscription(subscriptionsWaiting.value);
    } else {
      console.warn("Aucun abonnement en attente trouvé.");
    }
        console.log('Subscriptions Waiting:', subscriptionsWaiting.value);
        closeCustomer();
    } catch (error) {
        console.error('Erreur lors de l\'abonnement :', error);
        showError('Erreur lors de l\'abonnement. Veuillez réessayer.');
    }
};

const getAccount = async (value) => {
    try {
        load();
        await accountStore.searchAccount(authStore.token, value.numberAccount);
        openCustomer();
        console.log('Numéro de compte recherché :', value.numberAccount);
        showSuccess('N° Compte trouvé');
    } catch (error) {
        console.error('Erreur lors de la récupération du compte :', error);
        showError('N° de compte introuvable');
        closeCustomer();
    } finally {
        load();
    }
};

function init() {
    subscription.value = {
        formulasId: [],
        accountId: ''
    };
    initialValues.value = {
        numberAccount: '',
        formulasId: [],
        accountId: ''
    };
}

const onFormSubmit = (e) => {
    if (e.valid) {
        console.log('Form values:', e.values);
        getAccount(e.values);
    }
};

const onFormSubmitSubscribe = (e) => {
    if (e.valid) {
        console.log('Form values:', e.values);
        // getAccount(e.values);
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

const closeCustomer = () => {
    isOpen.value = false;
    init();
};

const openCustomer = () => {
    isOpen.value = true;
};

const resolver = zodResolver(
    z.object({
        numberAccount: z.string().min(12, { message: 'numéro de compte est requis.' }).regex(/^\d+$/, { message: 'Le numéro de compte incorrect.' })
    })
);

const formData = ref({
    formulasId: []
});

const errors = ref({});

function validateAndSubmit() {
    errors.value = {};
    const result = schema.safeParse(formData.value);

    if (!result.success) {
        result.error.errors.forEach((err) => {
            errors.value[err.path[0]] = err.message;
        });
        return;
    }

    // Si tout est OK, envoie les données
    console.log('Données valides :', formData.value);
    subscription.value.formulasId = formData.value.formulasId;
    subscription.value.accountId = accountStore.getAccount.accountId;
    console.log('Données valides :', subscription.value);

    subscribeAdd(subscription.value);
}

const subscribeAdd = async (value) => {
    try {
        await subscriptionStore.addSubscription(authStore.token, value);

        showSuccess(' Abonnement effectué');
        closeCustomer();

    } catch (error) {
        console.error("Erreur lors de l'abonnement :", error);
        showError("Erreur lors de l'abonnement ");
    } finally {
        loading.value = false;
    }
};

const schema = z.object({
    formulasId: z.array(z.number().min(1, { message: 'Formule invalide.' })).min(1, { message: 'Veuillez sélectionner au moins une formule.' })
});

function showSuccess(message) {
    toast.add({
        severity: 'success',
        summary: 'succès',
        detail: `${message}`,
        life: 3000
    });
}

function showInfo(message) {
    toast.add({
        severity: 'info',
        summary: 'Information !',
        detail: message,
        life: 3000
    });
}

function showWarn() {
    toast.add({
        severity: 'warn',
        summary: 'Warn Message',
        detail: 'Message Detail',
        life: 3000
    });
}

function showError(message) {
    toast.add({
        severity: 'error',
        summary: 'Error Message',
        detail: `${message}`,
        life: 3000
    });
}

function load() {
    loading.value = true;
    setTimeout(() => (loading.value = false), 1000);
    console.log('I am load');
}
</script>

<template #center>
    <div class="p-5">
        <div class="card">
            <div class="font-semibold text-xl mb-4">Rechercher un compte et abonner un client</div>
            <!-- 🔍 Barre de recherche pour un compte -->
            <div class="flex gap-3 my-4">
                <Form v-slot="$form" :initialValues :resolver @submit="onFormSubmit" class="flex flex-col gap-4 w-full sm:w-56">
                    <IconField iconPosition="left">
                        <InputText @click="closeCustomer" @input="closeCustomer" name="numberAccount" type="text" placeholder="N° de compte" />
                    </IconField>
                    <Message v-if="$form.numberAccount?.invalid" severity="error" size="small" variant="simple">{{ $form.numberAccount.error?.message }}</Message>
                    <Button type="submit" class="mr-2 mb-2" label="Search" icon="pi pi-search" :loading="loading[0]" />
                </Form>
            </div>
        </div>
        <Card v-if="isOpen" style="width: 25rem; overflow: hidden">
            <template #title>Abonnement client</template>
            <template #subtitle>N°{{ account.numberAccount }}</template>
            <template #content>
                <div class="flex gap-4 mt-1">
                    <Form @submit="validateAndSubmit" class="flex flex-col gap-4 w-full sm:w-60">
                        <MultiSelect v-model="formData.formulasId" :options="formulas" optionLabel="label" optionValue="formulaId" placeholder="Sélectionner une formule" class="w-full md:w-80" />
                        <Message v-if="errors.formulasId" severity="error" size="small" variant="simple">
                            {{ errors.formulasId }}
                        </Message>
                        <div>
                            <Button label="Abonner" type="submit" class="w-full" />
                        </div>
                    </Form>
                </div>
            </template>
        </Card>
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
                    :globalFilterFields="['code','customer', 'numberAccount', 'formula', 'amount', 'creditLimit', 'status', 'createdAt', 'updateAt']"
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
                    <Column field="code" header="Code" style="min-width: 12rem">
                        <template #body="{ data }">
                            {{ data.code }}
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

<style scoped lang="scss">
:deep(.p-datatable-frozen-tbody) {
    font-weight: bold;
}

:deep(.p-datatable-scrollable .p-frozen-column) {
    font-weight: bold;
}

.p-invalid {
    border: 1px solid red !important;
    box-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
    margin: 1px;
}
</style>
