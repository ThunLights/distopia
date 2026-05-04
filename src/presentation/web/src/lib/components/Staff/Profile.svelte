<script lang="ts">
  import type { Staff } from "$lib/shared/constant";

  type Props = {
    staff: Staff;
  };

  const { staff }: Props = $props();
</script>

<div class="staff">
  <div>
    <img class="icon" src={staff.icon} alt="" />
  </div>
  <div>
    <p class="name">{staff.name}</p>
    <p class="small">{staff.description}</p>
    <div>
      {#each staff.link as link (link)}
        <a class="link" href={link.url} target="_blank" rel="noopener noreferrer external">
          <img src={link.icon} alt={link.url} />
        </a>
      {/each}
    </div>
  </div>
</div>

<style>
  .small {
    font-size: 14px;
    font-weight: 500;
  }
  .icon {
    height: 65px;
    border-radius: 50%;
  }
  .link img {
    margin: 1px 3px;
    height: 25px;
    border-radius: 25%;
  }
  .staff {
    align-items: center;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 10px;
    margin: 16px 0;
  }
  .name {
    font-size: 20px;
    font-weight: 800;
  }
</style>
