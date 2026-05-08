<script lang="ts">
  import { onMount } from "svelte";
  import { v4 } from "uuid";

  type Props = {
    height: number | string;
    width: number | string;
    iconPath: string;
    edgePath: string;
    imgStyle?: string;
  };

  const { imgStyle, iconPath, edgePath, height, width }: Props = $props();

  const size = 512;
  const uuid = v4();
  const image1Id = uuid + "Image1Id";
  const image2Id = uuid + "Image2Id";
  const clipId = uuid + "clipId";

  let imgPath = $state("/discord.webp");

  onMount(async () => {
    const reponse = await fetch(iconPath);
    if (reponse.status === 200) {
      imgPath = iconPath;
    }
  });
</script>

<svg
  {width}
  {height}
  viewBox="0 0 512 512"
  version="1.1"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  xml:space="preserve"
  style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2; {imgStyle ??
    ''};"
>
  <use href="#{image1Id}" xlink:href="#{image1Id}" x="0" y="0" width={size} height={size} />
  <g transform="matrix(1,0,0,1,5.19543,0.659201)">
    <circle cx="250.805" cy="255.341" r="128.468" style="fill:rgb(235,235,235);" />
    <clipPath id={clipId}>
      <circle cx="250.805" cy="255.341" r="128.468" />
    </clipPath>
    <g clip-path="url(#{clipId})">
      <g transform="matrix(0.629565,0,0,0.629565,98.8075,91.7886)">
        <use href="#{image2Id}" xlink:href="#{image2Id}" x="-14" y="0" width={size} height={size} />
      </g>
    </g>
  </g>
  <defs>
    <image id={image1Id} width={size} height={size} href={edgePath} xlink:href={edgePath} />
    <image id={image2Id} width={size} height={size} href={imgPath} xlink:href={imgPath} />
  </defs>
</svg>
