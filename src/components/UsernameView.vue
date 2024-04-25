<template>
  <a-layout class="layout">
    <AppHeader />

    <a-layout-content class="responsive-padding" :style="{ padding: '0 50px', marginTop: '0px' }">
      <a-breadcrumb style="padding-top: 10px">
        <a-breadcrumb-item>
          <a href="/username"></a>
        </a-breadcrumb-item>
      </a-breadcrumb>
      <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }" justify="center" class="message-row">
        <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="10">
          <a-collapse default-active-key="1">
            <a-collapse-panel header="Welcome to Fantasy Navigator!" key="1">
              <p>
                Your compass for fantasy football success. Navigate your way to victory in both
                Dynasty and Redraft formats with our suite of tools. Utilize our Trade Calculator,
                Rankings, and League Analytics, all powered by popular fantasy markets as our own
                ranks. Enter your Sleeper username below to take a 1,000 foot view of your league.
              </p>
            </a-collapse-panel>
          </a-collapse>
        </a-col>
      </a-row>
      <a-row gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }" justify="space-around">
        <!-- Form Card -->
        <a-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
          <!-- ... -->
          <a-card class="form-card" :bordered="false">
            <template #cover>
              <img
                alt="example"
                :src="landingPage"
                style="width: 100%; height: 300px; object-fit: cover; object-position: center"
              />
            </template>
            <a-form
              :model="formState"
              name="basic"
              autocomplete="off"
              @finish="onFinish"
              @finishFailed="onFinishFailed"
              layout="vertical"
            >
              <a-form-item label="" name="userName" :rules="[{}]">
                <div style="display: flex; align-items: center; gap: 1px">
                  <a-input v-model:value="formState.userName" placeholder="Sleeper Username">
                    <template #prefix><UserOutlined style="color: rgba(0, 0, 0, 0.25)" /></template>
                    <a-button type="primary" @click="showModal">Open Modal</a-button>
                  </a-input>
                  <a-button type="text" @click="showModal"><InfoCircleOutlined /></a-button>
                  <a-modal v-model:open="open" @ok="handleOk">
                    <p>Fantasy Navigator is currently only available for Sleeper leagues.</p>
                  </a-modal>
                </div>
              </a-form-item>

              <a-form-item
                label=""
                name="leagueYear"
                :rules="[{ required: true, message: 'Please select a league year' }]"
                ><span>Year</span>
                <a-select v-model:value="formState.leagueYear" placeholder="Select a year">
                  <a-select-option value="2024">2024</a-select-option>
                  <a-select-option value="2023">2023</a-select-option>
                  <a-select-option value="2022">2022</a-select-option>
                  <a-select-option value="2021">2021</a-select-option>
                  <!-- Add more years as needed -->
                </a-select>
              </a-form-item>

              <a-form-item>
                <a-row :gutter="16">
                  <a-col :span="12">
                    <a-button
                      type="default"
                      html-type="button"
                      :block="true"
                      :loading="demoFormIsLoading"
                      @click="navigateToDemoPage"
                      >Try a Demo</a-button
                    >
                  </a-col>
                  <a-col :span="12">
                    <a-button
                      type="primary"
                      html-type="submit"
                      :block="true"
                      :loading="formIsLoading"
                      >Submit</a-button
                    >
                  </a-col>
                </a-row>
              </a-form-item>
            </a-form>
          </a-card>
        </a-col>
      </a-row>
      <a-divider>Fantasy Navigator Metrics</a-divider>
      <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }" justify="space-around">
        <a-col :xs="24" :sm="12" :md="6" :lg="8" :xl="8" style="padding-top: 20px">
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
                Compare your leagues roster across all rankings sources with custom rankimgs built
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
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// Site tags
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

// 3rd Part Utils
import axios from 'axios'
import { UserOutlined, LockOutlined, InfoCircleOutlined, HomeOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// Custom Utils
import { useGuid } from '../utils/guid'
import { useUserStore } from '@/stores/userStore'

// Image imports
import landingPage from '@/assets/home_page.webp'

// routes and stores
const store = useUserStore()
const router = useRouter()

// const instances
const open = ref<boolean>(false)
const formIsLoading = ref(false)
const demoFormIsLoading = ref(false)
const apiUrl = import.meta.env.VITE_API_URL

interface FormState {
  userName: string
  leagueYear: string
}

onMounted(() => {})

const showModal = () => {
  open.value = true
}
const navigateToDemoPage = () => {
  router.push('/leagues/2024/gray_matter/b114010d-ca3c-4150-b7ac-3b926a1737b1')
}
const handleOk = (e: MouseEvent) => {
  open.value = false
}

const userStore = useUserStore()

function updateUserDetails(year, name, guid) {
  userStore.setUserDetails(year, name, guid)
}

const formState = reactive<FormState>({
  userName: userStore.userName || '',
  leagueYear: userStore.leagueYear || '2024'
})

const onFinish = async (values) => {
  formIsLoading.value = true
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

    // Redirect to the /leagues endpoint
    router.push(`/leagues/${formState.leagueYear}/${formState.userName}/${userGuid}`)
  } catch (error) {
    message.error('Username not found. Please try again.')

    console.error('Error:', error.message)
    onFinishFailed(error)
    formIsLoading.value = false
  } finally {
    formIsLoading.value = false
  }
}

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo)
}
</script>
<style scoped>
.responsive-padding {
  padding: 0 100px;
  background-color: white; /* Replace with your desired color */
}
.layout {
  min-height: 100vh;
}
.layout {
  flex-direction: column;
  min-height: 100vh;
}
.layout-content {
  margin: 0 auto; /* Centers content horizontally */
  max-width: 1200px; /* Maximum width of the content area */
  width: 100%; /* Ensures it takes up the necessary width */
}

.form-style {
  width: 100%;
  max-width: 400px; /* Adjust based on your preference */
  padding: 25px;
  background-color: white;
  border-radius: 15px;
}
.form-card {
  background-color: #white;
}
.logo {
  max-width: 100%; /* Ensures the image is responsive */
  height: auto; /* Maintains aspect ratio */
  max-height: 100px;
}
.header {
  display: flex;
  justify-content: center; /* Center horizontally */
  align-items: center; /* Center vertically */
  width: 100%; /* Take the full width */
  padding-bottom: 10px;
}

/* Media query for screens wider than 768px */
@media (min-width: 768px) {
  .responsive-padding {
    padding: 0 100px; /* Larger padding for larger screens */
  }
}
.message-row {
  margin-bottom: 25px; /* Spacing between the message row and the form row */
}

@media (min-width: 992px) {
  /* Adjust breakpoint as needed */
  .layout-content {
    padding: 0 200px; /* Increase padding on larger screens */
  }
}
.image-cards-col {
  padding-bottom: 20px;
}
@media (max-width: 599px) {
  .layout-content {
    padding: 0 20px; /* Smaller padding on smaller screens */
  }
}

@media (min-width: 600px) {
  .layout-content {
    padding: 0 50px; /* Increased padding for larger screens */
  }
}

@media (min-width: 1200px) {
  .layout-content {
    padding: 0 100px; /* More padding for very large screens */
  }
}
</style>
