<script lang="ts">
	import Meta from "$lib/components/meta.svelte";
	import Footer from "$lib/components/footer.svelte";

	import { date2Txt } from "$lib/date";
	import { redirectUrl } from "$lib/redirect.svelte";

	const { data } = $props();
	const { elements } = data;

	let searchWord = $state(data.searchWord);

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

<Meta />

<main>
	<div class="contents">
		<div class="context">
			<div class="info">
				<div>
					<input
						class="search-input"
						type="text"
						spellcheck="false"
						autocomplete="off"
						onkeyup={inputSearchCommand}
						bind:value={searchWord}
					/>
					<button onclick={search}>検索</button>
				</div>
				<div class="count">
					<p>{elements.length}件のサーバーがヒット</p>
				</div>
			</div>
		</div>
	</div>
	<div class="peoples">
		{#each elements as people (people)}
			<div class="people contents">
				<div class="context">
					<div class="profile">
						<p>通称: {people.name}</p>
						<p>ID: {people.userId}</p>
					</div>
					<div class="info">
						<p>理由: {people.title}</p>
						<p>識別タイプ: {people.type}</p>
						<p>危険度: {people.score ?? 0}</p>
						<p>タグ: {people.tags ? people.tags.join(", ") : "タグなし"}</p>
						<p>登録日時: {date2Txt(people.time)}</p>
					</div>
					<div>
						<button onclick={redirectUrl(`/people/${people.userId}`)}>詳細を閲覧</button>
					</div>
				</div>
			</div>
		{/each}
	</div>
</main>
<Footer></Footer>

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
	.context > div {
		margin: 10px 0;
	}
	.profile p {
		font-weight: 600;
	}
	.peoples {
		display: grid;
		grid-template-columns: 32% 32% 32%;
		grid-template-rows: auto auto auto auto auto auto auto auto auto auto auto;
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
