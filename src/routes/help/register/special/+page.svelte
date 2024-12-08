<script lang="ts">
	import Meta from "$lib/meta.svelte";
	import Footer from "$lib/footer.svelte";

	const botInviteLink = "https://discord.com/oauth2/authorize?client_id=1300797373374529557&permissions=8&integration_type=0&scope=bot+applications.commands";
</script>

<Meta title="コマンドのみでサーバー登録方法"/>

<main>
	<div class="contents">
		<div class="context">
			<p class="title">【期間限定】コマンドのみでサーバー登録方法</p>
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
				<p class="sub-title">registerコマンドを打つ</p>
				<div>
					<p class="sub-sub-title">サーバーにボットを追加したら「/register」というコマンドを打って登録を開始しましょう</p>
					<img src="/help/special/register.webp" alt="">

					<p class="sub-sub-title">カテゴリ選択は自由にしてください</p>
					<img src="/help/special/category.webp" alt="">

					<p class="sub-sub-title">その次はサーバー説明です。最大250文字です。ここでサーバーアピールをしてください</p>
					<img src="/help/special/modal.webp" alt="">

					<p>右下の送信ボタンを押した後にURLが帰ってきたら成功です。</p>
					<p>※タグやNSFWの設定はウェブページからじゃないと出来ません。</p>
				</div>
			</div>
		</div>
	</div>
</main>
<Footer/>

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
