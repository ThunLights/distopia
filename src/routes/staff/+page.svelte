<script lang="ts">
	import Meta from "$lib/meta.svelte";
	import Footer from "$lib/footer.svelte";

	import { staffs } from "$lib/constants";
	import { DISCORD_INVITE_LINK } from "$lib/invite";

	let title = "スタッフ情報";
</script>

<Meta
	{title}
	description={[
		"Distopiaのスタッフ一覧です。",
		"このページに乗っている人以外はスタッフではありません。"
	].join("")}
/>

<main>
	<div class="contents">
		<div class="sections">
			<p class="title">現在のスタッフ一覧</p>
			{#each staffs as staff (staff)}
				<div class="staff">
					<div>
						<img class="icon" src={staff.icon} alt="" />
					</div>
					<div>
						<p class="section-title">{staff.name}</p>
						<p class="small">{staff.description}</p>
						<div>
							{#each staff.links as link (link)}
								<a class="link" href={link.url} target="_blank" rel="noopener noreferrer">
									<img src={link.icon} alt={link.url} />
								</a>
							{/each}
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
	<div class="contents">
		<div class="sections">
			<div class="section">
				<p class="title">どうやったらスタッフになれる?</p>
				<div class="section-content">
					<p>Distopia運営チームでは現在スタッフを募集しています。</p>
					<p>具体的にはイラストレーターとプログラマーを募集しています。</p>
					<p>イラストレーターはDistopiaのホームの絵やアイコンなどを書いてもらいます。</p>
					<p>
						サイトに載せる関係上、数回リテイクを要求することもありますが許容していただけると幸いです。
					</p>
					<p>プログラマーに関しては既存のコードの改善や新機能開発に携わってもらいます。</p>
					<p>
						DistopiaではSvelteKitやPrisma
						Clientなどを使っていますので、そのあたりの技術が出来ているとありがたいです。
					</p>
				</div>
			</div>
			<div class="section">
				<p class="title">応募方法</p>
				<div class="section-content">
					<p>
						応募は<a href={DISCORD_INVITE_LINK} class="underline">公式Discordサーバー</a
						>の問い合わせにて行っています。
					</p>
					<p>応募の際には具体的にどのようなスキルがあるかなどを提示していただければ幸いです。</p>
					<p>
						また運営に入る際にイラストレーターかプログラマーかそれ以外で入るかを選択し問い合わせ時に言っていただけるとありがたいです。
					</p>
				</div>
			</div>
		</div>
	</div>
</main>
<Footer />

<style>
	.underline {
		text-decoration: underline;
	}
	.small {
		font-size: 14px;
		font-weight: 500;
	}
	.staff .icon {
		height: 65px;
		border-radius: 50%;
	}
	.staff .link img {
		margin: 1px 3px;
		height: 25px;
		border-radius: 25%;
	}
	.staff {
		align-items: center;
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 10px;
		margin: 16px 0;
	}
	.contents {
		overflow: hidden;
		display: block;
		background-color: rgb(37, 36, 41);
		border-radius: 20px;
		width: 90%;
		margin: 30px auto;
	}
	.sections {
		width: 95%;
		margin: 0 auto;
	}
	.section-title {
		font-size: 20px;
		font-weight: 800;
	}
	.section-content p {
		margin: 10px 0;
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
	p,
	a {
		text-decoration: none;
		color: rgb(188, 188, 188);
	}
</style>
