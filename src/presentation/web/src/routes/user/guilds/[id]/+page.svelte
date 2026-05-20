<script lang="ts">
  import Block from "$lib/components/Block.svelte";
  import LinkButton from "$lib/components/Button/LinkButton.svelte";
  import Profile from "$lib/components/Guild/Profile.svelte";
  import Meta from "$lib/components/Meta.svelte";
  import SubTitle from "$lib/components/SubTitle.svelte";

  const { data } = $props();
  const { guildId, meta, guild, record } = $derived(data);
  const title = $derived(meta.name);
</script>

<Meta {title} />

<Profile
  guild={{
    id: meta.id,
    name: meta.name,
    avatarUrl: meta.avatarUrl ?? undefined,
  }}
/>
<Block>
  <SubTitle content="公開情報" />
  <div>
    {#if guild}
      <p>公開設定: {guild.public ? "公開" : "非公開"}</p>
      <p>年齢設定: {guild.nsfw ? "NSFW" : "全年齢"}</p>
      <p>招待リンク: {guild.invite}</p>
      <p>タグ: {guild.tags.join(", ")}</p>
      <div>
        <h3>説明文</h3>
        <pre>{guild.description ?? "未登録"}</pre>
      </div>
      <div>
        <h3>操作</h3>
        <LinkButton label="サーバーページを見る" link={`/guilds/${guildId}`} rel="internal" />
      </div>
    {:else}
      <p>見つかりませんでした。</p>
    {/if}
  </div>
</Block>
<Block>
  <SubTitle content="統計情報" />
  <div>
    {#if record}
      <p>Bumpカウンター: {record.bumpCounter ?? "未測定"}</p>
      <p>アクティブレート: {record.activeRate ?? "未測定"} (最高: {record.maxRate ?? "未測定"})</p>
      <p>
        順位 アクティブレート: {record.rateRank ?? "未測定"} (最高: {record.maxRateRank ??
          "未測定"})
      </p>
      <p>順位 レベル: {record.levelRank ?? "未測定"} (最高: {record.maxlevelRank ?? "未測定"})</p>
      <p>レベル: Lv.{record.level ?? 0} {record.point ?? 0}pt</p>
    {:else}
      <p>見つかりませんでした。</p>
    {/if}
  </div>
</Block>

<style>
  h3 {
    margin: 5px 0;
  }
</style>
