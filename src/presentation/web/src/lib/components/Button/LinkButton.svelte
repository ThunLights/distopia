<script lang="ts">
  import { resolve } from "$app/paths";
  import type { Pathname } from "$app/types";
  import { createRedirectEvent } from "$lib/client/redirect";
  import PrimaryButton from "./PrimaryButton.svelte";

  type Props = {
    label: string;
  } & (
    | {
        rel: "internal";
        link: Pathname;
      }
    | {
        rel: "external";
        link: string;
      }
  );

  const { label, link, rel }: Props = $props();
</script>

<PrimaryButton onclick={createRedirectEvent(link)}>
  {#if rel === "external"}
    <a href={link} rel="external">{label}</a>
  {:else}
    <a href={resolve(link)}>{label}</a>
  {/if}
</PrimaryButton>

<style>
  a {
    text-decoration: none;
    color: white;
  }
</style>
