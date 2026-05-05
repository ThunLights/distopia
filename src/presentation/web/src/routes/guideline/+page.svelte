<script lang="ts">
  import { resolve } from "$app/paths";
  import Block from "$lib/components/Block.svelte";
  import Meta from "$lib/components/Meta.svelte";
  import SubTitle from "$lib/components/SubTitle.svelte";
  import Title from "$lib/components/Title.svelte";
</script>

<Meta
  title="Guidelines"
  description={[
    "Distopiaのサーバーガイドラインです。",
    "サービス利用前に一度ご確認ください。",
  ].join("")}
/>

<Block>
  <Title content="ガイドライン一覧" />
  <div>
    <SubTitle content="利用規約" />
    <div>
      <p><a href={resolve("/terms")}>https://distopia.top/terms</a></p>
    </div>
  </div>
  <div>
    <SubTitle content="プライバシーポリシー" />
    <div>
      <p><a href={resolve("/privacy")}>https://distopia.top/privacy</a></p>
    </div>
  </div>
</Block>
