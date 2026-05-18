<script lang="ts">
  /* eslint svelte/no-navigation-without-resolve: "off" */
  import type { ResolvedPathname } from "$app/types";
  import { createRedirectEvent } from "$lib/client/redirect";
  import PrimaryButton from "./PrimaryButton.svelte";

  type Props = {
    label: string;
  } & (
    | {
        rel: "internal";
        link: ResolvedPathname;
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
    <a href={link}>{label}</a>
  {/if}
</PrimaryButton>

<style>
  a {
    text-decoration: none;
    color: white;
  }
</style>
