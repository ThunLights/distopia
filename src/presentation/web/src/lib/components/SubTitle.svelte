<script lang="ts">
  import "$lib/assets/subtitle-h2.css";
  import "$lib/assets/title-h1.css";

  type Props = {
    content: string;
  };

  const { content }: Props = $props();
</script>

<h2>{content}</h2>
