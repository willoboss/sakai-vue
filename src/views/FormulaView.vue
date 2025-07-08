<template>
    <div class="card">
        <div class="font-semibold text-xl mb-4">Liste des formules</div>

        <DataTable
            :value="formulas"
            :paginator="true"
            :rows="5"
            dataKey="FormulaId"
            :rowHover="true"
            v-model:filters="filters"
            filterDisplay="row"
            :filters="filters"
            :globalFilterFields="['code', 'label', 'amount', 'creditLimit', 'createdAt', 'updateAt']"
            showGridlines
            :rowsPerPageOptions="[5, 10, 20, 50]"
        >
            <template #header>
                <div class="flex justify-between">
                    <Dialog header="Ajouter une formule" v-model:visible="display" :breakpoints="{ '960px': '75vw' }" :style="{ width: '30vw' }" :modal="true">
                        <div class="flex flex-wrap items-center gap-4">
                            <div class="flex flex-wrap items-center gap-4">
                                <Form v-slot="$form" :initialValues :resolver @submit="onFormSubmit" class="flex flex-col gap-4 w-full sm:w-56">
                                    <div class="flex flex-col gap-4">
                                        <InputText name="label" type="text" placeholder="libelle" fluid />
                                        <Message v-if="$form.label?.invalid" severity="error" size="small" variant="simple">{{ $form.label.error?.message }}</Message>
                                        <IftaLabel>
                                            <InputNumber name="amount" rows="5" mode="currency" currency="XOF" locale="fr-FR" variant="filled" cols="30" />
                                            <label for="price_input">Montant</label>
                                        </IftaLabel>

                                        <Message v-if="$form.amount?.invalid" severity="error" size="small" variant="simple">{{ $form.amount.error?.message }}</Message>
                                        <IftaLabel>
                                            <InputNumber name="creditLimit" rows="5" mode="currency" currency="XOF" locale="fr-FR" variant="filled" cols="30" />
                                            <label for="price_input">Credit limite</label>
                                        </IftaLabel>
                                        <Message v-if="$form.creditLimit?.invalid" severity="error" size="small" variant="simple">{{ $form.creditLimit.error?.message }}</Message>

                                        <MultiSelect name="servicesId" :options="serviceMultiselect" optionLabel="selectLabel" filters placeholder="Selectionner un service" class="w-full md:w-80" />
                                        <Message v-if="$form.servicesId?.invalid" severity="error" size="small" variant="simple">{{ $form.servicesId.error?.message }}</Message>
                                    </div>
                                    <Button type="submit" :loading="loading[1]" severity="Secondary" label="Enregistrer" :fluid="false" />
                                </Form>
                            </div>
                        </div>
                    </Dialog>
                    <Button label="Ajouter" icon="pi pi-plus" style="width: auto" @click="open" />

                    <IconField>
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText v-model="filters['global'].value" placeholder="Recherche" />
                    </IconField>
                </div>
            </template>
            <Column field="code" header="Code" style="min-width: 12rem">
                <template #body="{ data }">
                    {{ data.code }}
                </template>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" type="number" @input="filterCallback()" />
                </template>
            </Column>
            <Column field="label" header="Libelle" style="min-width: 12rem">
                <template #body="{ data }">
                    {{ data.label }}
                </template>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" type="text" @input="filterCallback()" />
                </template>
            </Column>
            <Column field="amount" header="Montant" style="min-width: 12rem">
                <template #body="{ data }">
                    {{ data.amount }}
                </template>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" type="number" @input="filterCallback()" />
                </template>
            </Column>
            <Column field="creditLimit" header="Credit limite" style="min-width: 12rem">
                <template #body="{ data }">
                    {{ data.creditLimit }}
                </template>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" type="number" @input="filterCallback()" />
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

            <Column header="Actions" style="min-width: 12rem">
                <template #body="{ data }">
                    <Dialog header="Modifier une formule" v-model:visible="displayUpdate" :breakpoints="{ '960px': '75vw' }" :style="{ width: '30vw' }" :modal="true">
                        <div class="flex flex-wrap items-center gap-4">
                            <div class="flex flex-wrap items-center gap-4">
                                <Form v-slot="$form" :initialValues :resolver @submit="onFormSubmitUpdate" class="flex flex-col gap-4 w-full sm:w-56">
                                    <div class="flex flex-col gap-4">
                                        <InputText name="label" type="text" placeholder="libelle" fluid />
                                        <Message v-if="$form.label?.invalid" severity="error" size="small" variant="simple">{{ $form.label.error?.message }}</Message>
                                        <IftaLabel>
                                            <InputNumber name="amount" rows="5" mode="currency" currency="XOF" locale="fr-FR" variant="filled" cols="30" />
                                            <label for="price_input">Montant</label>
                                        </IftaLabel>

                                        <Message v-if="$form.amount?.invalid" severity="error" size="small" variant="simple">{{ $form.amount.error?.message }}</Message>
                                        <IftaLabel>
                                            <InputNumber name="creditLimit" rows="5" mode="currency" currency="XOF" locale="fr-FR" variant="filled" cols="30" />
                                            <label for="price_input">Credit limite</label>
                                        </IftaLabel>
                                        <Message v-if="$form.creditLimit?.invalid" severity="error" size="small" variant="simple">{{ $form.creditLimit.error?.message }}</Message>

                                        <MultiSelect name="servicesId" :options="serviceMultiselect" optionLabel="selectLabel" filters placeholder="Selectionner un service" class="w-full md:w-80" />
                                        <Message v-if="$form.servicesId?.invalid" severity="error" size="small" variant="simple">{{ $form.servicesId.error?.message }}</Message>
                                    </div>
                                    <Button type="submit" :loading="loading[1]" severity="Secondary" label="Enregistrer" :fluid="false" />
                                </Form>
                            </div>
                        </div>
                    </Dialog>
                    <Button icon="pi pi-pencil" class="p-button-text p-button-warning" @click="openUpdate(data)" />
                    <ConfirmPopup></ConfirmPopup>
                    <Button icon="pi pi-trash" class="p-button-text p-button-danger" @click="confirm2($event, data)" />
                </template>
            </Column>
        </DataTable>
    </div>
    <transition-group name="p-message" tag="div">
        <Message v-for="msg of message" :severity="msg.severity" :key="msg.content">{{ msg.content }}</Message>
    </transition-group>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth';
import { onMounted, computed } from 'vue';
import { CustomerService } from '@/service/CustomerService';
import { ProductService } from '@/service/ProductService';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import { onBeforeMount, reactive, ref } from 'vue';
import { useFormulaStore } from '@/stores/formula';
import { useServiceStore } from '@/stores/service';
import { useToast } from 'primevue/usetoast';
import { Form } from '@primevue/forms';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import { useConfirm } from 'primevue/useconfirm';

const initialValues = ref({
    label: '',
    amount: 0,
    creditLimit: 0,
    servicesId: []
});

const serviceMultiselect = ref([{ label: '', code: '', description: '', selectLabel: '' }]);

const loading = ref([false, false, false]);

const toast = useToast();
const message = ref([]);
const display = ref(false);
const displayUpdate = ref(false);
const displayConfirmation = ref(false);
const msg = ref('');

const authStore = useAuthStore();

const serviceStore = useServiceStore();

const services = computed(() => serviceStore.getServices);

const formulas = computed(() => formulaStore.getFormulas);

const formula = ref({
    label: '',
    code: '',
    amount: '',
    creditLimit: '',
    servicesId: []
});

const formulaUpdate = ref({
    code: '',
    label: '',
    formulaId: '',
    amount: '',
    creditLimit: '',
    servicesId: [],
    createdAt: '',
    updateAt: ''
});

const confirm = useConfirm();

const formulaStore = useFormulaStore();

const isModalOpen = ref(false);

const representatives = reactive([
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

const cities = ref([
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' }
]);

const resolver = zodResolver(
    z
        .object({
            label: z.string().min(1, { message: 'Le libellé est requis.' }),
            amount: z.number().min(1, { message: 'Le montant est requis.' }),
            creditLimit: z.number().min(1, { message: 'Le crédit limite est requis.' }),
            servicesId: z
                .array(
                    z.object({
                        serviceId: z.number().min(1, 'Le service est requis.')
                    })
                )
                .min(1, 'Le service est requis.')
        })
        .refine((data) => data.amount <= data.creditLimit, {
            message: 'Le montant ne peut pas dépasser le crédit limite.',
            path: ['amount']
        })
);

const onFormSubmit = (e) => {
    if (e.valid) {
        console.log('Form values:', e);
        formula.value.label = e.values.label;
        formula.value.amount = e.values.amount;
        formula.value.creditLimit = e.values.creditLimit;
        formula.value.servicesId = e.values.servicesId.map((service) => service.serviceId);

        console.log(formula.value);

        formulaAdd(formula.value);
    }
};

const onFormSubmitUpdate = (e) => {
    if (e.valid) {
        console.log('Form values:', initialValues.value);
        formulaUpdate.value.label = e.values.label;
        formulaUpdate.value.amount = e.values.amount;
        formulaUpdate.value.creditLimit = e.values.creditLimit;
        formulaUpdate.value.updateAt = getCurrentFormattedDate();
        formulaUpdate.value.servicesId = e.values.servicesId.map((service) => service.serviceId);

        console.log(formulaUpdate.value);

        formulUpdate(formulaUpdate.value);
    }
};

const formulaAdd = async (value) => {
    try {
        await formulaStore.addFormula(authStore.token, value);

        showSuccess(' Formule ' + formula.value.label + ' ajoutée');
        formulaStore.getAllFormulas(authStore.token);
        close();
    } catch (error) {
        console.error("Erreur lors de l'ajout de la formule :", error);
        showError("Erreur lors de l'ajout de la formule");
    } finally {
        loading.value[1] = false;
    }
};

const formulUpdate = async (value) => {
    console.log('Valeur de Formule:', value);

    try {
        await formulaStore.updateFormula(authStore.token, value.formulaId, value);
        showSuccess('Formule ' + value.label + ' modifié');

        updateData(value);
        close();
    } catch (error) {
        console.error('Erreur lors de la modification de la formule :', error);
        showError('Erreur lors de la modification de la formule');
    } finally {
        loading.value[1] = false;
    }
};

function updateData(value) {
    console.log('valeur value update: ', value);

    formulaUpdate.value = { ...value };

    formulaUpdate.value.services = value.servicesId.map((id) => getService(id));

    delete formulaUpdate.value.servicesId;

    const index = formulaStore.getFormulas.findIndex((formula) => formula.formulaId === value.formulaId);

    if (index !== -1) {
        formulaStore.getFormulas[index] = formulaUpdate.value;
    }

    console.log('valeur value update: ', formulaStore.getFormulas);
}

function getService(serviceId) {
    return serviceStore.getServices.find((service) => service.serviceId === serviceId);
}

const formulaDelete = async (formula) => {
    try {
        await formulaStore.deleteFormula(authStore.token, formula.formulaId);
        showSuccess('Formule ' + formula.label + ' supprimée');
        deleteData(formula);
        close();
    } catch (error) {
        console.error('Erreur lors de la suppression de la formule :', error);
        showError('Erreur lors de la suppression de la formule ');
    } finally {
        loading.value[1] = false;
    }
};

function deleteData(formula) {
    formulaStore.removeFormula(formula.formulaId);
}

function init() {
    formula.value = {
        label: '',
        amount: 0,
        creditLimit: 0,
        servicesId: []
    };

    formulaUpdate.value = {
        formulaId: '',
        label: '',
        code: '',
        amount: 0,
        creditLimit: 0,
        servicesId: []
    };

    initialValues.value = {
        label: '',
        amount: 0,
        creditLimit: 0,
        servicesId: []
    };
}
function open() {
    init();
    display.value = true;
}

function openUpdate(data) {
    formulaUpdate.value.formulaId = data.formulaId;
    formulaUpdate.value.code = data.code;
    formulaUpdate.value.createdAt = data.createdAt;
    initialValues.value.label = data.label;
    initialValues.value.amount = data.amount;
    initialValues.value.creditLimit = data.creditLimit;

    initialValues.value.servicesId = data.services.map((service) => ({
        ...service,
        selectLabel: `${service.code} - ${service.label}`
    }));

    console.log(formulaUpdate.value);
    displayUpdate.value = true;
}

function mappingService() {
    serviceMultiselect.value = serviceStore.getServices.map((service) => ({
        ...service,
        selectLabel: `${service.code} - ${service.label}`
    }));

    console.log('serviceMultiSelect :', serviceMultiselect.value);
}

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

const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    code: { value: null, matchMode: FilterMatchMode.CONTAINS },
    label: { value: null, matchMode: FilterMatchMode.CONTAINS },
    amount: { value: null, matchMode: FilterMatchMode.CONTAINS },
    creditLimit: { value: null, matchMode: FilterMatchMode.CONTAINS },
    createdAt: { value: null, matchMode: FilterMatchMode.CONTAINS },
    updateAt: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

function close() {
    display.value = false;
    displayUpdate.value = false;
    init();
}

function formatDate(value) {
    if (value) {
        return convertDate(value);
    }
    return null;
}

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

const confirm2 = (event, data) => {
    msg.value = 'Veux tu supprimer cette formule?  ' + data.label;
    confirm.require({
        target: event.currentTarget,
        message: msg,
        icon: 'pi pi-info-circle',
        rejectProps: {
            label: 'Annuler',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: 'Supprimer',
            severity: 'danger'
        },
        accept: () => {
            formulaDelete(data);
        },
        reject: () => {
            showInfo('annulation de la suppression');
        }
    });
};

onMounted(async () => {
    if (authStore.token) {
        await serviceStore.getAllServices(authStore.token);
        await formulaStore.getAllFormulas(authStore.token);
        mappingService();
    }
});
</script>

<style scoped lang="scss">
:deep(.p-datatable-frozen-tbody) {
    font-weight: bold;
}

:deep(.p-datatable-scrollable .p-frozen-column) {
    font-weight: bold;
}
</style>
