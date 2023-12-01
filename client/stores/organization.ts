import { defineStore } from "pinia";
import { ref } from "vue";

export const useOrganizationStore = defineStore(
  "organization",
  () => {
    const selectedOrg = ref<{ id: string; name: string } | undefined>(undefined);

    const setOrganization = async (org: { id: string; name: string } | undefined) => {
      selectedOrg.value = org;
    };

    // const createOrganization = async (body: BodyT) => {
    //   try {
    //     await fetchy("/api/organization", "POST", { body: body });
    //   } catch (_) {
    //     return;
    //   }
    //   await getOrganizations();
    // };

    // const deleteOrganization = async (id: string) => {
    //   try {
    //     await fetchy(`/api/organization/${id}`, "DELETE");
    //     await getOrganizations();
    //   } catch (_) {
    //     return;
    //   }
    // };

    // const leaveOrganization = async (orgId: any) => {
    //   try {
    //     const body = { orgId: orgId };
    //     await fetchy("/api/organization/leaveOrganization", "PATCH", { body: body });
    //     await getOrganizations();
    //   } catch (_) {
    //     return;
    //   }
    // };

    return {
      // allOrgs,
      selectedOrg,
      // getOrganizations,
      setOrganization,
      // createOrganization,
      // deleteOrganization,
      // leaveOrganization,
    };
  },
  { persist: true },
);
