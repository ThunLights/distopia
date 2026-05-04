<script lang="ts">
  const { children } = $props();
</script>

<div class="content">
  <div class="main">
    {@render children()}
  </div>
</div>

<style>
  .main {
    overflow: hidden;
    margin: 20px;
  }
  .content {
    overflow: hidden;
    display: block;
    background-color: rgb(37, 36, 41);
    border-radius: 10px;
    width: 90%;
    margin: 20px auto;
  }
</style>
