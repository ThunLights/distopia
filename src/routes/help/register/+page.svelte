<script lang="ts">
	import Meta from "$lib/components/meta.svelte";
	import Footer from "$lib/components/footer.svelte";

	const botInviteLink =
		"https://discord.com/oauth2/authorize?client_id=1300797373374529557&permissions=8&integration_type=0&scope=bot+applications.commands";
</script>

<Meta title="サーバー登録方法 / Distopia" />

<main>
	<div class="contents">
		<div class="context">
			<p class="title">サーバー登録方法</p>
			<div>
				<p class="sub-title">ボットをサーバーに入れる</p>
				<div>
					<p>まず以下のリンクからサーバーにボットを導入してください</p>
					<p>
						<a target="_blank" rel="noopener noreferrer" href={botInviteLink}>{botInviteLink}</a>
					</p>
					<p>ボットの権限はデフォルトで管理者になっていますがお好みで大丈夫です。</p>
					<p>※権限によっては正確にアクティブレートを算出できない可能性があります。</p>
				</div>
			</div>
			<div>
				<p class="sub-title">仮登録をする</p>
				<div>
					<p>
						サーバーにボットを追加したら「/web register」というコマンドを打って仮登録をしましょう
					</p>
					<img src="/help/tmp.webp" alt="" />
				</div>
			</div>
			<div>
				<p class="sub-title">正式登録をする</p>
				<div>
					<p>仮登録が済んだら次は正式登録です。</p>
					<p class="sub-sub-title">Distopiaにアクセスしてログイン</p>
					<img src="/help/home.webp" alt="" />

					<p class="sub-sub-title">
						アカウントページに行って登録可能サーバーで対象サーバーをクリックしよう
					</p>
					<img src="/help/server.webp" alt="" />

					<p class="sub-sub-title">
						最後に必要事項を入力してサーバーを公開ボタンを押せば完了です。
					</p>
					<img src="/help/register.webp" alt="" />
				</div>
			</div>
		</div>
	</div>
</main>
<Footer />

<style>
	.context {
		overflow: hidden;
		margin: 10px 20px;
	}
	.contents {
		overflow: hidden;
		display: block;
		background-color: rgb(37, 36, 41);
		border-radius: 10px;
		width: 90%;
		margin: 20px auto;
	}
	p {
		font-size: 15px;
		text-decoration: none;
		color: white;
	}
	a {
		font-size: 15px;
		text-decoration: none;
		color: #6969d5 !important;
	}
	img {
		max-width: 90%;
		margin: 6px 0;
	}
	.title {
		font-size: 34px;
		font-weight: 800;
		margin-bottom: 10px;
	}
	.sub-title {
		font-size: 24px;
		font-weight: 600;
		margin: 12px 0;
	}
	.sub-sub-title {
		font-size: 18px;
		margin: 10px 0;
	}
	.title,
	.sub-title,
	.sub-sub-title {
		padding-bottom: 3px;
		border-bottom: 1px solid gray;
	}
</style>
