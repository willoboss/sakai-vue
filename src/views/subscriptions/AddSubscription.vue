<script setup>
import { useAccountStore } from "@/stores/account";
import { useAuthStore } from "@/stores/auth";
import { useFormulaStore } from "@/stores/formula";
import { useSubscriptionStore } from "@/stores/subscription";
import { computed, onMounted, ref } from "vue";
import { z } from "zod";
import { zodResolver } from "@primevue/forms/resolvers/zod";
import Swal from "sweetalert2";
import { useToast } from "primevue/usetoast";

const toast = useToast();

const authStore = useAuthStore();
const formulaStore = useFormulaStore();
const accountStore = useAccountStore();
const subscriptionStore = useSubscriptionStore();

const loading = ref(false);

const formulas = computed(() => formulaStore.getFormulas);
const account = computed(() => accountStore.getAccount);
const numberAccount = ref("");

const subscription = ref({
  formulasId: [],
  accountId: "",
});

const initialValues = ref({
  numberAccount: "",
});

const initialValuesSub = ref({
  formulasId: [],
});

const isOpen = ref(false);

onMounted(async () => {
  if (authStore.token) {
    await formulaStore.getAllFormulas(authStore.token);
    console.log(formulas.value);
    accountStore.getAccount = "";
  }
});

const addSubcription = () => {
  subscription.value.accountId = account.value.accountId;
  console.log(subscription.value);
  subscriptionStore.addSubscription(authStore.token, subscription.value);
  alertSuccess("abonnement effectué en attente de validation!");
  closeCustomer();
};

const getAccount = async (value) => {
  try {
    load();
    await accountStore.searchAccount(authStore.token, value.numberAccount);
    openCustomer();
    console.log("Numéro de compte recherché :", value.numberAccount);
    showSuccess("N° Compte trouvé");
  } catch (error) {
    console.error("Erreur lors de la récupération du compte :", error);
    showError("N° de compte introuvable");
    closeCustomer();
  } finally {
    load();
  }
};

function init() {
  subscription.value = {
    formulasId: [],
    accountId: "",
  };
  initialValues.value = {
    numberAccount: "",
    formulasId: [],
    accountId: "",
  };
}

const onFormSubmit = (e) => {
  if (e.valid) {
    console.log("Form values:", e.values);
    getAccount(e.values);
  }
};

const onFormSubmitSubscribe = (e) => {
  if (e.valid) {
    console.log("Form values:", e.values);
    // getAccount(e.values);
  }
};

const closeCustomer = () => {
  isOpen.value = false;
  init();
};

const openCustomer = () => {
  isOpen.value = true;
};

const resolver = zodResolver(
  z.object({
    numberAccount: z
      .string()
      .min(12, { message: "numéro de compte est requis." })
      .regex(/^\d+$/, { message: "Le numéro de compte incorrect." }),
  })
);

const formData = ref({
  formulasId: [],
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
  console.log("Données valides :", formData.value);
  subscription.value.formulasId = formData.value.formulasId
  subscription.value.accountId = accountStore.getAccount.accountId
  console.log("Données valides :", subscription.value);

  subscribeAdd(subscription.value)
}


const subscribeAdd = async (value) => {
  try {
    await subscriptionStore.addSubscription(authStore.token, value);

    showSuccess(" Abonnement effectué");
    closeCustomer();
  } catch (error) {
    console.error("Erreur lors de l'abonnement :", error);
    showError("Erreur lors de l'abonnement ");
  } finally {
    loading.value = false;
  }
};

const schema = z.object({
  formulasId: z
    .array(z.number().min(1, { message: "Formule invalide." }))
    .min(1, { message: "Veuillez sélectionner au moins une formule." }),
});

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

function load() {
  loading.value = true;
  setTimeout(() => (loading.value = false), 1000);
  console.log("I am load");
}
</script>

<template #center>
  <div class="p-5">
    <div class="card">
      <div class="font-semibold text-xl mb-4">
        Rechercher un compte et abonner un client
      </div>
      <!-- 🔍 Barre de recherche pour un compte -->
      <div class="flex gap-3 my-4">
        <Form
          v-slot="$form"
          :initialValues
          :resolver
          @submit="onFormSubmit"
          class="flex flex-col gap-4 w-full sm:w-56"
        >
          <IconField iconPosition="left">
            <InputText
              @click="closeCustomer"
              @input="closeCustomer"
              name="numberAccount"
              type="text"
              placeholder="N° de compte"
            />
          </IconField>
          <Message
            v-if="$form.numberAccount?.invalid"
            severity="error"
            size="small"
            variant="simple"
            >{{ $form.numberAccount.error?.message }}</Message
          >
          <Button
            type="submit"
            class="mr-2 mb-2"
            label="Search"
            icon="pi pi-search"
            :loading="loading[0]"
          />
        </Form>
      </div>
    </div>
    <Card v-if="isOpen" style="width: 25rem; overflow: hidden">
      <template #title>Abonnement client</template>
      <template #subtitle>N°{{ account.numberAccount }}</template>
      <template #content>
        <div class="flex gap-4 mt-1">
          <Form @submit="validateAndSubmit" class="flex flex-col gap-4 w-full sm:w-60">
            <MultiSelect
              v-model="formData.formulasId"
              :options="formulas"
              optionLabel="label"
              optionValue="formulaId"
              placeholder="Sélectionner une formule"
              class="w-full md:w-80"
            />
            <Message
              v-if="errors.formulasId"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ errors.formulasId }}
            </Message>
            <div>
              <Button label="Abonner" type="submit" class="w-full" />
            </div>
          </Form>
        </div>
      </template>
    </Card>
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
