<template>
  <a-layout class="layout">
    <AppHeader />

    <a-layout-content class="responsive-padding">
      <a-breadcrumb style="margin: 16px 0">
        <a-breadcrumb-item><a href="/username">Home</a></a-breadcrumb-item>
      </a-breadcrumb>
      <div class="header">
        <img :src="logo" alt="Fantasy Affect Logo" class="logo" />
      </div>

      <div class="form-container">
        <a-card hoverable style="width: 300px">
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
            <a-form-item
              label=""
              name="userName"
              :rules="[{ required: true, message: 'Please input your userName!' }]"
            >
              <div style="display: flex; align-items: center; gap: 1px">
                <a-input v-model:value="formState.userName" placeholder="Sleeper Username">
                  <template #prefix><UserOutlined style="color: rgba(0, 0, 0, 0.25)" /></template>
                  <a-button type="primary" @click="showModal">Open Modal</a-button>
                </a-input>
                <a-button type="text" @click="showModal"><InfoCircleOutlined /></a-button>
                <a-modal v-model:open="open" @ok="handleOk">
                  <p>Superflex is currently only avilable for sleeper leagues.</p>
                </a-modal>
              </div>
            </a-form-item>
            <a-form-item
              label=""
              name="leagueYear"
              :rules="[{ required: true, message: 'Please select a league year' }]"
            >
              <a-select v-model:value="formState.leagueYear" placeholder="Select a year">
                <a-select-option value="2023">2023</a-select-option>
                <a-select-option value="2022">2022</a-select-option>
                <a-select-option value="2021">2021</a-select-option>
                <!-- Add more years as needed -->
              </a-select>
            </a-form-item>

            <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
              <a-button type="primary" html-type="submit">Submit</a-button>
            </a-form-item>
          </a-form>
        </a-card>
      </div>
    </a-layout-content>
    <AppFooter />
  </a-layout>
</template>
<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

// Site tags
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

// 3rd Part Utils
import axios from 'axios'
import { UserOutlined, LockOutlined, InfoCircleOutlined } from '@ant-design/icons-vue'

// Custom Utils
import { useGuid } from '../utils/guid'
import { useUserStore } from '@/stores/userStore'

import landingPage from '@/assets/landing.webp'
import logo from '@/assets/logo.png'

const open = ref<boolean>(false)

const showModal = () => {
  open.value = true
}

const handleOk = (e: MouseEvent) => {
  console.log(e)
  open.value = false
}

const userStore = useUserStore()
// Example function that would be called when a user submits their details
function updateUserDetails(year, name, guid) {
  userStore.setUserDetails(year, name, guid)
}
const store = useUserStore()
const router = useRouter()

interface FormState {
  userName: string
  leagueYear: string
}

const formState = reactive<FormState>({
  userName: '',
  leagueYear: '2024'
})

const onFinish = async (values: any) => {
  try {
    const { getOrCreateGUID } = useGuid()
    const userGuid = getOrCreateGUID()

    console.log('User GUID:', userGuid)

    // Make a POST request to your backend server
    await axios.post('http://20.242.213.253:3100/user_details', {
      league_year: formState.leagueYear,
      user_name: formState.userName,
      guid: userGuid
    })
    console.log('Username submission successful')
    console.log(formState.userName)

    store.setUserDetails(formState.leagueYear, formState.userName, userGuid)

    // Redirect to the /leagues endpoint
    router.push(`/leagues/${formState.leagueYear}/${formState.userName}/${userGuid}`)
  } catch (error) {
    router.push(`/leagues/${formState.userName}`)
    console.error('Failed to submit userName:', error)
    onFinishFailed(error)
  }
}

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo)
}
</script>
<style>
/* Basic styling */
.layout {
  min-height: 100vh;
}
.form-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.form-style {
  width: 100%;
  max-width: 400px; /* Adjust based on your preference */
  padding: 25px;
  background-color: white;
  border-radius: 15px;
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
/* This is the base style, for mobile screens */
.responsive-padding {
  padding: 0 16px; /* Small padding for small screens */
}

/* Media query for screens wider than 768px */
@media (min-width: 768px) {
  .responsive-padding {
    padding: 0 100px; /* Larger padding for larger screens */
  }
}
</style>
