<script lang="ts">
    import Meta from "$lib/meta.svelte";
    import Footer from "$lib/footer.svelte";

    import { supporters } from "$lib/constants";
    import { DISCORD_INVITE_LINK } from "$lib/invite";

    let title = "Supporters";
</script>

<Meta
    title={title}
	description={[
		"サポートサーバーに関する説明です。",
		"支援団体等が記載されています。",
	].join("")}
/>

<main>
    <div class="contents">
        <div class="sections">
            <p class="title">現在の支援団体一覧</p>
            {#each supporters as supporter}
                <div class="guild">
                    <div>
                        <img class="icon" src="{supporter.icon}" alt="">
                    </div>
                    <div>
                        <p>{supporter.name}</p>
                        <p>
                            <a class="link" href="{supporter.invite}">{supporter.invite}</a>
                        </p>
                    </div>
                </div>
            {/each}
        </div>
    </div>
    <div class="contents">
        <div class="sections">
            <div class="section">
                <p class="title">支援団体って何をするの？</p>
                <div class="section-content">
                    <p>新しい機能の事前テストやデバッグなどへの協力</p>
                    <p>Distopiaの新バージョンリリース時にサーバーでの宣伝</p>
                    <p>新機能の提案や既存機能の改善案の提出</p>
                </div>
            </div>
            <div class="section">
                <p class="title">どうやったら支援団体になれるの？</p>
                <div class="section-content">
                    <p>サーバーのメンバー数などが比較的多く、アクティブに活動をされているサーバーが支援団体に入ることが出来ます。</p>
                    <p>応募サーバーがDistopiaの支援団体に適しているかどうかはDistopia運営が実際にサーバーに赴き判断させていただきます。</p>
                    <p>判断基準はサーバーメンバー数、アクティブ率、サーバーコンセプト、民度、などです。</p>
                    <p>支援団体になりたいサーバーがありましたら<a class="underline" href="{DISCORD_INVITE_LINK}">公式Discordサーバー</a>にて問い合わせお願いします。</p>
                </div>
            </div>
        </div>
    </div>
</main>
<Footer/>

<style>
    .underline {
        text-decoration: underline;
    }
    .guild .link {
        color: rgb(50, 50, 197);
    }
    .guild .icon {
        height: 50px;
        border-radius: 50%;
    }
    .guild {
        align-items: center;
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 10px;
        margin: 14px 0;
    }
    .contents {
        overflow: hidden;
        display: block;
        background-color: rgb(37, 36, 41);
        border-radius: 20px;
        width: 90%;
        margin: 20px auto;
    }
    .sections {
        width: 95%;
        margin: 0 auto;
    }
    .section-content p {
        margin: 8px 0;
    }
    .title {
        margin: 0 auto 0.2rem auto;
        position: relative;
        padding: 1rem 0 0.6rem 0;
        border-bottom: 5px solid;
        color: #acacac;
        font-size: 26px;
        font-weight: bold;
    }
    .title:before {
        position: absolute;
        bottom: -0.6rem;
        left: 0rem;
        right: 0rem;
        border-bottom: 1px solid;
        content: "";
    }
    p, a {
        text-decoration: none;
        color: rgb(188, 188, 188);
    }
</style>
