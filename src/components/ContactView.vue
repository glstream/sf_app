<template>
  <a-layout class="layout">
    <AppHeader />
    <theme-toggle-button />

    <a-layout-content class="responsive-padding" :style="{ marginTop: '12px' }">
      <a-breadcrumb style="margin: 16px 0">
        <a-breadcrumb-item>
          <a href="/"><home-outlined /></a>
        </a-breadcrumb-item>
        <a-breadcrumb-item>Contact</a-breadcrumb-item>
      </a-breadcrumb>

      <div class="contact-container">
        <div class="contact-header">
          <h1>Contact Me</h1>
          <p>Got a question or idea? Just shoot me an email!</p>
        </div>

        <div class="contact-content">
          <div class="contact-card">
            <div class="contact-icon">
              <mail-outlined />
            </div>
            <h2>Drop me a line</h2>
            <p>
              I built this as a fun side project for the fantasy football community. If something's broken, you have an idea, or just want to chat about fantasy football, feel free to reach out:
            </p>
            <div class="contact-email">
              <a 
                href="mailto:fantasypilot1@gmail.com?subject=Fantasy Navigator"
                class="email-link"
              >
                fantasypilot1@gmail.com
              </a>
            </div>
            <p class="contact-note">
              I'll get back to you when I can - this is just me running things solo!
            </p>
          </div>

          <div class="contact-info">
            <h3>What's on your mind?</h3>
            <ul class="help-topics">
              <li>Something's not working right</li>
              <li>Cool feature idea</li>
              <li>Data looks weird</li>
              <li>Just wanted to say thanks</li>
              <li>General fantasy football chat</li>
            </ul>
          </div>
        </div>
      </div>
    </a-layout-content>

    <AppFooter />
  </a-layout>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import ThemeToggleButton from '@/components/ThemeToggleButton.vue'
import { HomeOutlined, MailOutlined } from '@ant-design/icons-vue'

onMounted(() => {
  window.scrollTo(0, 0)
})
</script>

<style scoped>
.layout {
  min-height: 100vh;
  background-color: var(--color-background-soft);
}

@media (max-width: 440px) {
  .responsive-padding {
    padding: 0 12px;
  }
}

@media (min-width: 440px) {
  .responsive-padding {
    padding: 0 100px;
  }
}

.contact-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px 0;
}

.contact-header {
  text-align: center;
  margin-bottom: 40px;
}

.contact-header h1 {
  font-size: 2.5rem;
  color: var(--color-heading);
  margin-bottom: 16px;
  font-weight: 600;
}

.contact-header p {
  font-size: 1.2rem;
  color: var(--color-text-secondary);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.contact-content {
  display: grid;
  gap: 32px;
}

.contact-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.contact-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.contact-icon {
  font-size: 3rem;
  color: var(--ant-primary-color, #277da1);
  margin-bottom: 24px;
}

.contact-card h2 {
  font-size: 1.8rem;
  color: var(--color-heading);
  margin-bottom: 16px;
  font-weight: 600;
}

.contact-card p {
  color: var(--color-text);
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 24px;
}

.contact-email {
  margin: 32px 0;
}

.email-link {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--ant-primary-color, #277da1);
  text-decoration: none;
  padding: 12px 24px;
  border: 2px solid var(--ant-primary-color, #277da1);
  border-radius: 8px;
  display: inline-block;
  transition: all 0.3s ease;
}

.email-link:hover {
  background: var(--ant-primary-color, #277da1);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(39, 125, 161, 0.3);
}

.contact-note {
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  font-style: italic;
  margin-top: 24px;
  margin-bottom: 0 !important;
}

.contact-info {
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 32px;
}

.contact-info h3 {
  font-size: 1.4rem;
  color: var(--color-heading);
  margin-bottom: 20px;
  font-weight: 600;
}

.help-topics {
  list-style: none;
  padding: 0;
}

.help-topics li {
  padding: 12px 0;
  color: var(--color-text);
  font-size: 1.1rem;
  border-bottom: 1px solid var(--color-border);
  position: relative;
  padding-left: 24px;
}

.help-topics li:last-child {
  border-bottom: none;
}

.help-topics li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--ant-primary-color, #277da1);
  font-weight: bold;
}

@media (max-width: 768px) {
  .contact-header h1 {
    font-size: 2rem;
  }
  
  .contact-header p {
    font-size: 1.1rem;
  }
  
  .contact-card {
    padding: 24px;
  }
  
  .contact-info {
    padding: 24px;
  }
  
  .email-link {
    font-size: 1.2rem;
    padding: 10px 20px;
  }
}
</style>