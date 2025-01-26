<script lang="ts">
    import { onMount } from "svelte";

    type Props = {
		height: number | string
		width: number | string
		iconPath: string
		edgePath: string
        imgStyle?: string
    }

	const { imgStyle, iconPath, edgePath, height, width }: Props = $props();

    const size = 512;

    let imgPath = $state("/ranking/discord.webp");

	onMount(async () => {
		const reponse = await fetch(iconPath);
		if (reponse.status === 200) {
			imgPath = iconPath;
		}
	});
</script>

<svg width={width} height={height} viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2; {imgStyle ?? ""};">
    <use xlink:href="#_Image1" x="0" y="0" width={size} height={size}/>
    <g transform="matrix(1,0,0,1,5.19543,0.659201)">
        <circle cx="250.805" cy="255.341" r="128.468" style="fill:rgb(235,235,235);"/>
        <clipPath id="_clip2">
            <circle cx="250.805" cy="255.341" r="128.468"/>
        </clipPath>
        <g clip-path="url(#_clip2)">
            <g transform="matrix(0.629565,0,0,0.629565,98.8075,91.7886)">
                <use xlink:href="#_Image3" x="-14" y="0" width={size} height={size}/>
            </g>
        </g>
    </g>
    <defs>
        <image id="_Image1" width={size} height={size} xlink:href={edgePath} />
        <image id="_Image3" width={size} height={size} xlink:href={imgPath} />
    </defs>
</svg>

<style>
</style>
