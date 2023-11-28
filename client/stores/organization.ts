import { defineStore } from "pinia";
import { ref } from "vue";

import { BodyT, fetchy } from "@/utils/fetchy";

export const useOrganizationStore = defineStore(
  "organization",
  () => {
    const orgId = ref<any>(undefined);
    const orgName = ref<string>("");

    const getPostValidations = async () => {
      try {
        postValidations.value = await Promise.all(viewablePosts.value.map((post) => fetchy(`/api/validation/exclusivepost/${post.post._id}`, "GET")));
      } catch (error) {
        return;
      }
    };

    const getPosts = async () => {
      try {
        viewablePosts.value = await fetchy("/api/exclusivepost", "GET");
        postValidations.value = await Promise.all(viewablePosts.value.map((post) => fetchy(`/api/validation/exclusivepost/${post.post._id}`, "GET")));
      } catch (_) {
        return;
      }
    };

    const createPost = async (body: BodyT) => {
      try {
        await fetchy("/api/exclusivepost", "POST", { body: body });
      } catch (_) {
        return;
      }
      await getPosts();
    };

    const deletePost = async (id: string) => {
      try {
        await fetchy(`/api/exclusivepost/${id}`, "DELETE");
      } catch (_) {
        return;
      }
      await getPosts();
    };

    return {
      postValidations,
      viewablePosts,
      createPost,
      getPostValidations,
      deletePost,
      getPosts,
    };
  },
  { persist: true },
);
