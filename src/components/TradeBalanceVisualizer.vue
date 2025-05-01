<template>
  <div class="trade-balance-visualizer">
    <!-- Top Labels -->
    <div class="balance-labels top-labels">
      <!-- Show only if Team A is favored and trade is not fair -->
      <span class="label-a" v-if="!isFair && valueA > valueB">
        <span class="favor-icon">↑</span> Team A Favored
        <span class="diff-value" v-if="showDifference">(+{{ Math.round(valueA - valueB) }})</span>
      </span>
      <!-- Add a placeholder span to maintain space-between alignment when only B is shown -->
      <span v-else-if="!isFair && valueB > valueA"></span>

      <!-- Show only if Team B is favored and trade is not fair -->
      <span class="label-b" v-if="!isFair && valueB > valueA">
        Team B Favored <span class="favor-icon">↑</span>
        <span class="diff-value" v-if="showDifference">(+{{ Math.round(valueB - valueA) }})</span>
      </span>
      <!-- Add a placeholder span to maintain space-between alignment when only A is shown -->
      <span v-else-if="!isFair && valueA > valueB"></span>
    </div>

    <!-- Balance Bar -->
    <div
      class="balance-bar-container"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      <div
        class="balance-bar"
        :class="{ 'is-fair': isFair, 'is-hovered': isHovered }"
        :title="`Team A: ${Math.round(valueA)} | Team B: ${Math.round(valueB)}`"
      >
        <div class="bar-segment team-a" :style="{ width: teamAPercentage + '%' }">
          <span class="value-badge" v-if="isHovered">{{ Math.round(valueA) }}</span>
        </div>
        <div class="bar-segment team-b" :style="{ width: teamBPercentage + '%' }">
          <span class="value-badge" v-if="isHovered">{{ Math.round(valueB) }}</span>
        </div>
        <div v-if="isFair" class="fair-indicator"></div>
        <div v-if="!isFair" class="midpoint-marker"></div>
      </div>
    </div>

    <!-- Bottom Label (Balanced) -->
    <div class="balance-labels bottom-label" v-if="isFair">
      <span class="label-fair"><span class="balance-icon">⚖️</span> Balanced Trade</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'

const props = defineProps<{
  valueA: number
  valueB: number
  isFair: boolean
  showDifference?: boolean
}>()

const isHovered = ref(false)

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
  min-height: 55px;
  padding: 0 0 10px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 350px;
  margin: 0 auto;
}

.balance-labels {
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 12px;
  font-weight: 500;
  color: #555;
  padding: 0 5px;
  box-sizing: border-box;
  min-height: 18px;
}

.top-labels {
  margin-bottom: 6px;
}

.bottom-label {
  margin-top: 6px;
  justify-content: center;
}

.balance-bar-container {
  width: 100%;
  padding: 2px 0;
  transition: transform 0.2s ease;
}

.balance-bar-container:hover {
  transform: scale(1.02);
}

.balance-bar {
  display: flex;
  width: 100%;
  height: 16px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f0f0f0;
  position: relative;
  box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease-in-out;
}

.balance-bar.is-hovered {
  height: 22px;
  box-shadow:
    inset 0 1px 6px rgba(0, 0, 0, 0.2),
    0 2px 8px rgba(0, 0, 0, 0.1);
}

.bar-segment {
  height: 100%;
  transition: width 0.5s cubic-bezier(0.25, 1, 0.5, 1);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.team-a {
  background: linear-gradient(to right, #ff9985, #ff7875);
  border-radius: 8px 0 0 8px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.team-b {
  background: linear-gradient(to right, #69c0ff, #1890ff);
  border-radius: 0 8px 8px 0;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

/* Style when the trade is fair */
.balance-bar.is-fair .team-a {
  background: linear-gradient(to right, #95de64, #73d13d);
}

.balance-bar.is-fair .team-b {
  background: linear-gradient(to left, #95de64, #73d13d);
}

.fair-indicator {
  position: absolute;
  left: 50%;
  top: -4px;
  bottom: -4px;
  width: 3px;
  background-color: #52c41a;
  transform: translateX(-50%);
  border-radius: 1.5px;
  box-shadow: 0 0 6px rgba(82, 196, 26, 0.7);
  animation: pulse 1.5s infinite alternate;
}

.midpoint-marker {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: rgba(0, 0, 0, 0.15);
  transform: translateX(-50%);
}

.label-fair {
  font-weight: bold;
  color: #389e0d;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 12px;
  background-color: rgba(82, 196, 26, 0.15);
  box-shadow: 0 1px 3px rgba(82, 196, 26, 0.1);
  animation: fadeIn 0.5s ease-out;
}

.label-a {
  text-align: left;
  color: #cf1322;
  display: flex;
  align-items: center;
  gap: 4px;
  animation: slideIn 0.3s ease-out;
}

.label-b {
  text-align: right;
  color: #096dd9;
  display: flex;
  align-items: center;
  gap: 4px;
  animation: slideIn 0.3s ease-out;
}

.favor-icon {
  font-size: 14px;
  font-weight: bold;
}

.balance-icon {
  font-size: 14px;
}

.diff-value {
  font-size: 11px;
  opacity: 0.8;
}

.value-badge {
  background-color: rgba(255, 255, 255, 0.9);
  color: #333;
  padding: 0 4px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.2s ease-out;
  position: relative;
  z-index: 1;
}

@keyframes pulse {
  0% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-5px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
