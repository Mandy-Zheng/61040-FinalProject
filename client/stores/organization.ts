import { defineStore } from "pinia";
import { ref } from "vue";

export const useOrganizationStore = defineStore(
  "organization",
  () => {
    const selectedOrg = ref<{ id: string; name: string; isAdmin: boolean } | undefined>(undefined);

    const setOrganization = async (org: { id: string; name: string; isAdmin: boolean } | undefined) => {
      selectedOrg.value = org;
    };

    return {
      selectedOrg,
      setOrganization,
    };
  },
  { persist: true },
);
