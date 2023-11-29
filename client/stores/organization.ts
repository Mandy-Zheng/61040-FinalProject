import { defineStore } from "pinia";
import { ref } from "vue";

import { BodyT, fetchy } from "@/utils/fetchy";

export const useOrganizationStore = defineStore(
  "organization",
  () => {
    const allOrgs = ref<Array<any>>([]);
    const selectedOrg = ref<number | undefined>(undefined);

    const getOrganizations = async () => {
      try {
        const orgs = await fetchy(`/api/organization`, "GET");
        allOrgs.value = orgs;
      } catch (error) {
        return;
      }
    };

    const setOrganization = async (name: string) => {
      allOrgs.value.forEach((org, idx) => {
        if (org.name === name) {
          selectedOrg.value = idx;
        } else if (name === "") {
          selectedOrg.value = undefined;
        }
      });
    };

    const createOrganization = async (body: BodyT) => {
      try {
        await fetchy("/api/organization", "POST", { body: body });
      } catch (_) {
        return;
      }
      await getOrganizations();
    };

    const updateOrganizationName = async (body: BodyT) => {
      try {
        await fetchy("/api/organization", "PATCH", { body: body });
      } catch (_) {
        return;
      }
      await getOrganizations();
    };

    const deleteOrganization = async (id: string) => {
      try {
        await fetchy(`/api/organization/${id}`, "DELETE");
      } catch (_) {
        return;
      }
    };

    return {
      allOrgs,
      selectedOrg,
      getOrganizations,
      setOrganization,
      updateOrganizationName,
      createOrganization,
      deleteOrganization,
    };
  },
  { persist: true },
);
