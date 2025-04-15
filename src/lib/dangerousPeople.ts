import { DangerousPeopleTypes } from "$lib/constants";

export type DPDBFormat = {
	userId: string;
	type: (typeof DangerousPeopleTypes)[number];
	name: string;
	title: string;
	description: string;
	time: Date;
	score: Array<Score>;
	subAccounts: string[];
	tags: string[];
}[];

export type Element = {
	id: string;
	score: number;
	label: string;
};

export type Elements = Array<Element>;

export type Score = keyof typeof DangerousPeople.table;

export class DangerousPeople {
	public static readonly table = {
		inappropriate: 5,
		disturber: 10,
		situationBreaker: 15,
		sexualHarassment: 20,
		spoofing: 25,
		madman: 30,
		personalInformation: 35,
		internetStalker: 40,
		criminal: 50,
		disturberNukeBot: 50,
		disturberSelfBot: 60,
		disturberStaff: 65,
		criminalStaff: 80
	};

	public static readonly displayContent = {
		inappropriate: "不適切行為",
		disturber: "荒らし",
		situationBreaker: "空気が読めない",
		sexualHarassment: "セクハラ",
		spoofing: "なりすまし",
		madman: "話が通じない",
		personalInformation: "個人情報晒し",
		internetStalker: "ネトスト",
		criminal: "犯罪者",
		disturberNukeBot: "荒らし(NukeBot)",
		disturberSelfBot: "荒らし(SelfBot)",
		disturberStaff: "荒らし(幹部)",
		criminalStaff: "犯罪者(幹部)"
	} satisfies Record<Score, string>;

	public static propertyToContent(content: string) {
		return this.displayContent[content as Score] ?? "その他";
	}

	public static elementsList(): Elements {
		return Object.entries(DangerousPeople.table).map(([id, score]) => {
			return {
				id,
				score,
				label: DangerousPeople.propertyToContent(id)
			};
		});
	}

	public static strToScore(content: string) {
		return DangerousPeople.table[content as Score] ?? 0;
	}

	public static strArrToScore(arr: string[]) {
		let result = 0;
		for (const word of arr) {
			result += this.strToScore(word);
		}
		return result;
	}
}

//上からの追加をお願いします。
export const DPDB: DPDBFormat = [
	{
		userId: "1185887801506541624",
		name: "Nika",
		type: "other",
		title: "脅し",
		description:
			"ネトスト(垢変えても追ってくる&過度な権限要求)\n\n話が通じない(過度な権限要求)\n\ndpkoにて幹部ロールがついているのを確認",
		time: new Date(1741910926499),
		subAccounts: ["1347104778827730994"],
		tags: ["幹部", "権限要求", "荒らし"],
		score: [
			"disturber",
			"disturberStaff",
			"inappropriate",
			"internetStalker",
			"madman",
			"situationBreaker"
		]
	},
	{
		userId: "1274315421817765911",
		name: "Rails",
		type: "madman",
		title: "荒らし",
		description: "他鯖を荒らしたことをスクショ付きで報告してました。\n",
		time: new Date(1741910309647),
		subAccounts: [],
		tags: ["荒らし"],
		score: [
			"disturber",
			"disturberNukeBot",
			"disturberSelfBot",
			"disturberStaff",
			"inappropriate",
			"internetStalker",
			"personalInformation"
		]
	},
	{
		userId: "1292200009319710763",
		name: "つっくん",
		type: "madman",
		title: "話が通じない・荒らし",
		description:
			"話が通じない。自分が絶対的だと思い込んでいる。話の流れに沿わない独り言やリンクの投下などやりたい放題。\n最近ChatGPTなどのツールを使いgithub pagesでDiscordのアカウント乗っ取りツールや、グループDMスパムなどを作成しているので、フレンド申請を通したり 、彼から送られてきたURLを開いてはいけない。",
		time: new Date(1741910180908),
		subAccounts: [
			"1339805899274846228",
			"1321609231459418183",
			"974635317715951666",
			"1300077068247236661",
			"1279849616808083611",
			"1308275755951722537",
			"978924798560333864",
			"1074934043197587536",
			"1057957733506220062",
			"997074888944779384",
			"1222793964579455048",
			"1119070046111662141",
			"1236512998370054145",
			"1333029688939118638"
		],
		tags: ["乗っ取り", "自己中", "荒らし"],
		score: [
			"criminal",
			"criminalStaff",
			"disturber",
			"disturberNukeBot",
			"disturberSelfBot",
			"disturberStaff",
			"inappropriate",
			"internetStalker",
			"madman",
			"personalInformation",
			"sexualHarassment",
			"situationBreaker",
			"spoofing"
		]
	},
	{
		userId: "1320998188550717451",
		name: "焼きプリン",
		type: "disturber",
		title: "なりすまし垢での荒らし",
		description: "なりすまし垢での荒らし",
		time: new Date(1739777320447),
		subAccounts: ["1340942892860178474", "1340927815352193037"],
		tags: ["なりすまし", "荒らし"],
		score: ["disturber", "disturberStaff", "internetStalker"]
	},
	{
		userId: "1329421408148656178",
		name: "cigarette",
		type: "criminal",
		title: "個人情報晒し 脅し",
		description: "個人情報晒し",
		time: new Date(1739700998209),
		subAccounts: [],
		tags: ["個人情報"],
		score: ["disturber", "internetStalker", "madman"]
	},
	{
		userId: "1305714025908277278",
		name: "そうすけ",
		type: "madman",
		title: "荒らし",
		description: "つっくんの身内\n荒らし",
		time: new Date(1739693359175),
		subAccounts: [],
		tags: ["つっくん", "荒らし"],
		score: ["disturber", "disturberNukeBot", "disturberSelfBot"]
	},
	{
		userId: "1219217064095387748",
		name: "Re (dpko)",
		type: "madman",
		title: "荒らし",
		description:
			"dpko鯖主\n\nspl3.inkというサイトを攻撃\n\nサブ垢(多分捨て垢)一覧\n\n1182677209522126850,\n932537552626397185,\n925586642440445983,\n940860491016855563,\n925971072774467664,\n1306905969925820418,\n925587665473110099,\n1151123836222328873,",
		time: new Date(1739521132043),
		subAccounts: [],
		tags: ["ddos", "dpko", "荒らし"],
		score: [
			"criminal",
			"criminalStaff",
			"disturber",
			"disturberNukeBot",
			"disturberSelfBot",
			"disturberStaff",
			"internetStalker",
			"madman"
		]
	},
	{
		userId: "267125244093923333",
		name: "Exat",
		type: "madman",
		title: "荒らし",
		description: "荒らし共栄圏での荒らしイベント上位者",
		time: new Date(1739518735496),
		subAccounts: [],
		tags: ["dpko", "荒らし"],
		score: ["disturber", "disturberNukeBot", "disturberSelfBot", "disturberStaff"]
	},
	{
		userId: "585805548390449163",
		name: "夜桜",
		type: "criminal",
		title: "薬物売買",
		description: "\n市販薬の薬物売買をしている\n犯罪への加担の過度な要求\n",
		time: new Date(1738654232267),
		subAccounts: [],
		tags: ["OD", "犯罪者", "薬物売買"],
		score: ["criminal", "madman"]
	},
	{
		userId: "1261883045921820732",
		name: "さらちゃ(旧:新規くん)",
		type: "criminal",
		title:
			"過度な権限要求、ネカマ、度々の暴言、VCの雰囲気を悪くするようなこと、間違ったメンションの使い方(連投)など",
		description:
			"過度な権限要求や、ネカマ行為、警告３(最終警告)がついた状態で、度々の暴言、ｖｃの雰囲気を悪くするようなこと、間違ったメンションの使い方などの報告が何度もあった。",
		time: new Date(1737731425064),
		subAccounts: [],
		tags: [],
		score: ["disturber", "madman", "sexualHarassment", "situationBreaker"]
	},
	{
		userId: "715141604486283275",
		name: "砂橋シロコ (Ntldr)",
		type: "criminal",
		title: "Nuke, DDoS, 内通, 権限付与",
		description:
			"NukeやMC鯖に対するDDoS, 集団荒らしの際、運営鯖の内通や荒らしに対する権限譲渡などをしている\n例：ららあーす (mc)",
		time: new Date(1737640468483),
		subAccounts: [],
		tags: [],
		score: ["criminalStaff", "disturberStaff"]
	},
	{
		userId: "986177897255546901",
		name: "きなこあげもち",
		type: "criminal",
		title: "荒らし, Grabber",
		description: "Grabberを他人に送ったり、鯖をNukeしたりしている",
		time: new Date(1737640174017),
		subAccounts: [],
		tags: [],
		score: ["criminal"]
	},
	{
		userId: "1193781317637242903",
		name: "りふらい",
		type: "criminal",
		title: "荒らし",
		description:
			"個人サーバーなどにNukeBotを導入するように勧める。\neveryoneなどを使って荒らしたりもする。",
		time: new Date(1737639916175),
		subAccounts: [],
		tags: [],
		score: ["madman", "situationBreaker"]
	},
	{
		userId: "859845230043201546",
		name: "ここあ",
		type: "criminal",
		title: "荒らし",
		description: "集団荒らしの際、Chのnukeなどを行っていた。",
		time: new Date(1737639787712),
		subAccounts: [],
		tags: [],
		score: ["disturber", "disturberNukeBot"]
	},
	{
		userId: "1155331881932439633",
		name: "みどねる",
		type: "criminal",
		title: "色々やってる",
		description: "違法ツールからCC切ったりなんでもやり放題の人。",
		time: new Date(1737635177404),
		subAccounts: [],
		tags: ["犯罪", "虚言"],
		score: [
			"criminal",
			"disturber",
			"disturberNukeBot",
			"disturberSelfBot",
			"disturberStaff",
			"internetStalker",
			"madman",
			"sexualHarassment",
			"situationBreaker"
		]
	},
	{
		userId: "1206048010740432906",
		name: "まめきち",
		type: "madman",
		title: "色々なコミュニティでの運営妨害",
		description: "TakasumiBOTなどのコミュニティでの運営妨害\nGbanによる脅し行為など",
		time: new Date(1737545645752),
		subAccounts: [],
		tags: ["ルール違反多数", "脅し"],
		score: ["situationBreaker"]
	},
	{
		userId: "705339989654765578",
		name: "みとうと",
		type: "disturber",
		title: "荒らし鯖の幹部",
		description: "荒らし鯖の幹部です。",
		time: new Date(1736953132514),
		subAccounts: [],
		tags: ["荒らし"],
		score: ["disturber", "disturberStaff"]
	},
	{
		userId: "1298217788439269397",
		name: "そら",
		type: "criminal",
		title: "執拗に人に喧嘩を売る",
		description:
			"複数コミュニティで普通に雑談しているだけの常連に突っかかるなどをして鯖の空気を悪くする\n",
		time: new Date(1736952893109),
		subAccounts: [],
		tags: ["喧嘩", "突っかかり行為", "論争"],
		score: ["madman"]
	},
	{
		userId: "924146206228250634",
		name: "うぱー",
		type: "criminal",
		title: "他人のクレジットカードを悪用しています。",
		description: "家宅捜索なども受けている本物の犯罪者です。",
		time: new Date(1736913068664),
		subAccounts: [],
		tags: ["不正クレジットカード", "犯罪者"],
		score: ["criminal"]
	},
	{
		userId: "1310124781999231006",
		name: "白上フブキ",
		type: "disturber",
		title: "荒らし",
		description: "荒らし鯖の運営です。",
		time: new Date(1736880806742),
		subAccounts: [],
		tags: ["荒らし"],
		score: ["disturberStaff"]
	},
	{
		userId: "1142048463966715905",
		name: "ももち",
		type: "disturber",
		title: "荒らし行為や煽り行為",
		description: "荒らしや粘着をした後DMなどでも執拗に煽り続ける",
		time: new Date(1736878341423),
		subAccounts: [],
		tags: ["個人情報拡散", "粘着", "荒らし"],
		score: ["internetStalker", "situationBreaker"]
	},
	{
		userId: "1323926917451354143",
		name: "ばーにす",
		type: "disturber",
		title: "荒らし",
		description: "荒らし鯖の運営です。",
		time: new Date(1736878140014),
		subAccounts: [],
		tags: ["荒らし"],
		score: ["disturberStaff"]
	},
	{
		userId: "1134180830432993371",
		name: "どらたん",
		type: "madman",
		title: "ネトスト & 執拗な迷惑行為",
		description: "ストーカーや複数回の通報など執拗な迷惑行為",
		time: new Date(1736877983588),
		subAccounts: [],
		tags: ["ストーカー行為", "ネトスト"],
		score: ["internetStalker"]
	},
	{
		userId: "1317722612574589030",
		name: "時雨",
		type: "disturber",
		title: "荒らし",
		description: "荒らし鯖の運営です。",
		time: new Date(1736877827448),
		subAccounts: [],
		tags: ["荒らし"],
		score: ["disturberStaff"]
	},
	{
		userId: "1276506416269627432",
		name: "Sigure DM",
		type: "disturber",
		title: "荒らし",
		description: "荒らし鯖の運営です。",
		time: new Date(1736877792553),
		subAccounts: [],
		tags: ["荒らし"],
		score: ["disturberStaff"]
	},
	{
		userId: "1273496247952736339",
		name: "Sigure DM",
		type: "disturber",
		title: "荒らし",
		description: "荒らし鯖の運営です。",
		time: new Date(1736877683280),
		subAccounts: [],
		tags: ["荒らし"],
		score: ["disturberStaff"]
	},
	{
		userId: "1313815729484730398",
		name: "Ahau",
		type: "disturber",
		title: "荒らし",
		description: "荒らし鯖の運営です。",
		time: new Date(1736877643995),
		subAccounts: [],
		tags: ["荒らし"],
		score: ["disturberStaff"]
	},
	{
		userId: "1299642192406777952",
		name: "Client Fox",
		type: "disturber",
		title: "荒らし",
		description: "荒らし鯖の運営です。",
		time: new Date(1736877567683),
		subAccounts: [],
		tags: ["荒らし"],
		score: ["disturberStaff"]
	},
	{
		userId: "1326322950428950589",
		name: "ARISA",
		type: "disturber",
		title: "荒らし",
		description: "荒らし鯖の運営です。",
		time: new Date(1736877534306),
		subAccounts: [],
		tags: ["荒らし"],
		score: ["disturberStaff"]
	},
	{
		userId: "1293974709158940705",
		name: "ARISA",
		type: "disturber",
		title: "荒らし",
		description: "荒らし鯖の運営です。",
		time: new Date(1736877492692),
		subAccounts: [],
		tags: ["荒らし"],
		score: ["disturberStaff"]
	},
	{
		userId: "1291680477224239141",
		name: "SigureFOX",
		type: "disturber",
		title: "荒らし",
		description: "荒らし鯖の運営をしています。",
		time: new Date(1736877443959),
		subAccounts: [],
		tags: ["荒らし"],
		score: ["disturberStaff"]
	},
	{
		userId: "739118751085101127",
		name: "NIKI",
		type: "other",
		title: "攻撃的な発言が多いため",
		description: "\nダウン症など特定の人に対する差別が多い\n",
		time: new Date(1736877253139),
		subAccounts: [],
		tags: ["攻撃発言多数", "誹謗中傷"],
		score: ["situationBreaker"]
	},
	{
		userId: "1307987731485429823",
		name: "りえる",
		type: "other",
		title: "セクハラ",
		description:
			"女性ユーザーに対する下ネタで色々な鯖で被害多数\n本人に改善しようという意志が見られない\n",
		time: new Date(1736663128894),
		subAccounts: [],
		tags: ["セクハラ", "空気が読めない"],
		score: ["sexualHarassment"]
	},
	{
		userId: "927904069660594226",
		name: "ブラック",
		type: "disturber",
		title: "NukeBotを入れようとした",
		description: "暇人鯖などでNukeBotを入れさせようとし、その後も往生際悪く粘り続けた",
		time: new Date(1736601225489),
		subAccounts: [],
		tags: ["nukebot", "荒らし", "鯖nuke"],
		score: ["disturber", "disturberNukeBot"]
	},
	{
		userId: "1317183570732908671",
		name: "ぽちすけ",
		type: "madman",
		title: "定期的に他鯖とトラブルを引き起こす。",
		description:
			"雑談界隈で頻繁にトラブルを引き起こしています。\n\n障害からか学習能力が低く同じようなトラブルを1ヶ月半の間に十数回引き起こす。",
		time: new Date(1736600916619),
		subAccounts: [],
		tags: ["トラブルメイカー", "ヤバいやつ", "話が通じない"],
		score: ["madman"]
	}
];
