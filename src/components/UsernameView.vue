<template>
  <a-layout class="layout">
    <theme-toggle-button />
    <AppHeader />

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="hero-gradient"></div>
        <div class="hero-pattern"></div>
      </div>
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">Your Fantasy Football League Dashboard</h1>
          <p class="hero-subtitle">
            Connect your Sleeper or Fleaflicker account to unlock deep league analytics, discover optimal trades,
            and dominate your competition with data-driven insights.
          </p>
        </div>

        <div class="hero-form-container">
          <a-form
            :model="formState"
            name="basic"
            autocomplete="off"
            @finish="onFinish"
            @finishFailed="onFinishFailed"
            class="landing-form"
          >
            <div class="form-inputs-row">
              <a-form-item
                name="platform"
                :rules="[{ required: true, message: 'Please select a platform' }]"
                class="form-item-platform"
              >
                <a-select
                  v-model:value="formState.platform"
                  placeholder="Platform"
                  size="large"
                  class="platform-select"
                >
                  <a-select-option value="sleeper">
                    <span class="platform-option">
                      <img src="@/assets/platformLogos/sleeper.png" alt="Sleeper" class="platform-logo" />
                      Sleeper
                    </span>
                  </a-select-option>
                  <a-select-option value="fleaflicker">
                    <span class="platform-option">
                      <img src="@/assets/platformLogos/fleaflicker.jpg" alt="Fleaflicker" class="platform-logo" />
                      Fleaflicker
                    </span>
                  </a-select-option>
                </a-select>
              </a-form-item>

              <a-form-item
                name="userName"
                :rules="[{ required: true, message: `Please enter your ${formState.platform === 'fleaflicker' ? 'Fleaflicker email address' : 'Sleeper username'}` }]"
                class="form-item-username"
              >
                <a-input
                  v-model:value="formState.userName"
                  :placeholder="formState.platform === 'fleaflicker' ? 'Enter your email address' : 'Enter your Sleeper username'"
                  size="large"
                  class="username-input"
                >
                  <template #prefix>
                    <UserOutlined class="input-icon" />
                  </template>
                </a-input>
              </a-form-item>

              <a-form-item
                name="leagueYear"
                :rules="[{ required: true, message: 'Please select a league year' }]"
                class="form-item-year"
              >
                <a-select
                  v-model:value="formState.leagueYear"
                  placeholder="Year"
                  size="large"
                  class="year-select"
                >
                  <a-select-option value="2025">2025</a-select-option>
                  <a-select-option value="2024">2024</a-select-option>
                  <a-select-option value="2023">2023</a-select-option>
                  <a-select-option value="2022">2022</a-select-option>
                  <a-select-option value="2021">2021</a-select-option>
                </a-select>
              </a-form-item>
            </div>


            <div class="form-actions-row">
              <a-form-item class="form-item-primary">
                <a-button
                  type="primary"
                  html-type="submit"
                  size="large"
                  :loading="formIsLoading"
                  class="cta-btn-primary"
                >
                  <span>Analyze My Leagues</span>
                  <RightOutlined v-if="!formIsLoading" class="arrow-icon" />
                </a-button>
              </a-form-item>

              <a-form-item class="form-item-demo">
                <a-button
                  type="default"
                  html-type="button"
                  size="large"
                  :loading="demoFormIsLoading"
                  @click="navigateToDemoPage"
                  class="demo-btn"
                >
                  View Demo
                </a-button>
              </a-form-item>
            </div>

            <div class="form-info">
              <a-button type="text" @click="showModal" class="info-btn">
                <InfoCircleOutlined />
                <span>Supports Sleeper and Fleaflicker leagues</span>
              </a-button>
              <a-modal v-model:open="open" @ok="handleOk" title="Platform Support">
                <p>
                  Fantasy Navigator supports both Sleeper and Fleaflicker fantasy football platforms.
                  Features include:
                </p>
                <ul>
                  <li><strong>Sleeper:</strong> Full dynasty and redraft support with draft pick tracking</li>
                  <li><strong>Fleaflicker:</strong> League analysis, rosters, standings, and transactions (just enter your email)</li>
                </ul>
                <p>
                  Select your platform above and enter your credentials to get started.
                </p>
              </a-modal>
            </div>
          </a-form>
        </div>

        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-number">500K+</span>
            <span class="stat-label">Leagues Analyzed</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">5</span>
            <span class="stat-label">Ranking Sources</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">3</span>
            <span class="stat-label">Projection Sources</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">Real-time</span>
            <span class="stat-label">Trade Analysis</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <a-layout-content class="responsive-padding features-section">
      <div class="features-header">
        <h2 class="features-title">Unlock Your Fantasy Football Potential</h2>
        <p class="features-subtitle">
          Comprehensive tools and analytics to give you the competitive edge
        </p>
      </div>
      <a-row
        :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }"
        justify="space-around"
        style="margin-bottom: 20px"
      >
        <a-col :xs="24" :sm="12" :md="6" :lg="8" :xl="8" style="padding-top: 40px">
          <a-card>
            <template #cover>
              <img
                src="@/assets/site/power_ranks.png"
                alt="League Composition Metrics"
                style="width: 100%"
              />
            </template>
            <a-card-meta title="League Composition Metrics">
              <template #description>
                Dive into detailed analytics of your league's structure and dynamics, understanding
                the distribution of player skills and team strengths.
              </template>
            </a-card-meta>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6" :lg="8" :xl="8" style="padding-top: 20px">
          <a-card>
            <template #cover>
              <img
                src="@/assets/site/league_details.png"
                alt="Players Stack Ranked"
                style="width: 100%"
              />
            </template>
            <a-card-meta title="Manager League Summary">
              <template #description>
                Compare your leagues roster across all rankings sources with custom rankings built
                for your league settings.
              </template>
            </a-card-meta>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6" :lg="8" :xl="8" style="padding-top: 20px">
          <a-card>
            <template #cover>
              <img
                src="@/assets/site/league_position.png"
                alt="Players Stack Ranked"
                style="width: 100%"
              />
            </template>
            <a-card-meta title="Players Stack Ranked">
              <template #description>
                Compare your roster against the league with stack rankings to identify your
                strengths and uncover potential trade opportunities.
              </template>
            </a-card-meta>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6" :lg="8" :xl="8" style="padding-top: 20px">
          <a-card>
            <template #cover>
              <img src="@/assets/site/trade_calc.png" alt="Trade Calculator" style="width: 100%" />
            </template>
            <a-card-meta title="Trade Calculator">
              <template #description>
                Discover a more precise way to evaluate your trades with our advanced Trade
                Calculator. Our Calculator considers a wide array of factors to ensure you receive
                an accurate assessment. Plus, with our new sharing feature, you can easily post
                trade details and gather opinions from others.
              </template>
            </a-card-meta>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6" :lg="8" :xl="8" style="padding-top: 20px">
          <a-card>
            <template #cover>
              <img src="@/assets/site/agevalue.png" alt="Age Vs Value" style="width: 100%" />
            </template>
            <a-card-meta title="Age Vs Value Analysis">
              <template #description>
                Gain insights into how a player's age correlates with their market value, helping
                you strategize long-term team development and make smarter trade decisions.
              </template>
            </a-card-meta>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6" :lg="8" :xl="8" style="padding-top: 20px">
          <a-card>
            <template #cover>
              <img src="@/assets/site/projections.png" alt="Projections" style="width: 100%" />
            </template>
            <a-card-meta title="Projections">
              <template #description>
                Leverage projections from leading analysts to strategize your next moves and
                optimize your lineup for upcoming matches.
              </template>
            </a-card-meta>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6" :lg="8" :xl="8" style="padding-top: 20px">
          <a-card>
            <template #cover>
              <img src="@/assets/site/leagueSummary.png" alt="Summary Views" style="width: 100%" />
            </template>
            <a-card-meta title="Single League Summary">
              <template #description>
                Get a comprehensive overview a league from multiple different ranking sources.
              </template>
            </a-card-meta>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6" :lg="8" :xl="8" style="padding-top: 20px">
          <a-card>
            <template #cover>
              <img
                src="@/assets/site/roster_view_manager.png"
                alt="Projections"
                style="width: 100%"
              />
            </template>
            <a-card-meta title="Team Composition">
              <template #description>
                See the makeup of your team and compare it to the rest of the league.
              </template>
            </a-card-meta>
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="6" :lg="8" :xl="8" style="padding-top: 20px">
          <a-card>
            <template #cover>
              <img src="@/assets/site/leagueView.png" alt="Projections" style="width: 100%" />
            </template>
            <a-card-meta title="Rosters By Manager">
              <template #description>
                Explore detailed roster compositions across your league to pinpoint trade
                opportunities and analyze manager strategies, helping you build a competitive edge.
              </template>
            </a-card-meta>
          </a-card>
        </a-col>
      </a-row>
    </a-layout-content>
    <AppFooter />
  </a-layout>
</template>
<script lang="ts" setup>
import { reactive, ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMeta } from '@/composables/useMeta'

// Site tags
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import ThemeToggleButton from '@/components/ThemeToggleButton.vue'

// 3rd Part Utils
import axios from 'axios'
import {
  UserOutlined,
  LockOutlined,
  InfoCircleOutlined,
  HomeOutlined,
  RightOutlined,
  TeamOutlined
} from '@ant-design/icons-vue'

import { message } from 'ant-design-vue'

// Custom Utils
import { useGuid } from '../utils/guid'
import { useUserStore } from '@/stores/userStore'
import { useLeaguesStore } from '@/stores/leaguesStore'
import { useThemeStore } from '@/stores/theme'
const { leagues, fetchLeagues } = useLeaguesStore()

// Image imports
import landingPage from '@/assets/home_page.webp'

// routes and stores
const store = useUserStore()
const leagueStore = useLeaguesStore()
const themeStore = useThemeStore()
const router = useRouter()

// const instances
const open = ref<boolean>(false)
const formIsLoading = ref(false)
const demoFormIsLoading = ref(false)
const apiUrl = import.meta.env.VITE_API_URL

import { theme } from 'ant-design-vue'
const { useToken } = theme
const isDarkMode = ref(false)

const currentTheme = computed(() => {
  return themeStore.isDarkMode
    ? { algorithm: theme.darkAlgorithm }
    : { algorithm: theme.defaultAlgorithm }
})

interface FormState {
  userName: string
  leagueYear: string
  platform: string
}

onMounted(() => {
  // Add structured data script to head
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(structuredData)
  document.head.appendChild(script)

  // Clean up on unmount
  onUnmounted(() => {
    document.head.removeChild(script)
  })
})

const showModal = () => {
  open.value = true
}
const navigateToDemoPage = () => {
  router.push('/leagues/2025/gray_matter/b114010d-ca3c-4150-b7ac-3b926a1737b1')
}
const handleOk = (e: MouseEvent) => {
  open.value = false
}

const userStore = useUserStore()

async function updateUserDetails(year, name, guid) {
  try {
    await userStore.setUserDetails(year, name, guid)
  } catch (error) {
    console.error('Failed to update user details:', error)
  }
}

const formState = reactive<FormState>({
  userName: userStore.userName || '',
  leagueYear: userStore.leagueYear || '2025',
  platform: userStore.platform || 'sleeper'
})

// Clear username when platform changes
watch(() => formState.platform, (newPlatform, oldPlatform) => {
  if (oldPlatform && newPlatform !== oldPlatform) {
    formState.userName = ''
  }
})

const onFinish = async (values) => {
  console.log('onFinish called with values:', values)
  console.log('formState:', formState)
  console.log('apiUrl:', apiUrl)
  
  formIsLoading.value = true
  let retryCount = 0

  while (retryCount < 3) {
    try {
      console.log('Starting form submission - attempt', retryCount + 1)
      
      // Platform-specific validation
      if (formState.platform === 'sleeper') {
        console.log('Validating Sleeper username:', formState.userName)
        const response = await fetch(`https://api.sleeper.app/v1/user/${formState.userName}`)
        const data = await response.json()

        if (data === null || Object.keys(data).length === 0) {
          throw new Error('Invalid Sleeper username!')
        }
      } else if (formState.platform === 'fleaflicker') {
        console.log('Validating Fleaflicker input:', formState.userName)
        // Clean input
        formState.userName = formState.userName.trim()
        
        if (!formState.userName || formState.userName.length < 1) {
          throw new Error('Please enter your email address!')
        }
        
        // Check if it's an email address or numeric ID
        if (formState.userName.includes('@')) {
          // Email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(formState.userName)) {
            throw new Error('Please enter a valid email address!')
          }
          console.log('Fleaflicker email validation passed')
        } else {
          // Numeric ID validation (legacy support)
          if (!/^\d+$/.test(formState.userName)) {
            throw new Error('Please enter either your email address or numeric user ID!')
          }
          console.log('Fleaflicker numeric ID validation passed')
        }
      }

      const { getOrCreateGUID } = useGuid()
      const userGuid = getOrCreateGUID()
      console.log('Generated GUID:', userGuid)

      // Make a POST request to your backend server with platform
      const requestData: any = {
        league_year: formState.leagueYear,
        user_name: formState.userName,
        guid: userGuid,
        platform: formState.platform
      }
      
      console.log('Sending POST request to:', `${apiUrl}/user_details`)
      console.log('Request data:', requestData)
      
      await axios.post(`${apiUrl}/user_details`, requestData)

      console.log('Username submission successful')

      store.setUserDetails(formState.leagueYear, formState.userName, userGuid, formState.platform)
      
      console.log('Fetching leagues...')
      await fetchLeagues(formState.leagueYear, formState.userName, userGuid, formState.platform)

      // Debug: Log the current state
      console.log('UsernameView redirect logic - Platform:', formState.platform)
      console.log('UsernameView redirect logic - Leagues Store:', leagueStore.leagues)
      console.log('UsernameView redirect logic - Leagues Count:', leagueStore.leagues?.length || 0)

      // Both Fleaflicker and Sleeper users now go to LeaguesView
      console.log('UsernameView - Redirecting to LeaguesView for platform:', formState.platform)
      router.push(`/leagues/${formState.leagueYear}/${formState.userName}/${userGuid}`)

      // Break out of the retry loop if successful
      break
    } catch (error) {
      console.error('Error in onFinish:', error)
      console.error('Error stack:', error.stack)
      console.error('Error message:', error.message)

      if (retryCount === 2) {
        message.error('Failed to submit username. Please try again later.')
        break
      }

      retryCount++
      console.log(`Retrying... Attempt ${retryCount + 1}`)
    }
  }

  formIsLoading.value = false
}

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo)
}

// SEO Metadata
useMeta({
  title: 'Fantasy Navigator - Optimize Your Sleeper Fantasy Football Teams',
  description:
    'Analyze your Sleeper fantasy football leagues with rankings from 5 sources including FantasyCalc, DynastyDaddy, KTC, and Dynasty Process. Get trade insights, roster optimization and projections from 3 projection sources: CBS, NFL and ESPN.',
  meta: [
    {
      name: 'keywords',
      content:
        'fantasy football, sleeper app, dynasty fantasy football, fantasy rankings, trade calculator, roster optimizer, fantasy football projections'
    },
    {
      property: 'og:title',
      content: 'Fantasy Navigator - Optimize Your Sleeper Fantasy Football Teams'
    },
    {
      property: 'og:description',
      content:
        'Analyze your Sleeper fantasy football leagues with rankings from 5 sources and 3 projection systems. 500K+ leagues analyzed with comprehensive trade opportunities and roster optimization.'
    },
    { property: 'og:type', content: 'website' },
    {
      property: 'og:image',
      content: new URL('@/assets/site/league_details.png', import.meta.url).href
    },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Fantasy Navigator - Fantasy Football League Analyzer' },
    {
      name: 'twitter:description',
      content:
        'Optimize your fantasy football teams with 500K+ league analysis, 5 ranking sources, and 3 projection systems for comprehensive trade insights.'
    }
  ]
})

// Add structured data for rich results
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Fantasy Navigator',
  applicationCategory: 'SportsApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  },
  description:
    'A fantasy football analysis tool for Sleeper leagues with 500K+ leagues analyzed across 5 ranking sources (FantasyCalc, DynastyDaddy, Keep Trade Cut, Dynasty Process, and FantasyNavigator) and 3 projection sources (CBS, NFL and ESPN).',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '210'
  }
}
</script>
<style scoped>
/* Hero Section Styles */
.hero-section {
  min-height: 600px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 20px 60px;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.hero-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    var(--hero-gradient-start) 0%,
    var(--hero-gradient-mid) 50%,
    var(--hero-gradient-end) 100%
  );
  transition: background 0.3s ease;
}

.hero-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  animation: float 8s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(1deg);
  }
}

/* Theme-specific hero gradients */
.hero-section {
  --hero-gradient-start: #f8fafc;
  --hero-gradient-mid: #e2e8f0;
  --hero-gradient-end: #cbd5e1;
}

html.dark .hero-section {
  --hero-gradient-start: #1e293b;
  --hero-gradient-mid: #334155;
  --hero-gradient-end: #475569;
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 800px;
  width: 100%;
}

.hero-text {
  margin-bottom: 48px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 900;
  color: var(--color-text);
  margin-bottom: 24px;
  letter-spacing: -2px;
  line-height: 1.1;
  background: linear-gradient(135deg, var(--color-text) 0%, var(--color-primary) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: all 0.3s ease;
}

.hero-subtitle {
  font-size: 1.3rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
  transition: color 0.3s ease;
}

.hero-form-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  margin-bottom: 48px;
  transition: all 0.3s ease;
}

html.dark .hero-form-container {
  background: rgba(30, 41, 59, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.landing-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
}

.form-inputs-row {
  display: flex;
  gap: 16px;
  width: 100%;
  max-width: 600px;
  align-items: flex-start;
}

.form-item-platform {
  flex: 0 0 140px;
  margin-bottom: 0 !important;
}

.form-item-username {
  flex: 1;
  margin-bottom: 0 !important;
}

.form-item-year {
  flex: 0 0 100px;
  margin-bottom: 0 !important;
}

.platform-select .ant-select-selector {
  border: 2px solid var(--color-border);
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.platform-select:hover .ant-select-selector {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(39, 125, 161, 0.1);
}

.platform-select.ant-select-focused .ant-select-selector {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(39, 125, 161, 0.15);
}

.platform-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.platform-logo {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.form-league-row {
  width: 100%;
  max-width: 600px;
  margin-bottom: 16px;
}

.form-item-league {
  margin-bottom: 8px !important;
}

.league-input {
  border-radius: 12px;
  border: 2px solid var(--color-border);
  font-weight: 500;
  transition: all 0.3s ease;
}

.league-input:hover {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(39, 125, 161, 0.1);
}

.league-input:focus,
.league-input.ant-input-focused {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(39, 125, 161, 0.15);
}

.league-help-text {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 4px;
  text-align: center;
}

.username-input {
  border-radius: 12px;
  border: 2px solid var(--color-border);
  font-weight: 500;
  transition: all 0.3s ease;
}

.username-input:hover {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(39, 125, 161, 0.1);
}

.username-input:focus,
.username-input.ant-input-focused {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(39, 125, 161, 0.15);
}

.year-select {
  border-radius: 12px;
}

.year-select .ant-select-selector {
  border: 2px solid var(--color-border);
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.year-select:hover .ant-select-selector {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(39, 125, 161, 0.1);
}

.year-select.ant-select-focused .ant-select-selector {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(39, 125, 161, 0.15);
}

.form-actions-row {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.form-item-primary,
.form-item-demo {
  margin-bottom: 0 !important;
}

.cta-btn-primary {
  background: var(--color-primary);
  border: none;
  border-radius: 16px;
  font-weight: 700;
  font-size: 16px;
  padding: 12px 32px;
  height: auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 8px 24px rgba(39, 125, 161, 0.3);
  transition: all 0.3s ease;
  transform: translateY(0);
}

.cta-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(39, 125, 161, 0.4);
  background: color-mix(in srgb, var(--color-primary) 90%, white);
}

.cta-btn-primary:active {
  transform: translateY(0);
}

.arrow-icon {
  transition: transform 0.3s ease;
}

.cta-btn-primary:hover .arrow-icon {
  transform: translateX(4px);
}

.demo-btn {
  border: 2px solid var(--color-border);
  border-radius: 16px;
  font-weight: 600;
  font-size: 16px;
  padding: 12px 24px;
  height: auto;
  color: var(--color-text);
  transition: all 0.3s ease;
}

.demo-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: rgba(39, 125, 161, 0.05);
}

.form-info {
  display: flex;
  justify-content: center;
}

.info-btn {
  color: var(--color-text-secondary);
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
}

.info-btn:hover {
  color: var(--color-primary);
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 48px;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 900;
  color: var(--color-primary);
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.input-icon {
  color: var(--color-text-secondary);
  transition: color 0.3s ease;
}

/* Card theme support */
:deep(.ant-card) {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
}

:deep(.ant-card-meta-title) {
  color: var(--color-text);
}

:deep(.ant-card-meta-description) {
  color: var(--color-text-secondary);
}

/* Dark theme specific adjustments */
html.dark :deep(.ant-card) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.features-section {
  padding: 80px 0;
  background: var(--color-background);
  transition: background-color 0.3s ease;
}

.features-header {
  text-align: center;
  margin-bottom: 64px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.features-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--color-text);
  margin-bottom: 16px;
  letter-spacing: -1px;
  line-height: 1.2;
  transition: color 0.3s ease;
}

.features-subtitle {
  font-size: 1.2rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  line-height: 1.5;
  margin: 0;
  transition: color 0.3s ease;
}

.responsive-padding {
  padding: 0 100px;
}
.layout {
  min-height: 100vh;
}
.layout {
  flex-direction: column;
  min-height: 100vh;
}
.layout-content {
  margin: 0 auto;
  max-width: 1200px;
  width: 100%;
}
.form-style {
  width: 100%;
  max-width: 400px;
  padding: 25px;
  border-radius: 15px;
}
.logo {
  max-width: 100%;
  height: auto;
  max-height: 100px;
}
.header {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding-bottom: 10px;
}
@media (min-width: 768px) {
  .responsive-padding {
    padding: 0 100px;
  }
}
.message-row {
  margin-bottom: 25px;
}
@media (min-width: 992px) {
  .layout-content {
    padding: 0 200px;
  }
}
.image-cards-col {
  padding-bottom: 20px;
}
/* Mobile Responsive Styles */
@media (max-width: 768px) {
  .hero-section {
    min-height: 500px;
    padding: 60px 16px 40px;
  }

  .hero-title {
    font-size: 2.5rem;
    letter-spacing: -1px;
    margin-bottom: 20px;
  }

  .hero-subtitle {
    font-size: 1.1rem;
    margin-bottom: 32px;
  }

  .hero-form-container {
    padding: 32px 24px;
    margin-bottom: 32px;
  }

  .form-inputs-row {
    flex-direction: column;
    gap: 20px;
    max-width: 100%;
  }

  .form-item-username,
  .form-item-year {
    flex: 1;
  }

  .form-actions-row {
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }

  .cta-btn-primary,
  .demo-btn {
    width: 100%;
    justify-content: center;
  }

  .hero-stats {
    gap: 24px;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .stat-label {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .hero-form-container {
    padding: 24px 20px;
  }

  .hero-stats {
    flex-direction: column;
    gap: 16px;
  }

  .layout-content {
    padding: 0 16px;
  }
}
@media (min-width: 600px) {
  .layout-content {
    padding: 0 50px;
  }
}
@media (min-width: 1200px) {
  .layout-content {
    padding: 0 100px;
  }
}
.site-title {
  display: none; /* Hide old site title in hero */
}
</style>
