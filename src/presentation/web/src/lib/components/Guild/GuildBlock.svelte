<script lang="ts">
  import { resolve } from "$app/paths";
  import DiscordIcon from "$lib/assets/icon/discord.webp";
  import Block from "$lib/components/Block.svelte";
  import type { UserAuth } from "$lib/shared/types/UserAuth";
  import BlockTitle from "./BlockTitle.svelte";
  import Icon from "./Icon.svelte";
  import JoinButton from "./JoinButton.svelte";

  type Props = {
    guildId: string;
    name: string;
    nsfw: boolean;
    boostCount: number;
    description: string | null;
    iconUrl?: string;
    tags: string[];
    activeRate?: number;
    activeRateRank?: number;
    level?: bigint;
    point?: bigint;
    levelRank?: number;
    maxActiveRateRank?: bigint;
    maxActiveRate?: bigint;
    maxLevelRank?: bigint;
    user: UserAuth | null;
    invite: string;
  };

  const {
    guildId,
    name,
    nsfw,
    boostCount,
    description,
    iconUrl,
    tags,
    activeRate,
    activeRateRank,
    level,
    point,
    levelRank,
    maxActiveRateRank,
    maxActiveRate,
    maxLevelRank,
    user,
    invite,
  }: Props = $props();
</script>

<Block>
  <div class="guild-info">
    <div>
      <Icon width={128} height={128} rank={activeRateRank} iconPath={iconUrl ?? DiscordIcon} />
    </div>
    <div>
      <p class="guild-name">
        {name}
        {#if nsfw}
          <small class="nsfw">NSFW!!</small>
        {/if}
      </p>
      <p>ブースト: {boostCount}</p>
    </div>
  </div>
  {#if tags.length}
    <div>
      <BlockTitle title="タグ一覧" />
      <div class="tags">
        {#each tags as tag (tag)}
          <a class="tag" href={resolve(`/search?content=${tag}`)}>
            <div class="content">
              <p>{tag}</p>
            </div>
          </a>
        {/each}
      </div>
    </div>
  {/if}
  {#if description}
    <div>
      <BlockTitle title="説明" />
      <div>
        <pre>{description}</pre>
      </div>
    </div>
  {/if}
  <div>
    <BlockTitle title="ランキング (アクティブレート)" />
    <div>
      <p>現在: {activeRateRank ?? "圏外"}</p>
      <p>最高: {maxActiveRateRank ?? "未測定"}</p>
    </div>
  </div>
  <div>
    <BlockTitle title="ランキング (レベル)" />
    <div>
      <p>現在: {levelRank ?? "圏外"}</p>
      <p>最高: {maxLevelRank ?? "未測定"}</p>
    </div>
  </div>
  <div>
    <BlockTitle title="詳細" />
    <div>
      <div>
        <p>{`Lv.${Number(level ?? 0n)} ${Number(point ?? 0n)}pt`}</p>
        <p>
          アクティブレート: {activeRate ?? 0} (最大: {maxActiveRate ?? "未測定"})
        </p>
      </div>
    </div>
  </div>
  <div>
    <JoinButton {name} {guildId} {user} {invite} />
  </div>
</Block>

<style>
  .nsfw {
    color: red;
  }
  .tags {
    margin-top: 7px;
    width: 100%;
  }
  .tag {
    border-radius: 25px;
    background-color: rgb(66, 66, 66);
    display: inline-block;
    margin-right: 10px;
  }
  .tag p {
    display: inline-block;
    color: white;
  }
  .tag .content {
    margin: 3px 5px;
  }
  .guild-name {
    font-size: 28px;
    font-weight: 700;
  }
  .guild-info > div {
    display: inline-block;
  }
  .guild-info {
    margin-top: 15px;
  }
  a,
  p,
  pre {
    font-size: 15px;
    text-decoration: none;
    color: white;
  }
  @media (max-width: 800px) {
    .guild-name {
      font-size: 22px;
    }
  }
</style>
