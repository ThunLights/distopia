<script lang="ts">
  import "$lib/assets/title-h1.css";
  import Block from "$lib/components/Block.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Meta from "$lib/components/Meta.svelte";
  import Profile from "$lib/components/Staff/Profile.svelte";
  import Recruitment from "$lib/components/Staff/Recruitment.svelte";
  import { staffs } from "$lib/shared/constant";

  const title = "スタッフ情報";
</script>

<Meta
  {title}
  description={[
    "Distopiaのスタッフ一覧です。",
    "このページに乗っている人以外はスタッフではありません。",
  ].join("")}
/>

<main>
  <Block>
    <div class="staffs">
      <h1 class="title">現在のスタッフ一覧</h1>
      {#each staffs as staff (staff)}
        <Profile {staff} />
      {/each}
    </div>
  </Block>
  <Block>
    <Recruitment />
  </Block>
</main>
<Footer />

<style>
  .staffs {
    width: 95%;
    margin: 0 auto;
  }
</style>
