<script lang="ts">
    import { onMount } from "svelte";

    import { getGuilds, getPublicGuilds } from "$lib/guilds.svelte";
    import { logout } from "$lib/token.svelte";
    import { redirectUrl } from "$lib/redirect.svelte";

    import Meta from "$lib/meta.svelte";
    import Header from "$lib/header.svelte";
    import Footer from "$lib/footer.svelte";

    import type { GuildsUser } from "$lib/server/discord";
	import type { SuccessResponse } from "$routes/api/guilds/public/+server";
    import type { PageData } from "./$types";

    type Guilds = GuildsUser & { joinBot: boolean, tmp: boolean };

    const { data }: { data: PageData } = $props();
    const loginData = $state(data.auth);
    let loading = $state(true);
    let guilds = $state<Guilds[]>([]);
    let publicGuilds = $state<SuccessResponse[]>([]);
    let guildsCount = $derived(guilds.filter(guild => guild.owner && !publicGuilds.map(value => value.guildId).includes(guild.id)).length);
    let publicGuildsCount = $derived(publicGuilds.length);
    let title = $state("ログインしてください");

    onMount(async () => {
        if (!loginData) {
            return location.href = "/";
        }
        const servers = await getGuilds(loginData.token);
        const publicServers = await getPublicGuilds(loginData.token);
        if (Array.isArray(servers)) {
            guilds = servers;
        }
        if (Array.isArray(publicServers)) {
            publicGuilds = publicServers;
        }
        loading = false;
        title = `「${loginData.username}」の詳細情報`
    })
</script>

<Meta
    title={title}
/>

<Header userData={loginData}/>
<main>
    <div class="main-div">
        {#if loginData}
            <div class="profile">
                <div class="profile-contents">
                    {#if loginData.avatar}
                        <div class="profile-content">
                            <img class="icon" src="https://cdn.discordapp.com/avatars/{loginData.id}/{loginData.avatar}.webp" alt="">
                        </div>
                    {/if}
                    <div class="profile-content">
                        <p class="profile-title">「 {loginData.username} 」でログイン中</p>
                        <p>ID: {loginData.id}</p>
                        <p>登録サーバー: {publicGuildsCount}</p>
                        <p>登録可能サーバー: {guildsCount}</p>
                    </div>
                </div>
            </div>
            <div class="contents">
                <div>
                    <p class="title">アカウント操作</p>
                    <div>
                        <button class="account-operation-btn" onclick={redirectUrl("/account/settings")}>アカウント設定</button>
                        <button class="account-operation-btn" onclick={logout}>ログアウト</button>
                    </div>
                </div>
            </div>
            <div class="contents">
                <div>
                    <p class="title">ランキング掲載サーバー</p>
                    <p class="not-found">ランキング上位のサーバーはありません</p>
                </div>
            </div>
            <div class="contents">
                <div>
                    <p class="title">登録済みイベント</p>
                    <p class="not-found">登録済みイベントはありません</p>
                </div>
            </div>
            <div class="contents">
                <div>
                    <p class="title">登録済みサーバー</p>
                    {#if publicGuilds.length}
                        <div class="guilds">
                            {#each publicGuilds as guild}
								{@render generatePublicGuild(guild)}
                            {/each}
                        </div>
                    {:else}
                        <p class="not-found">現在登録されているサーバーはありません</p>
                    {/if}
                </div>
            </div>
            <div class="contents">
                <div>
                    <p class="title">登録可能サーバー <small>*更新には数分かかる可能性がございます。</small></p>
                    {#if guilds.length}
                        <div class="guilds">
                            {#each guilds.filter(value => value.owner && !publicGuilds.map(value => value.guildId).includes(value.id)) as guild}
								{@render generateGuild(guild, guild.joinBot, guild.tmp)}
                            {/each}
                        </div>
                    {:else}
                        <p class="not-found">登録可能サーバーがありません</p>
                    {/if}
                </div>
            </div>
        {:else if !loading}
            <div class="contents">
                <p>上手くデータが読み込まれませんでした</p>
                <p>再ロードしてください</p>
            </div>
        {/if}
    </div>
</main>
<Footer/>

{#snippet generatePublicGuild(guild: SuccessResponse)}
    <div class="guild">
        <div>
			<a href="/account/guild/{guild.guildId}">
				<img class="icon" src="{guild.icon ? `https://cdn.discordapp.com/icons/${guild.guildId}/${guild.icon}.webp` : "/discord.webp"}" alt="">
			</a>
        </div>
        <div>
            <p class="name"><a href="/account/guild/{guild.guildId}">{guild.name}</a></p>
            <div class="informations">
                <p>ID: {guild.guildId}</p>
                <p>ユーザー数: {guild.members ?? "測定不可"} (アクティブ: {guild.online ?? "測定不可"})</p>
				<div>
					<p class="inline-block">ランキング: 未実装</p>
					<p class="inline-block">イベント: 未実装</p>
				</div>
            </div>
        </div>
    </div>
{/snippet}

{#snippet generateGuild(guild: GuildsUser, joinBot?: boolean, tmp?: boolean)}
    <div class="guild">
        <div>
			<a href="/account/guild/{guild.id}/new">
				<img class="icon" src="{guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp` : "/discord.webp"}" alt="">
			</a>
        </div>
        <div>
            <p class="name"><a href="/account/guild/{guild.id}/new">{guild.name}</a></p>
            <div class="informations">
                <p>ID: {guild.id}</p>
                <p>ユーザー数: {guild.approximate_member_count} (アクティブ: {guild.approximate_presence_count})</p>
                <div>
                    {#if joinBot !== undefined}
                        <p class="inline-block" style={`color: ${joinBot ? "green" : "red"};`}>{joinBot ? "ボット導入済み" : "ボット未導入"}</p>
                    {/if}
                    {#if tmp !== undefined}
                        <p class="inline-block" style={`color: ${tmp ? "green" : "red"};`}>{tmp ? "仮登録済み" : "仮登録なし"}</p>
                    {/if}
                </div>
            </div>
        </div>
    </div>
{/snippet}

<style>
    .account-operation-btn {
        cursor: pointer;
        border-radius: 25px;
        color: white;
        background-color: rgb(49, 49, 49);
        opacity: 0.8;
        padding: 3px 6px;
        border: 1px solid rgb(85, 85, 85);
    }
    .account-operation-btn:active {
        border: 1px solid rgb(49, 49, 49);
        background-color: rgb(85, 85, 85);
    }
    .guilds {
        width: 95%;
        margin: 20px auto;
    }
    .guild>div {
        display: inline-block;
    }
    .guild {
        margin-top: 10px;
    }
    .guild .icon {
        height: 64px;
        border-radius: 50%;
    }
    .guild .name {
        font-size: 14px;
    }
    .guild .informations p {
        font-size: 8px;
    }
    .profile-contents {
        margin: 25px 10px;
    }
    .profile-content {
        display: inline-block;
        margin-right: 12px;
    }
    .profile-title {
        font-size: 18px;
        margin-bottom: 5px;
    }
    .profile {
        overflow: hidden;
        background-color: rgb(40, 40, 40)
    }
    .profile .icon {
        border-radius: 50%;
    }
    .contents .not-found {
        font-size: 15px;
    }
    .contents .title {
        font-size: 20px;
        padding: 5px 3px;
        border-bottom: solid 1px gray;
        margin-bottom: 10px;
    }
    .contents {
        overflow: hidden;
        display: block;
        background-color: rgb(37, 36, 41);
        border-radius: 10px;
        width: 90%;
        margin: 20px auto;
    }
    .contents>div {
        padding: 5px 10px;
    }
    .inline-block {
        display: inline-block;
    }
    .main-div {
        min-height: 90vh;
    }
	a, p {
		text-decoration: none;
        color: white;
    }
</style>
