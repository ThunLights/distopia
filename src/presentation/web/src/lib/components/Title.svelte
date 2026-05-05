<script lang="ts">
  import "$lib/assets/title-h1.css";

  type Props = {
    content: string;
  };

  const { content }: Props = $props();
</script>

<h1>{content}</h1>
