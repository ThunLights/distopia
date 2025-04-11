<script lang="ts">
	import Meta from "$lib/components/meta.svelte";
	import Footer from "$lib/components/footer.svelte";

	import { DISCORD_INVITE_LINK } from "$lib/constants";
</script>

<Meta
	title="プライバシーポリシー"
	description={[
		"Distopiaのプライバシーポリシーです。",
		"サービス利用時に一度ご確認ください。"
	].join("")}
/>

<main>
	<div class="contents">
		<div class="context">
			<h1>プライバシーポリシー</h1>

			<h1>第1条 個人情報</h1>
			<p>
				「個人情報」とは，個人情報保護法にいう「個人情報」を指すものとし，生存する個人に関する情報であって，当該情報に含まれる氏名，生年月日，住所，電話番号，連絡先その他の記述等により特定の個人を識別できる情報及び容貌，指紋，声紋にかかるデータ，及び健康保険証の保険者番号などの当該情報単体から特定の個人を識別できる情報（個人識別情報）を指します。
			</p>

			<h1>第2条 広告等について</h1>
			<p>
				今後、Google
				Adsence等の広告掲示サービスを使うかもしれませんが、個人情報等の収集はしていません
			</p>
			<p>
				広告等もGoogle社のアクセス情報を元に適切な広告が掲示されています。詳しくはGoogle社のホームページをご覧ください
			</p>

			<h1>第3条 登録サーバーの削除</h1>
			<p>
				登録サーバー等の削除依頼に関しては、Distopiaの<a href={DISCORD_INVITE_LINK}>公式Discord</a
				>にて応じるものとします。
			</p>

			<h1>第4条 プライバシーポリシーの変更</h1>
			<p>
				本ポリシーの内容は，法令その他本ポリシーに別段の定めのある事項を除いて，ユーザーに通知することなく，変更することができるものとします。
			</p>
			<p>
				本サイトが別途定める場合を除いて，変更後のプライバシーポリシーは，本ウェブサイトに掲載したときから効力を生じるものとします。
			</p>
		</div>
	</div>
</main>
<Footer />

<style>
	main {
		min-height: 90vh;
	}
	p,
	h1 {
		color: white;
	}
	a {
		color: rgb(88, 212, 228);
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
</style>
