<script lang="ts">
  import "$lib/assets/a-tag.css";
  import "$lib/assets/md.css";
  import MarkDown from "svelte-exmarkdown";
  import { gfmPlugin } from "svelte-exmarkdown/gfm";

  export type Props = {
    content: string;
  };

  const { content }: Props = $props();
  const plugins = [gfmPlugin()];
</script>

<MarkDown md={content} {plugins} />
