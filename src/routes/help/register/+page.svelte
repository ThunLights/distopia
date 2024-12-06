<script lang="ts">
	import "../style.css";
	import Meta from "$lib/meta.svelte";
	import Footer from "$lib/footer.svelte";

	const botInviteLink = "https://discord.com/oauth2/authorize?client_id=1300797373374529557&permissions=8&integration_type=0&scope=bot+applications.commands";
</script>

<Meta title="サーバー登録方法 / Distopia"/>

<main>
	<div class="contents">
		<div class="context">
			<p class="title">サーバー登録方法</p>
			<div>
				<p class="sub-title">ボットをサーバーに入れる</p>
				<div>
					<p>まず以下のリンクからサーバーにボットを導入してください</p>
					<p><a target="_blank" rel="noopener noreferrer" href={botInviteLink}>{botInviteLink}</a></p>
					<p>ボットの権限はデフォルトで管理者になっていますがお好みで大丈夫です。</p>
					<p>※権限によっては正確にアクティブレートを算出できない可能性があります。</p>
				</div>
			</div>
			<div>
				<p class="sub-title">仮登録をする</p>
				<div>
					<p>サーバーにボットを追加したら「/web register」というコマンドを打って仮登録をしましょう</p>
					<img src="/help/tmp.webp" alt="">
				</div>
			</div>
			<div>
				<p class="sub-title">正式登録をする</p>
				<div>
					<p>仮登録が済んだら次は正式登録です。</p>
					<p class="sub-sub-title">Distopiaにアクセスしてログイン</p>
					<img src="/help/home.webp" alt="">

					<p class="sub-sub-title">アカウントページに行って登録可能サーバーで対象サーバーをクリックしよう</p>
					<img src="/help/server.webp" alt="">

					<p class="sub-sub-title">最後に必要事項を入力してサーバーを公開ボタンを押せば完了です。</p>
					<img src="/help/register.webp" alt="">
				</div>
			</div>
		</div>
	</div>
</main>
<Footer/>
