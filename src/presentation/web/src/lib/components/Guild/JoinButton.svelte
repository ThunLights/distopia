<script lang="ts">
  type Props = {
    guildId: string;
    name: string;
  };

  const { name }: Props = $props();

  async function join() {}
</script>

<button onclick={join} class="join-button">「{name}」に参加</button>

<style>
  .join-button {
    margin-top: 15px;
    cursor: pointer;
    font-size: 15px;
    font-weight: 800;
    text-align: center;
    padding: 10px;
    width: 100%;
    color: rgb(52, 198, 52);
    background-color: rgb(59, 59, 59);
    border: 1px solid rgb(85, 85, 85);
  }
  .join-button:active {
    border: 1px solid rgb(49, 49, 49);
    background-color: rgb(85, 85, 85);
  }
  button {
    cursor: pointer;
    border-radius: 25px;
    color: white;
    background-color: rgb(49, 49, 49);
    opacity: 0.8;
    font-size: 14px;
    padding: 4px 8px;
    border: 1px solid rgb(85, 85, 85);
  }
  button:active {
    border: 1px solid rgb(49, 49, 49);
    background-color: rgb(85, 85, 85);
  }
</style>
