<script lang="ts">
  import Block from "$lib/components/Block.svelte";
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

<Block>
  <Privacy />
</Block>
