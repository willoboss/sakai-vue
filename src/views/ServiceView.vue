<script setup>
import { useAuthStore } from "@/stores/auth";
import { useServiceStore } from "@/stores/service";
import { useAccountStore } from "@/stores/account";
import Swal from "sweetalert2";
import { computed, onMounted } from "vue";
import { useConfirm } from "primevue/useconfirm";

import { FilterMatchMode, FilterOperator } from "@primevue/core/api";
import { onBeforeMount, reactive, ref } from "vue";
import { useToast } from "primevue/usetoast";
import { Form } from "@primevue/forms";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import { z } from "zod";
const authStore = useAuthStore();

const serviceStore = useServiceStore();

const services = computed(() => serviceStore.getServices);

const msg = ref("");

const service = ref({
  label: "",
  code: "",
  description: "",
});

const servUpdate = ref({
  serviceId: 0,
  label: "",
  code: "",
  description: "",
});

const loading = ref([false, false, false]);

const toast = useToast();
const message = ref([]);
const display = ref(false);
const displayUpdate = ref(false);
const displayConfirmation = ref(false);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  label: { value: null, matchMode: FilterMatchMode.CONTAINS },
  code: { value: null, matchMode: FilterMatchMode.CONTAINS },
  description: { value: null, matchMode: FilterMatchMode.CONTAINS },
  createdAt: { value: null, matchMode: FilterMatchMode.CONTAINS },
  updateAt: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const errors = reactive({ label: "", code: "", description: "" });

const confirm = useConfirm();

const initialValues = ref({
  label: "",
  code: "",
  description: "",
});

const dt = ref();

const exportCSV = () => {
  dt.value.exportCSV();
};

const resolver = zodResolver(
  z.object({
    label: z.string().min(1, { message: "libelle is required." }),
    description: z.string().min(0, { message: "Description is required." }),
  })
);

const onFormSubmit = (e) => {
  if (e.valid) {
    console.log("Form values:", e.values);
    serviceAdd(e.values);
  }
};

const onFormSubmitUpdate = (e) => {
  if (e.valid) {
    console.log("Form values:", initialValues.value);
    servUpdate.value.serviceId = initialValues.value.serviceId;
    servUpdate.value.code = initialValues.value.code;
    servUpdate.value.createdAt = initialValues.value.createdAt;
    servUpdate.value.label = e.values.label;
    servUpdate.value.description = e.values.description;
    servUpdate.value.updateAt = getCurrentFormattedDate();
    console.log(servUpdate.value);
    serviceUpdate(servUpdate.value);
  }
};

// Fonction pour ajouter un service
const serviceAdd = async (value) => {
  try {
    await serviceStore.addService(authStore.token, value);

    showSuccess("Service " + service.value.label + "ajouté");
    serviceStore.getAllServices(authStore.token);
    close();
  } catch (error) {
    console.error("Erreur lors de l'ajout du service :", error);
    showError("Erreur lors de l'ajout du service");
  } finally {
    loading.value[1] = false;
  }
};

function init() {
  service.value = {
    label: "",
    code: "",
    description: "",
  };

  initialValues.value = {
    label: "",
    code: "",
    description: "",
  };

  servUpdate.value = {
    serviceId: 0,
    label: "",
    code: "",
    description: "",
  };
}

const serviceUpdate = async (value) => {
  console.log("Valeur de services:", value);
  try {
    await serviceStore.updateService(authStore.token, value.serviceId, value);
    showSuccess("Service " + value.label + " modifié");

    updateData(value);
    close();
  } catch (error) {
    console.error("Erreur lors de la modification du service :", error);
    showError("Erreur lors de la modification du service");
  } finally {
    loading.value[1] = false;
  }
};

function updateData(value) {
  const index = serviceStore.getServices.findIndex(
    (service) => service.serviceId === value.serviceId
  );

  if (index !== -1) {
    serviceStore.getServices[index] = value;
  }

  console.log("valeur value update: ", serviceStore.getServices);
}

function deleteData(service) {
  serviceStore.removeService(service.serviceId);
}

const alertSuccessUpdade = (message) => {
  Swal.fire({
    icon: "success",
    title: "Service Modifié",
    text: `${message}`,
    timer: 3000,
    willClose: () => {
      window.location.reload();
    },
  });
};

const serviceDelete = async (service) => {
  try {
    await serviceStore.deleteService(authStore.token, service.serviceId);
    showSuccess("Service " + service.label + " supprimé");
    deleteData(service);
    close();
  } catch (error) {
    console.error("Erreur lors de la suppression du service :", error);
    showError("Erreur lors de la suppression du service ");
  } finally {
    loading.value[1] = false;
  }
};

function formatCurrency(value) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
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
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const milliseconds = String(date.getMilliseconds()).padStart(6, "0"); // Assure 6 chiffres

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
}
function convertDate(dateString) {
  const cleanDateString = dateString.split(".")[0];
  const date = new Date(cleanDateString);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year}`;
}

function open() {
  init();
  display.value = true;
}

function openUpdate(data) {
  initialValues.value = data;
  console.log("form init :", initialValues);
  displayUpdate.value = true;
}

function close() {
  display.value = false;
  displayUpdate.value = false;
  init();
  console.log("closen");
}

function showSuccess(message) {
  toast.add({
    severity: "success",
    summary: "succès",
    detail: `${message}`,
    life: 3000,
  });
}

function showInfo(message) {
  toast.add({
    severity: "info",
    summary: "Information !",
    detail: message,
    life: 3000,
  });
}

function showWarn() {
  toast.add({
    severity: "warn",
    summary: "Warn Message",
    detail: "Message Detail",
    life: 3000,
  });
}

function showError(message) {
  toast.add({
    severity: "error",
    summary: "Error Message",
    detail: `${message}`,
    life: 3000,
  });
}

const confirm2 = (event, data) => {
  msg.value = "Veux tu supprimer ce service?  " + data.label;
  confirm.require({
    target: event.currentTarget,
    message: msg,
    icon: "pi pi-info-circle",
    rejectProps: {
      label: "Annuler",
      severity: "secondary",
      outlined: true,
    },
    acceptProps: {
      label: "Supprimer",
      severity: "danger",
    },
    accept: () => {
      serviceDelete(data);
    },
    reject: () => {
      showInfo("annulation de la suppression");
    },
  });
};

onMounted(async () => {
  authStore.checkAuth();
  if (authStore.token) {
    serviceStore.getAllServices(authStore.token);
    console.log(services);
  }
});
</script>
<template>
  <div class="card">
    <div class="font-semibold text-xl mb-4">Liste des services</div>

    <DataTable
      :value="services"
      :paginator="true"
      :rows="5"
      dataKey="serviceId"
      :rowHover="true"
      filterDisplay="row"
      v-model:filters="filters"
      :filters="filters"
      :globalFilterFields="['label', 'code', 'description', 'createdAt', 'updateAt']"
      showGridlines
      :rowsPerPageOptions="[5, 10, 20, 50]"
      ref="dt"
    >
      <template #header>
        <div class="flex justify-between">
          <Dialog
            header="Ajouter un service"
            v-model:visible="display"
            :breakpoints="{ '960px': '75vw' }"
            :style="{ width: '30vw' }"
            :modal="true"
          >
            <div class="flex flex-wrap items-center gap-4">
              <div class="flex flex-wrap items-center gap-4">
                <Form
                  v-slot="$form"
                  :initialValues
                  :resolver
                  @submit="onFormSubmit"
                  class="flex flex-col gap-4 w-full sm:w-56"
                >
                  <div class="flex flex-col gap-4">
                    <InputText name="label" type="text" placeholder="libelle" fluid />
                    <Message
                      v-if="$form.label?.invalid"
                      severity="error"
                      size="small"
                      variant="simple"
                      >{{ $form.label.error?.message }}</Message
                    >
                    <Textarea
                      name="description"
                      rows="5"
                      placeholder="description..."
                      cols="30"
                    />
                    <Message
                      v-if="$form.description?.invalid"
                      severity="error"
                      size="small"
                      variant="simple"
                      >{{ $form.description.error?.message }}</Message
                    >
                  </div>
                  <Button
                    type="submit"
                    :loading="loading[1]"
                    severity="Secondary"
                    label="Enregistrer"
                    :fluid="false"
                  />
                </Form>
              </div>
            </div>
          </Dialog>
          <Button label="Ajouter" icon="pi pi-plus" style="width: auto" @click="open" />

          <Button icon="pi pi-external-link" label="Export" @click="exportCSV($event)" />

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
          <InputText v-model="filterModel.value" type="text" @input="filterCallback()" />
        </template>
      </Column>
      <Column field="label" header="Libélle" style="min-width: 12rem">
        <template #body="{ data }">
          {{ data.label }}
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText v-model="filterModel.value" type="text" @input="filterCallback()" />
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
          <Dialog
            header="Modifier un service"
            v-model:visible="displayUpdate"
            :breakpoints="{ '960px': '75vw' }"
            :style="{ width: '30vw' }"
            :modal="true"
          >
            <div class="flex flex-wrap items-center gap-4">
              <div class="flex flex-wrap items-center gap-4">
                <Form
                  v-slot="$form"
                  :initialValues
                  :resolver
                  @submit="onFormSubmitUpdate"
                  class="flex flex-col gap-4 w-full sm:w-56"
                >
                  <div class="flex flex-col gap-4">
                    <InputText name="label" type="text" placeholder="libelle" fluid />
                    <Message
                      v-if="$form.label?.invalid"
                      severity="error"
                      size="small"
                      variant="simple"
                      >{{ $form.label.error?.message }}</Message
                    >

                    <Textarea
                      name="description"
                      rows="5"
                      placeholder="description..."
                      cols="30"
                    />
                    <Message
                      v-if="$form.description?.invalid"
                      severity="error"
                      size="small"
                      variant="simple"
                      >{{ $form.description.error?.message }}</Message
                    >
                  </div>
                  <Button
                    type="submit"
                    :loading="loading[1]"
                    severity="Secondary"
                    label="Enregistrer"
                    :fluid="false"
                  />
                </Form>
              </div>
            </div>
          </Dialog>

          <Button
            icon="pi pi-pencil"
            class="p-button-text p-button-warning"
            @click="openUpdate(data)"
          />
          <ConfirmPopup></ConfirmPopup>
          <Button
            icon="pi pi-trash"
            class="p-button-text p-button-danger"
            @click="confirm2($event, data)"
          />
        </template>
      </Column>
    </DataTable>
  </div>
  <transition-group name="p-message" tag="div">
    <Message v-for="msg of message" :severity="msg.severity" :key="msg.content">{{
      msg.content
    }}</Message>
  </transition-group>
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
