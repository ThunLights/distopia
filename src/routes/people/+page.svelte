<script lang="ts">
	import Meta from "$lib/meta.svelte";
	import Footer from "$lib/components/footer.svelte";
	import { redirectUrl } from "$lib/redirect.svelte";
	import { date2Txt } from "$lib/date.js";

	const { data } = $props();
	const { peoples, count } = data;

	let searchWord = $state("");

	async function search() {
		location.href = `/people/search?content=${encodeURIComponent(searchWord)}`;
	}

	async function inputSearchCommand(e: KeyboardEvent) {
		if (e.key === "Enter") {
			e.preventDefault();
			await search();
		}
	}
</script>

<Meta title="危険人物検索システム" description={["危険人物を検索することが出来ます。"].join("")} />

<main>
	<div class="contents">
		<div class="context">
			<div>
				<p><label for="search">危険人物を検索する</label></p>
				<div>
					<input
						id="search"
						class="search-input"
						type="text"
						spellcheck="false"
						autocomplete="off"
						onkeyup={inputSearchCommand}
						bind:value={searchWord}
					/>
					<button onclick={search}>検索</button>
				</div>
				<div>
					<p><small>検索したい人物のIDや通称などを入れてください</small></p>
				</div>
			</div>
		</div>
	</div>
	<div class="contents">
		<div class="context">
			<p class="context-title">ステータス</p>
			<p>{count}人が登録済み</p>
		</div>
	</div>
	<div>
		<p class="title">最近登録されたユーザー</p>
		<div class="peoples">
			{#each peoples as people (people)}
				<div class="people">
					<div class="context">
						<div class="profile">
							<p>通称: {people.name}</p>
							<p>
								ID: {people.userId}
								{people.subAccounts.length ? `(サブ垢: ${people.subAccounts.join(", ")})` : ""}
							</p>
						</div>
						<div class="info">
							<p>理由: {people.title}</p>
							<p>識別タイプ: {people.type}</p>
							<p>危険度: {people.score}</p>
							<p>タグ: {people.tags.length ? people.tags.join(", ") : "未設定"}</p>
							<p>登録日時: {date2Txt(people.time)}</p>
						</div>
						<div>
							<button onclick={redirectUrl(`/people/${people.userId}`)}>詳細を閲覧</button>
						</div>
					</div>
				</div>
			{/each}
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
	.peoples {
		display: grid;
		grid-template-columns: 32% 32% 32%;
		grid-template-rows: auto auto auto auto auto auto auto auto auto auto auto;
	}
	.title {
		font-size: 24px;
	}
	.context-title {
		font-weight: 600;
		font-size: 20px;
	}
	.title {
		width: 90%;
		margin: 20px auto;
		margin-top: 16px;
		font-weight: 700;
	}
	.context > div {
		margin: 10px 0;
	}
	.profile p {
		font-weight: 600;
	}
	.people {
		overflow: hidden;
		margin: 5px 14px;
		background-color: rgb(37, 36, 41);
		border-radius: 10px;
	}
	.people > div button {
		width: 100%;
	}
	.search-input {
		width: 60%;
		font-size: 15px;
		border-radius: 25px;
		padding: 4px 8px;
	}

	main {
		min-height: 90vh;
	}
	p {
		color: white;
	}
	button {
		cursor: pointer;
		border-radius: 25px;
		color: white;
		background-color: rgb(49, 49, 49);
		opacity: 0.8;
		font-size: 14px;
		padding: 4px 8px;
		border: 1px solid rgb(85, 85, 85);
	}
	button:active {
		border: 1px solid rgb(49, 49, 49);
		background-color: rgb(85, 85, 85);
	}

	@media (max-width: 1100px) {
		.peoples {
			grid-template-columns: 48% 48%;
		}
	}
	@media (max-width: 800px) {
		.peoples {
			grid-template-columns: 98%;
		}
	}
</style>
