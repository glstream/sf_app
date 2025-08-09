<template>
  <transition name="slide-up">
    <div v-if="showBanner" class="cookie-consent-banner">
      <div class="cookie-content">
        <div class="cookie-text">
          <h4>🍪 Cookie Notice</h4>
          <p>
            We use cookies and similar technologies to enhance your browsing experience, serve personalized ads, and analyze our traffic. 
            We also share information about your use of our site with our advertising partners including Google AdSense.
          </p>
        </div>
        <div class="cookie-buttons">
          <a-button type="link" @click="showPreferences = true" size="small">
            Cookie Settings
          </a-button>
          <a-button @click="acceptAll" type="primary" size="small">
            Accept All
          </a-button>
          <a-button @click="acceptEssential" size="small">
            Essential Only
          </a-button>
        </div>
      </div>
    </div>
  </transition>

  <!-- Cookie Preferences Modal -->
  <a-modal
    v-model:open="showPreferences"
    title="Cookie Preferences"
    :footer="null"
    width="600px"
    @cancel="showPreferences = false"
  >
    <div class="preferences-content">
      <div class="cookie-category">
        <div class="category-header">
          <h4>Essential Cookies</h4>
          <a-switch :checked="true" disabled />
        </div>
        <p>These cookies are necessary for the website to function and cannot be switched off.</p>
      </div>

      <div class="cookie-category">
        <div class="category-header">
          <h4>Analytics Cookies</h4>
          <a-switch v-model:checked="analyticsConsent" />
        </div>
        <p>These cookies help us understand how visitors interact with our website by collecting information anonymously.</p>
      </div>

      <div class="cookie-category">
        <div class="category-header">
          <h4>Advertising Cookies</h4>
          <a-switch v-model:checked="advertisingConsent" />
        </div>
        <p>These cookies are used to show you ads that are relevant to you and your interests.</p>
      </div>

      <div class="preferences-buttons">
        <a-button @click="savePreferences" type="primary" block>
          Save Preferences
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'

const showBanner = ref(false)
const showPreferences = ref(false)
const analyticsConsent = ref(true)
const advertisingConsent = ref(true)

const CONSENT_KEY = 'fn-cookie-consent'
const CONSENT_VERSION = '1.0'

interface ConsentData {
  version: string
  timestamp: number
  essential: boolean
  analytics: boolean
  advertising: boolean
}

onMounted(() => {
  checkConsentStatus()
})

const checkConsentStatus = () => {
  const saved = localStorage.getItem(CONSENT_KEY)
  if (!saved) {
    // Show banner after a short delay for better UX
    setTimeout(() => {
      showBanner.value = true
    }, 2000)
  } else {
    try {
      const consent: ConsentData = JSON.parse(saved)
      analyticsConsent.value = consent.analytics
      advertisingConsent.value = consent.advertising
      
      // Apply consent settings
      applyConsentSettings(consent)
    } catch (e) {
      // Invalid stored consent, show banner
      showBanner.value = true
    }
  }
}

const saveConsent = (analytics: boolean, advertising: boolean) => {
  const consent: ConsentData = {
    version: CONSENT_VERSION,
    timestamp: Date.now(),
    essential: true,
    analytics,
    advertising
  }
  
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent))
  applyConsentSettings(consent)
  showBanner.value = false
  showPreferences.value = false
}

const applyConsentSettings = (consent: ConsentData) => {
  // Apply Google Analytics consent
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('consent', 'update', {
      analytics_storage: consent.analytics ? 'granted' : 'denied',
      ad_storage: consent.advertising ? 'granted' : 'denied',
      ad_user_data: consent.advertising ? 'granted' : 'denied',
      ad_personalization: consent.advertising ? 'granted' : 'denied'
    })
  }
}

const acceptAll = () => {
  saveConsent(true, true)
}

const acceptEssential = () => {
  saveConsent(false, false)
}

const savePreferences = () => {
  saveConsent(analyticsConsent.value, advertisingConsent.value)
}
</script>

<style scoped>
.cookie-consent-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-background);
  border-top: 2px solid var(--color-border);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  padding: 20px;
  z-index: 1000;
}

.cookie-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.cookie-text h4 {
  margin: 0 0 8px 0;
  color: var(--color-text);
  font-size: 1.1rem;
}

.cookie-text p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  line-height: 1.4;
}

.cookie-buttons {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.preferences-content {
  padding: 20px 0;
}

.cookie-category {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-border);
}

.cookie-category:last-child {
  border-bottom: none;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.category-header h4 {
  margin: 0;
  color: var(--color-text);
}

.cookie-category p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  line-height: 1.4;
}

.preferences-buttons {
  margin-top: 24px;
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .cookie-content {
    flex-direction: column;
    gap: 16px;
  }
  
  .cookie-buttons {
    width: 100%;
    justify-content: center;
  }
  
  .cookie-text {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .cookie-consent-banner {
    padding: 16px;
  }
  
  .cookie-buttons {
    flex-direction: column;
    gap: 8px;
  }
}

/* Dark theme */
html.dark .cookie-consent-banner {
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
}
</style>