<script lang="ts">
	import Meta from "$lib/meta.svelte";
	import Footer from "$lib/footer.svelte";
</script>

<Meta title="Help / Distopia"/>

<main>
	<div class="contents">
		<div class="context">
			<p class="title">目次</p>
			<div>
				<p class="sub-title">【期間限定】コマンドのみでサーバー登録</p>
				<div>
					<p><a href="/help/register/special">https://distopia.top/help/register/special</a></p>
				</div>
			</div>
			<div>
				<p class="sub-title">サーバーを登録する</p>
				<div>
					<p><a href="/help/register">https://distopia.top/help/register</a></p>
				</div>
			</div>
			<div>
				<p class="sub-title">アクティブレートとは</p>
				<div>
					<p><a href="/help/rate">https://distopia.top/help/rate</a></p>
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
