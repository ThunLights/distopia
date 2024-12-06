<script lang="ts">
	import Meta from "$lib/meta.svelte";
	import Footer from "$lib/footer.svelte";
</script>

<Meta title="アクティブレートって何? / Distopia"/>

<main>
	<div class="contents">
		<div class="context">
			<p class="title">アクティブレートについて</p>
			<div>
				<p class="sub-title">数値の良し悪し</p>
				<div>
					<p>基本的に数値が高いほうがアクティブと言う事になります。</p>
				</div>
			</div>
			<div>
				<p class="sub-title">どうやって算出しているの？</p>
				<div>
					<p>チャットやVCの活発度、メンバーのオンライン比率、新規メンバーの数などを元に独自のアルゴリズムで算出しています。</p>
					<p>悪用される可能性があるのでで現状アルゴリズムを公開する気はありません。</p>
				</div>
			</div>
			<div>
				<p class="sub-title">特典</p>
				<div>
					<p>アクティブレートに応じて枠がサーバーアイコンの周りに付くようになります。</p>
					<p class="sub-sub-title">1位</p>
					<img src="/help/1.webp" alt="">

					<p class="sub-sub-title">2位</p>
					<img src="/help/2.webp" alt="">

					<p class="sub-sub-title">3位</p>
					<img src="/help/3.webp" alt="">

					<p class="sub-sub-title">4～10位</p>
					<img src="/help/10.webp" alt="">

					<p class="sub-sub-title">11～30位</p>
					<img src="/help/30.webp" alt="">

					<p class="sub-sub-title">31～50位</p>
					<img src="/help/50.webp" alt="">

					<p>※50位より下には枠は付きません</p>
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
