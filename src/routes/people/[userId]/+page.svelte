<script lang="ts">
	import { DangerousPeople } from "$lib/dangerousPeople.js";
	import { date2Txt } from "$lib/date.js";
	import Footer from "$lib/footer.svelte";
	import Meta from "$lib/meta.svelte";

	const { data } = $props();
	const { userId, user, tags, score, subAccounts } = data;
	const title = user ? `「${user.name}」は危険人物です。` : `「${userId}」は登録されていません`;
</script>

<Meta
	title={title}
	description={[
		`「${userId}」の検索結果を表示します。`,
		"他にも色々なユーザーが登録されていますで是非一度検索してみてください",
	].join("")}
/>

<main>
	<div class="contents">
		<div class="context">
			{#if user}
				<div class="profile">
					<p class="title">通称: {user.name}</p>
					<p class="sub-title">ID: {user.userId}</p>
				</div>
				<div>
					<p class="sub-title">タグ</p>
					<div class="tags">
						{#each tags as tag}
							<div class="tag">
								<p class="content">{tag}</p>
							</div>
						{/each}
					</div>
				</div>
				<div>
					<p class="sub-title">危険指数: {DangerousPeople.strArrToScore(score)}</p>
					<table>
						<thead>
							<tr>
								<th><p>加点</p></th>
								<th><p>該当項目</p></th>
							</tr>
						</thead>
						<tbody>
							{#each score as element}
								<tr>
									<th><p>{DangerousPeople.strToScore(element)}</p></th>
									<td><p>{DangerousPeople.propertyToContent(element)}</p></td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<div class="info">
					{#if subAccounts.length}
						<p>サブ垢: {subAccounts.join(", ")}</p>
					{/if}
					<p>理由: {user.title}</p>
					<p>識別タイプ: {user.type}</p>
					<p>登録日時: {date2Txt(user.time)}</p>
				</div>
				<div>
					<p class="sub-title">説明</p>
					<pre><p>{user.description}</p></pre>
				</div>
			{:else}
				<p class="title center">見つかりませんでした。</p>
			{/if}
		</div>
	</div>
</main>
<Footer></Footer>

<style>
	main {
		min-height: 90vh;
	}
	.context {
		overflow: hidden;
		margin: 15px 20px;
	}
	.contents {
		overflow: hidden;
		display: block;
		background-color: rgb(37, 36, 41);
		border-radius: 10px;
		width: 90%;
		margin: 20px auto;
	}
	.title {
		font-size: 26px;
	}
	.sub-title {
		font-size: 20px;
	}
	.center {
		text-align: center;
	}
	.context>div {
		margin-top: 18px;
	}
	.tags {
		margin: 0;
		width: 100%;
	}
	.tag {
		border-radius: 25px;
		background-color: rgb(66, 66, 66);
		display: inline-block;
		margin-right: 10px;
		margin-bottom: 6px;
	}
	.tag p {
		display: inline-block;
		color: white;
	}
	.tag .content {
		margin: 3px 5px;
	}

	p {
		color: white;
	}
</style>
