<script lang="ts">
  import type { Supporter } from "$lib/shared/constant";

  type Props = {
    supporter: Supporter;
  };

  const { supporter }: Props = $props();
</script>

<div class="supporter">
  <div>
    <img class="icon" src={supporter.icon} alt="" />
  </div>
  <div>
    <p>{supporter.name}</p>
    <p>
      <a href={supporter.invite} rel="external">{supporter.invite}</a>
    </p>
  </div>
</div>

<style>
  .supporter .icon {
    height: 50px;
    border-radius: 50%;
  }
  .supporter {
    align-items: center;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 10px;
    margin: 14px 0;
  }
</style>
