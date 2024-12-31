<script lang="ts">
	import Meta from "$lib/meta.svelte";
	import Footer from "$lib/footer.svelte";
</script>

<Meta
	title="Guidelines / Distopia"
	description={[
		"Distopiaのサーバーガイドラインです。",
		"サービス利用前に一度ご確認ください。",
	].join("")}
/>

<main>
	<div class="contents">
		<div class="context">
			<p class="title">ガイドライン一覧</p>
			<div>
				<p class="sub-title">利用規約</p>
				<div>
					<p><a href="/license">https://distopia.top/license</a></p>
				</div>
			</div>
			<div>
				<p class="sub-title">プライバシーポリシー</p>
				<div>
					<p><a href="/privacy">https://distopia.top/privacy</a></p>
				</div>
			</div>
		</div>
	</div>
</main>
<Footer/>

<style>
	main {
		min-height: 90vh;
	}
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
	.title,
	.sub-title {
		padding-bottom: 3px;
		border-bottom: 1px solid gray;
	}
</style>
