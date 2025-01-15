<script lang="ts">
	import Tags from "$lib/tags.svelte";
	import Meta from "$lib/meta.svelte";
	import Footer from "$lib/footer.svelte";

	import { onMount } from "svelte";
	import { CHARACTER_LIMIT, TAG_COUNT_LIMIT } from "$lib/constants";
	import { toast } from "@zerodevx/svelte-toast";

    const { data } = $props();
    let loginData = $state(data.auth);

	let description = $state("");
	let agreement = $state(false);
	let nsfw = $state(false);
	let tags = $state<string[]>([]);
	let descriptionLength = $derived(description.length);
	let disabled = $derived(!agreement);

    onMount(async () => {
        if (!loginData) {
            return location.href = "/";
        }
    });

	async function register() {
		if (!loginData) {
			toast.push("認証情報エラー", {
				theme: {
				  "--toastColor": "mintcream",
				  "--toastBackground": "rgb(168, 13, 13)",
				  "--toastBarBackground": "#2F855A"
				}
			});
			return;
		}
		const response = await fetch("/api/friend", {
			method: "POST",
			headers: {
				Authorization: loginData.token,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				description, nsfw, tags
			}),
		});
		if (response.ok) {
			toast.push("作成完了", {
				theme: {
				  "--toastColor": "mintcream",
				  "--toastBackground": "rgba(72,187,120,0.9)",
				  "--toastBarBackground": "#2F855A"
				}
			});
		} else {
			toast.push("エラー", {
				theme: {
				  "--toastColor": "mintcream",
				  "--toastBackground": "rgb(168, 13, 13)",
				  "--toastBarBackground": "#2F855A"
				}
			});
		}
		location.href = "/account";
	}
</script>

<Meta
	title="フレンド募集を投稿する / Distopia.top"
/>

<main>
	<div class="contents">
		<div class="context">
			<div>
				<p class="title">フレンド募集を投稿</p>
			</div>
			<div>
				<p class="title">タグ <small>(Enterで確定・{CHARACTER_LIMIT.tag}文字制限・{TAG_COUNT_LIMIT}個まで)</small></p>
				<Tags tags={tags} tagsUpdate={(newTags) => { tags = newTags }}></Tags>
			</div>
			<div>
				<p class="title"><small class="indispensable">*</small>自己紹介 <strong style={`color: ${descriptionLength > CHARACTER_LIMIT.description ? "red" : "green" };`}>({descriptionLength} / {CHARACTER_LIMIT.description})</strong></p>
				<textarea bind:value={description}></textarea>
			</div>
			<div>
				<p class="name"><input type="checkbox" bind:checked={nsfw}>NSFW</p>
			</div>
			<div>
				<p class="name"><input type="checkbox" bind:checked={agreement}>本サービス規約に同意する。</p>
			</div>
			<div>
				<button class="send-button {disabled ? "" : "button"}" style={disabled ? "" : "cursor: pointer;"} disabled={disabled} onclick={register}>フレンド募集を投稿する</button>
			</div>
		</div>
	</div>
</main>
<Footer/>

<style>
	input[type="checkbox"] {
		margin-right: 3px;
	}
	textarea {
		resize: none;
		width: 95%;
		height: 30vh;
	}
	main {
		min-height: 90vh;
	}
	.title {
		font-weight: 700;
		font-size: 18px;
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
	.context>div {
		margin: 10px 0;
	}
	.send-button {
		margin-top: 15px;
		font-size: 15px;
		font-weight: 800;
		text-align: center;
		padding: 10px;
		width: 100%;
        color: gray;
        background-color: rgb(59, 59, 59);
        border: 1px solid rgb(85, 85, 85);
	}
	.button {
        color: rgb(68, 206, 237);
		cursor: pointer;
	}
	.button:active {
        border: 1px solid rgb(49, 49, 49);
        background-color: rgb(85, 85, 85);
    }

	p {
		color: white;
	}
</style>
