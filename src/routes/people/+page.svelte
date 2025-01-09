<script lang="ts">
	import Footer from '$lib/footer.svelte';

	const { data } = $props();
	const { peoples, count } = data;

	function date2Txt(date: Date) {
		return `${date.getFullYear()}-${date.getMonth()}-${date.getDay()}`;
	}
</script>

<main>
	<div class="contents">
		<div class="context">
			<div>
				<div>
					<p>ID検索</p>
					<button>検索</button>
				</div>
				<div></div>
			</div>
			<div>
				<p>現在{count}個のユーザーが登録済み</p>
			</div>
			<div>
				<p>最近登録されたユーザー</p>
				{#each peoples as people}
					<div class="people">
						<div class="profile">
							<p>通称: {people.name}</p>
							<p>ID: {people.userId}</p>
						</div>
						<div class="info">
							<p>識別タイプ: {people.type}</p>
							<p>危険度: {people.score}</p>
							<p>登録日時: {date2Txt(people.time)}</p>
						</div>
						<div>
							<p class="sub-title">主な要素</p>
							<p>{people.title}</p>
							<p class="sub-title">詳細</p>
							<pre>{people.description}</pre>
						</div>
					</div>
				{/each}
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

	main {
		min-height: 90vh;
	}
	p {
		color: white;
	}
</style>
