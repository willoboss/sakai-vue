
<script setup>
import { useAuthStore } from '@/stores/auth';
import { computed, onMounted, ref, watch } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

const authStore = useAuthStore();

// Données des menus depuis le store
const menus = computed(() => authStore.getMenus); // Assurez-vous que `getMenus` retourne un tableau

// Modèle réactif pour le menu
const model = ref([
]);

// Fonction pour transformer les menus
const handlerMenu = () => {
  // Vérifiez si `menus` contient un tableau valide avant de transformer
  if (Array.isArray(menus.value)) {
    model.value = menus.value.map(menu => ({
      label: menu.label, // Copie le label du menu principal
      items: menu.items?.map(subItem => {
        const transformedSubItem = {
          label: subItem.label,
          icon: subItem.icon || 'pi pi-fw pi-bars', // Icône par défaut si aucune n'est spécifiée
          to: subItem.to // Chemin du sous-menu
        };

        // Ajout conditionnel de `items` uniquement si ce n'est pas vide
        if (subItem.items && subItem.items.length > 0) {
          transformedSubItem.items = subItem.items.map(nestedItem => ({
            label: nestedItem.label,
            icon: nestedItem.icon || 'pi pi-fw pi-angle-right', // Icône par défaut pour les sous-sous-menus
            to: nestedItem.to
          }));
        }

        return transformedSubItem;
      })
    })); 
  } else {
    console.warn('Les données de menus ne sont pas valides:', menus.value);
  }
};




// Appeler la transformation une fois les données prêtes
onMounted(() => {
  if (authStore.token) {
    handlerMenu();
    console.log(model.value)
  }
});
</script>

<template>
  <ul class="layout-menu">
    <template v-for="(item, i) in model" :key="i">
      <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
      <li v-if="item.separator" class="menu-separator"></li>
    </template>
  </ul>
</template>

<style lang="scss" scoped></style>



