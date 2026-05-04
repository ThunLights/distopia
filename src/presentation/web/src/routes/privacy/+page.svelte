<script lang="ts">
  import Footer from "$lib/components/Footer.svelte";
  import Privacy from "$lib/components/Main/Privacy.svelte";
  import Meta from "$lib/components/Meta.svelte";
</script>

<Meta
  title="プライバシーポリシー"
  description={[
    "Distopiaのプライバシーポリシーです。",
    "サービス利用時に一度ご確認ください。",
  ].join("")}
/>

<main>
  <div class="contents">
    <div class="context">
      <Privacy />
    </div>
  </div>
</main>
<Footer />

<style>
  main {
    min-height: 90vh;
  }
  .context {
    overflow: hidden;
    margin: 10px 20px;
  }
  .contents {
    overflow: hidden;
    display: block;
    background-color: rgb(37, 36, 41);
    border-radius: 10px;
    width: 90%;
    margin: 20px auto;
  }
</style>
