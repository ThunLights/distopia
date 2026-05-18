<script lang="ts">
  import { page } from "$app/state";
  import Footer from "$lib/components/Footer.svelte";
  import Meta from "$lib/components/Meta.svelte";

  const title = "ページが見つかりませんでした";
  const description = [
    "ページが見つかりませんでした。",
    "URLのタイプミスなどはありませんか？",
    "再度確認してみてください。",
  ].join("");
</script>

<Meta {title} {description} />

<main>
  <div class="contents">
    <p class="contents-title">{page.status}</p>
    {#if page.error?.message}
      <p>{page.error.message}</p>
    {/if}
  </div>
</main>
<Footer fixed={true}></Footer>

<style>
  main {
    width: 100%;
  }
  p {
    color: rgb(153, 153, 153);
  }
  .contents {
    text-align: center;
  }
  .contents-title {
    font-size: 60px;
  }
</style>
