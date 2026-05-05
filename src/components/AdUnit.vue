<template>
  <div class="ad-container" v-if="consentGiven">
    <ins
      class="adsbygoogle"
      :style="adStyle"
      :data-ad-client="adClient"
      :data-ad-slot="adSlot"
      :data-ad-format="adFormat"
      :data-full-width-responsive="fullWidthResponsive"
    ></ins>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'

const props = defineProps({
  adSlot: {
    type: String,
    required: true,
  },
  adFormat: {
    type: String,
    default: 'auto',
  },
  fullWidthResponsive: {
    type: String,
    default: 'true',
  },
  adStyle: {
    type: String,
    default: 'display:block',
  },
})

const adClient = 'ca-pub-6552500188458610'
const consentGiven = ref(false)

onMounted(() => {
  // Check cookie consent before loading ads
  try {
    const consent = JSON.parse(localStorage.getItem('fn-cookie-consent') || '{}')
    consentGiven.value = consent.advertising === true
  } catch {
    consentGiven.value = false
  }

  if (consentGiven.value) {
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (e) {
      // AdSense not loaded or ad blocker active
    }
  }
})
</script>

<style scoped>
.ad-container {
  display: flex;
  justify-content: center;
  margin: 24px 0;
  min-height: 90px;
  width: 100%;
}
</style>
