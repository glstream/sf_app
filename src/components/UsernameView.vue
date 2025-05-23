<template>
  <a-layout class="layout">
    <theme-toggle-button />
    <AppHeader />

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Fantasy Football League Dashboard</h1>
        <p class="hero-subtitle">
          Enter your Sleeper username to analyze your leagues, discover trade opportunities, and
          optimize your roster with rankings from FantasyCalc, DynastyDaddy, KTC, and more.
        </p>
        <div class="hero-form">
          <a-form
            :model="formState"
            name="basic"
            autocomplete="off"
            @finish="onFinish"
            @finishFailed="onFinishFailed"
            layout="inline"
            class="landing-form"
          >
            <a-form-item
              name="userName"
              :rules="[{ required: true, message: 'Please enter your Sleeper username' }]"
              class="form-item-large"
            >
              <a-input
                v-model:value="formState.userName"
                placeholder="Enter Sleeper Username"
                size="large"
                style="width: 220px"
              >
                <template #prefix>
                  <UserOutlined style="color: rgba(0, 0, 0, 0.25)" />
                </template>
              </a-input>
            </a-form-item>
            <a-form-item
              name="leagueYear"
              :rules="[{ required: true, message: 'Please select a league year' }]"
              class="form-item-large"
            >
              <a-select
                v-model:value="formState.leagueYear"
                placeholder="Year"
                size="large"
                style="width: 120px"
              >
                <a-select-option value="2025">2025</a-select-option>
                <a-select-option value="2024">2024</a-select-option>
                <a-select-option value="2023">2023</a-select-option>
                <a-select-option value="2022">2022</a-select-option>
                <a-select-option value="2021">2021</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item class="form-item-large">
              <a-button
                type="primary"
                html-type="submit"
                size="large"
                :loading="formIsLoading"
                class="cta-btn"
              >
                Load My Leagues
              </a-button>
            </a-form-item>
            <a-form-item class="form-item-large">
              <a-button
                type="default"
                html-type="button"
                size="large"
                :loading="demoFormIsLoading"
                @click="navigateToDemoPage"
              >
                Try Demo
              </a-button>
            </a-form-item>
            <a-form-item>
              <a-button type="text" @click="showModal" style="margin-left: 8px">
                <InfoCircleOutlined />
              </a-button>
              <a-modal v-model:open="open" @ok="handleOk">
                <p>Fantasy Navigator is currently only available for Sleeper leagues.</p>
              </a-modal>
            </a-form-item>
          </a-form>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <a-layout-content class="responsive-padding" :style="{ padding: '0 0px', marginTop: '0px' }">
      <div class="features-header">
        <a-divider>
          <span class="features-title">What Can You Do?</span>
        </a-divider>
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
import { reactive, ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMeta } from '@/composables/useMeta'

// Site tags
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import ThemeToggleButton from '@/components/ThemeToggleButton.vue'

// 3rd Part Utils
import axios from 'axios'
import { UserOutlined, LockOutlined, InfoCircleOutlined, HomeOutlined } from '@ant-design/icons-vue'

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
  leagueYear: userStore.leagueYear || '2025'
})

const onFinish = async (values) => {
  formIsLoading.value = true
  let retryCount = 0

  while (retryCount < 3) {
    try {
      const response = await fetch(`https://api.sleeper.app/v1/user/${formState.userName}`)
      const data = await response.json()

      if (data === null || Object.keys(data).length === 0) {
        throw new Error('Invalid username!')
      }

      const { getOrCreateGUID } = useGuid()
      const userGuid = getOrCreateGUID()

      // Make a POST request to your backend server
      await axios.post(`${apiUrl}/user_details`, {
        league_year: formState.leagueYear,
        user_name: formState.userName,
        guid: userGuid
      })

      console.log('Username submission successful')

      store.setUserDetails(formState.leagueYear, formState.userName, userGuid)
      await fetchLeagues(formState.leagueYear, formState.userName, userGuid)

      // Redirect to the /leagues endpoint
      router.push(`/leagues/${formState.leagueYear}/${formState.userName}/${userGuid}`)

      // Break out of the retry loop if successful
      break
    } catch (error) {
      console.error('Error:', error.message)

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
    'Analyze your Sleeper fantasy football leagues with rankings from FantasyCalc, DynastyDaddy, KTC, and Dynasty Process. Get trade insights, roster optimization and projections from CBS, NFL and ESPN.',
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
        'Analyze your Sleeper fantasy football leagues with rankings from multiple sources. Discover trade opportunities and optimize your roster.'
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
        'Optimize your fantasy football teams with comprehensive analysis and trade insights.'
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
    'A fantasy football analysis tool for Sleeper leagues with rankings from FantasyCalc, DynastyDaddy, Keep Trade Cut, and Dynasty Process along with projections from CBS, NFL and ESPN.',
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
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 0 40px 0;
  position: relative;
  box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.04);
}

.hero-content {
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
}

.hero-title {
  font-size: 2.8rem;
  font-weight: 800;
  color: #2d3142;
  margin-bottom: 18px;
  letter-spacing: -1px;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #495670;
  margin-bottom: 32px;
  font-weight: 400;
}

.hero-form {
  display: flex;
  justify-content: center;
  align-items: center;
}

.landing-form {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.form-item-large {
  margin-bottom: 0 !important;
}

.cta-btn {
  font-weight: 600;
  letter-spacing: 0.5px;
}

.features-header {
  margin-top: 32px;
  margin-bottom: 8px;
  text-align: center;
}

.features-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #2d3142;
  letter-spacing: 0.5px;
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
@media (max-width: 599px) {
  .layout-content {
    padding: 0 20px;
  }
  .hero-title {
    font-size: 2rem;
  }
  .hero-section {
    padding: 32px 0 24px 0;
  }
  .landing-form {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    width: 100%;
    flex-direction: row;
    justify-content: space-between; /* Better distribute items */
  }

  /* Create a proper row for username and year fields */
  .landing-form .form-item-large:nth-child(1),
  .landing-form .form-item-large:nth-child(2) {
    display: inline-flex;
    margin-bottom: 0;
  }

  /* Username field should take up most space, now with info icon */
  .landing-form .form-item-large:nth-child(1) {
    flex: 1 1 auto;
    min-width: 0;
    padding-left: 8px;
    display: flex; /* Make it a flex container for aligning with info button */
    align-items: center;
    position: relative; /* Set as position reference for info button */
  }

  /* Position info button next to username */
  .landing-form .form-item:nth-child(5) {
    position: absolute;
    right: -40px; /* Position it to the right of username field */
    top: 0;
    margin-top: 0;
    height: 40px; /* Match height of input */
  }

  .landing-form .form-item:nth-child(5) button {
    height: 40px;
    width: 32px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Make username input a bit narrower to accommodate info button */
  .landing-form .form-item-large:nth-child(1) .ant-input {
    width: calc(100% - 40px);
  }

  /* Make year dropdown narrower */
  .landing-form .form-item-large:nth-child(2) {
    flex: 0 0 auto; /* Don't grow or shrink */
    width: 80px;
    min-width: 80px; /* Smaller minimum width */
    max-width: 80px; /* Add maximum width constraint */
    padding-right: 8px;
  }

  /* Force the year dropdown to be narrower */
  .landing-form .form-item-large:nth-child(2) .ant-select {
    width: 80px !important;
  }

  /* Create a second row for the buttons - modified to be side by side */
  .landing-form .form-item-large:nth-child(3),
  .landing-form .form-item-large:nth-child(4) {
    flex: 0 0 auto; /* Don't grow, don't shrink, use natural size */
    margin-top: 16px;
    width: auto;
    display: inline-flex;
  }

  /* First button (Load My Leagues) */
  .landing-form .form-item-large:nth-child(3) {
    margin-right: 10px; /* Add spacing between buttons */
  }

  /* Add a flex container to hold buttons on one line */
  .landing-form::after {
    content: '';
    display: flex;
    width: 100%;
    flex-wrap: nowrap;
    justify-content: center; /* Center buttons horizontally */
    gap: 10px;
  }

  /* Info button adjusted to align with buttons */
  .landing-form .form-item:nth-child(5) {
    margin-top: 16px;
    align-self: center;
  }

  /* Ensure buttons are sized properly for mobile */
  .landing-form .cta-btn,
  .landing-form button {
    width: auto;
    padding-left: 15px;
    padding-right: 15px;
  }

  /* Add padding to the form container */
  .hero-form {
    padding: 20px 16px; /* More horizontal padding */
    width: 100%;
    max-width: 100%;
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
