<script lang="ts">
  import { resolve } from "$app/paths";
  import "$lib/assets/a-tag.css";
  import Block from "$lib/components/Block.svelte";
  import Meta from "$lib/components/Meta.svelte";
  import SubTitle from "$lib/components/SubTitle.svelte";
  import Title from "$lib/components/Title.svelte";
</script>

<Meta
  title="Other Links"
  description={["Distopiaの色々なリンクをまとめてあります。", "気軽にご覧ください。"].join("")}
/>

<Block>
  <Title content="Others" />
  <div>
    <SubTitle content="ガイドライン" />
    <a href={resolve("/guidelines")}>https://distopia.top/guidelines</a>
  </div>
  <div>
    <SubTitle content="支援団体" />
    <a href={resolve("/supporters")}>https://distopia.top/supporters</a>
  </div>
  <div>
    <SubTitle content="Distopiaについて" />
    <a href={resolve("/about")}>https://distopia.top/about</a>
  </div>
  <div>
    <SubTitle content="スタッフ一覧" />
    <a href={resolve("/staff")}>https://distopia.top/staff</a>
  </div>
</Block>
