<template>
  <div class="trade-balance-visualizer">
    <!-- Top Labels -->
    <div class="balance-labels top-labels">
      <!-- Show only if Team A is favored and trade is not fair -->
      <span class="label-a" v-if="!isFair && valueA > valueB">Team A Favored</span>
      <!-- Add a placeholder span to maintain space-between alignment when only B is shown -->
      <span v-else-if="!isFair && valueB > valueA"></span>

      <!-- Show only if Team B is favored and trade is not fair -->
      <span class="label-b" v-if="!isFair && valueB > valueA">Team B Favored</span>
      <!-- Add a placeholder span to maintain space-between alignment when only A is shown -->
      <span v-else-if="!isFair && valueA > valueB"></span>
    </div>

    <!-- Balance Bar -->
    <div class="balance-bar-container">
      <div
        class="balance-bar"
        :class="{ 'is-fair': isFair }"
        :title="`Team A: ${Math.round(valueA)} | Team B: ${Math.round(valueB)}`"
      >
        <div class="bar-segment team-a" :style="{ width: teamAPercentage + '%' }"></div>
        <div class="bar-segment team-b" :style="{ width: teamBPercentage + '%' }"></div>
        <div v-if="isFair" class="fair-indicator"></div>
      </div>
    </div>

    <!-- Bottom Label (Balanced) -->
    <div class="balance-labels bottom-label" v-if="isFair">
      <span class="label-fair">Balanced</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  valueA: number
  valueB: number
  isFair: boolean
}>()

const totalValue = computed(() => props.valueA + props.valueB)

const teamAPercentage = computed(() => {
  if (totalValue.value === 0) return 50 // Default to 50/50 if no value
  return (props.valueA / totalValue.value) * 100
})

const teamBPercentage = computed(() => {
  if (totalValue.value === 0) return 50 // Default to 50/50 if no value
  return (props.valueB / totalValue.value) * 100
})
</script>

<style scoped>
.trade-balance-visualizer {
  /* Make container slightly taller to accommodate labels without shifting */
  min-height: 45px;
  padding: 0 0 10px 0; /* Adjust padding */
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 300px; /* Adjust max-width as needed */
  margin: 0 auto; /* Center the visualizer */
}

.balance-labels {
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 11px;
  color: #888;
  padding: 0 5px; /* Add padding to prevent labels touching edges */
  box-sizing: border-box;
  /* Ensure labels div takes up space even if empty */
  min-height: 15px;
}

.top-labels {
  margin-bottom: 4px; /* Space between top labels and bar */
}

.bottom-label {
  margin-top: 4px; /* Space between bar and bottom label */
  justify-content: center; /* Center the 'Balanced' label */
}

.balance-bar-container {
  width: 100%;
  /* Removed padding: 5px 0; as spacing is handled by label margins */
}

.balance-bar {
  display: flex;
  width: 100%;
  height: 12px;
  border-radius: 6px;
  overflow: hidden;
  background-color: #e0e0e0; /* Fallback background */
  position: relative;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.bar-segment {
  height: 100%;
  transition: width 0.5s ease-in-out;
}

.team-a {
  background-color: #ff7875; /* Light red for Team A */
  border-radius: 6px 0 0 6px;
}

.team-b {
  background-color: #69c0ff; /* Light blue for Team B */
  border-radius: 0 6px 6px 0;
}

/* Style when the trade is fair */
.balance-bar.is-fair .team-a,
.balance-bar.is-fair .team-b {
  background-color: #95de64; /* Light green for fair */
}

.fair-indicator {
  position: absolute;
  left: 50%;
  top: -4px;
  bottom: -4px;
  width: 3px;
  background-color: #52c41a; /* Darker green indicator */
  transform: translateX(-50%);
  border-radius: 1.5px;
  box-shadow: 0 0 4px rgba(82, 196, 26, 0.5);
}

.label-fair {
  /* Removed absolute positioning */
  font-weight: bold;
  color: #52c41a;
}

.label-a {
  text-align: left;
}

.label-b {
  text-align: right;
}
</style>
