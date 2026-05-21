<script lang="ts">
  import Block from "$lib/components/Block.svelte";
  import Meta from "$lib/components/Meta.svelte";
  import Title from "$lib/components/Title.svelte";
  import { onMount } from "svelte";

  const { data } = $props();
  const { user, error } = $derived(data);
  const result = $derived(
    error ?? (user ? "認証に成功しました。" : "認証に失敗しました。"),
  );
  const title = $derived(result);
  const description = $derived(
    user ? `${result}数秒後にリダイレクトされます。` : `${result}再度試してみてください。`,
  );

  onMount(async () => {
    setTimeout(async () => {
      location.href = "/";
    }, 3000);
  });
</script>

<Meta {title} {description} />

<Block>
  <Title content={result} />
  <p>{description}</p>
</Block>
