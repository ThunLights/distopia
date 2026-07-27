<script lang="ts">
  import Block from "../Block.svelte";
  import BlockTitle from "./BlockTitle.svelte";
  import { AreaChart } from "layerchart/svg";

  type RecordOneDay = {
    date: Date;
    memberCount: number;
    activeRate: number;
    level: number;
  };

  type Metric = "activeRate" | "memberCount" | "level";

  type Props = {
    data: RecordOneDay[];
  };

  const { data }: Props = $props();

  let metric = $state<Metric>("activeRate");

  const metricLabels: Record<Metric, string> = {
    activeRate: "アクティブレート",
    memberCount: "メンバー数",
    level: "レベル",
  };
</script>

<Block>
  <div class="header">
    <BlockTitle title="推移" />
    <select bind:value={metric} aria-label="グラフに表示する指標">
      <option value="activeRate">{metricLabels.activeRate}</option>
      <option value="memberCount">{metricLabels.memberCount}</option>
      <option value="level">{metricLabels.level}</option>
    </select>
  </div>
  {#if data.length}
    <AreaChart {data} x="date" y={metric} height={240} />
  {:else}
    <p class="empty">データがまだありません。</p>
  {/if}
</Block>

<style>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  select {
    color: rgb(201, 201, 201);
    border-radius: 25px;
    background-color: rgb(85, 85, 85);
    padding: 5px 10px;
    font-weight: 700;
  }
  .empty {
    color: rgb(153, 153, 153);
  }
</style>
