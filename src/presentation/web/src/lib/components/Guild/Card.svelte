<script lang="ts">
  import { resolve } from "$app/paths";
  import DiscordIcon from "$lib/assets/icon/discord.webp";
  import { joinGuild } from "$lib/client/join";
  import type { UserAuth } from "$lib/shared/types/UserAuth";
  import LinkButton from "../Button/LinkButton.svelte";
  import PrimaryButton from "../Button/PrimaryButton.svelte";
  import LinkTagsLayout from "../Layout/LinkTagsLayout.svelte";
  import Icon from "./Icon.svelte";

  type Props = {
    guildId: string;
    name: string;
    invite: string;
    description: string | null;
    tags: string[];
    boostCount: number;
    iconUrl: string | null;
    rank: number;
    user: UserAuth;
  };

  const { guildId, name, invite, description, tags, iconUrl, user, rank, boostCount }: Props =
    $props();

  async function join() {
    await joinGuild(guildId, name, invite, user !== undefined);
  }
</script>

<div class="guild">
  <div class="guild-context">
    <div>
      <div class="guild-info">
        <div>
          <Icon height={60} width={60} iconPath={iconUrl ?? DiscordIcon} {rank} />
        </div>
        <div>
          <p class="guild-name">{name}</p>
          <p>ブースト: {boostCount}</p>
        </div>
      </div>
      <div>
        {#if tags.length}
          <LinkTagsLayout
            tags={tags.map((label) => ({
              label,
              link: resolve(`/search?w=${decodeURIComponent(label)}`),
            }))}
          />
        {/if}
        {#if description}
          <p>説明</p>
          <pre>{description}</pre>
        {/if}
      </div>
    </div>
    <div class="btns">
      <LinkButton rel="internal" link={`/guilds/${guildId}`} label="詳細" />
      <div></div>
      <PrimaryButton onclick={join}>サーバーに参加</PrimaryButton>
    </div>
  </div>
</div>

<style>
  .btns {
    display: grid;
    grid-template-columns: 49% 2% 49%;
  }
  .guild-info p {
    font-size: 8px;
  }
  .guild-info p.guild-name {
    font-size: 16px;
    font-weight: 700;
  }
  .guild-info {
    display: grid;
    gap: 6px;
    grid-template-rows: 100%;
    grid-template-columns: auto 1fr;
  }
  .guild {
    overflow: hidden;
    border-radius: 30px;
    background-color: rgb(40, 40, 40);
    margin: 8px;
  }
  .guild-context > div {
    margin-bottom: 8px;
  }
  .guild-context {
    overflow: hidden;
    display: grid;
    grid-template-rows: 1fr auto;
    grid-template-columns: 100%;
    height: 95%;
    margin: 14px;
  }
  .guild-context {
    overflow: hidden;
    display: grid;
    grid-template-rows: 1fr auto;
    grid-template-columns: 100%;
    height: 95%;
    margin: 14px;
  }
  p,
  pre {
    color: white;
  }
</style>
