<script lang="ts">
  import Block from "$lib/components/Block.svelte";
  import Meta from "$lib/components/Meta.svelte";
  import Profile from "$lib/components/Staff/Profile.svelte";
  import Recruitment from "$lib/components/Staff/Recruitment.svelte";
  import Title from "$lib/components/Title.svelte";
  import { staffs } from "$lib/shared/constant";
</script>

<Meta
  title="スタッフ情報"
  description={[
    "Distopiaのスタッフ一覧です。",
    "このページに乗っている人以外はスタッフではありません。",
  ].join("")}
/>

<Block>
  <div class="staffs">
    <Title content="現在のスタッフ一覧" />
    {#each staffs as staff (staff)}
      <Profile {staff} />
    {/each}
  </div>
</Block>
<Block>
  <Recruitment />
</Block>

<style>
  .staffs {
    width: 95%;
    margin: 0 auto;
  }
</style>
