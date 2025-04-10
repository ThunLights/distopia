<script lang="ts">
	import Meta from "$lib/components/meta.svelte";
	import Footer from "$lib/components/footer.svelte";
</script>

<Meta
	title="Other Links / Distopia.top"
	description={["Distopiaの色々なリンクをまとめてあります。", "気軽にご覧ください。"].join("")}
/>

<main>
	<div class="contents">
		<div class="context">
			<p class="title">Others</p>
			<div>
				<p class="sub-title">ガイドライン</p>
				<a href="/guidelines">https://distopia.top/guidelines</a>
			</div>
			<div>
				<p class="sub-title">支援団体</p>
				<a href="/supporters">https://distopia.top/supporters</a>
			</div>
			<div>
				<p class="sub-title">Distopiaについて</p>
				<a href="/about">https://distopia.top/about</a>
			</div>
			<div>
				<p class="sub-title">スタッフ一覧</p>
				<a href="/staff">https://distopia.top/staff</a>
			</div>
		</div>
	</div>
</main>
<Footer />

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
