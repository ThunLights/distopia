<script lang="ts">
  import { parseErrRes } from "$lib/client/error.js";
  import Block from "$lib/components/Block.svelte";
  import PrimaryButton from "$lib/components/Button/PrimaryButton.svelte";
  import Meta from "$lib/components/Meta.svelte";
  import SubTitle from "$lib/components/SubTitle.svelte";
  import Profile from "$lib/components/User/Profile.svelte";

  const { data } = $props();
  const { user } = $derived(data);

  const title = $derived(`「${user.username}」の設定`);

  async function logoutAllDevices() {
    const response = await fetch("/api/user/logout/all", {
      method: "DELETE",
    });
    if (response.status === 200) {
      location.href = "/";
    } else if (response.status === 400) {
      await parseErrRes(response);
    }
  }
</script>

<Meta {title} />

<Profile {user} />
<Block>
  <SubTitle content="操作" />
  <div>
    <PrimaryButton onclick={logoutAllDevices}>全てのデバイスからログアウト</PrimaryButton>
  </div>
</Block>
