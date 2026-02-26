<template>
  <div v-if="false"></div>
</template>

<script setup>
import { onMounted, watch } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Fantasy Navigator - Fantasy Football Analytics & Tools'
  },
  description: {
    type: String,
    default: 'Free fantasy football analytics tools including trade calculator, player rankings, league analysis, and team evaluation. Expert data from multiple sources for dynasty and redraft leagues.'
  },
  keywords: {
    type: String,
    default: 'fantasy football, dynasty league, trade calculator, player rankings, fantasy analytics, sleeper, fleaflicker, MFL'
  },
  structuredData: {
    type: Object,
    default: null
  }
})

// Update page title and meta tags
const updateSEO = () => {
  // Update title
  document.title = props.title
  
  // Update or create meta tags
  const updateMeta = (name, content, property = false) => {
    const attribute = property ? 'property' : 'name'
    let meta = document.querySelector(`meta[${attribute}="${name}"]`)
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute(attribute, name)
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', content)
  }
  
  // Standard meta tags
  updateMeta('description', props.description)
  updateMeta('keywords', props.keywords)
  updateMeta('author', 'Fantasy Navigator')
  updateMeta('robots', 'index, follow')
  
  // Open Graph tags
  updateMeta('og:title', props.title, true)
  updateMeta('og:description', props.description, true)
  updateMeta('og:type', 'website', true)
  updateMeta('og:site_name', 'Fantasy Navigator', true)
  updateMeta('og:image', 'https://fantasynavigator.app/logo4.png', true)
  
  // Twitter Card tags
  updateMeta('twitter:card', 'summary_large_image')
  updateMeta('twitter:title', props.title)
  updateMeta('twitter:description', props.description)
  updateMeta('twitter:image', 'https://fantasynavigator.app/logo4.png')
  
  // Add structured data if provided
  if (props.structuredData || !document.querySelector('script[type="application/ld+json"]')) {
    const structuredData = props.structuredData || {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Fantasy Navigator",
      "description": props.description,
      "url": "https://fantasynavigator.app",
      "applicationCategory": "Sports",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "author": {
        "@type": "Person",
        "name": "Fantasy Navigator Team"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "150"
      },
      "features": [
        "Trade Calculator",
        "Player Rankings", 
        "League Analysis",
        "Team Evaluation",
        "Dynasty Tools"
      ]
    }
    
    let jsonLd = document.querySelector('script[type="application/ld+json"]')
    if (!jsonLd) {
      jsonLd = document.createElement('script')
      jsonLd.type = 'application/ld+json'
      document.head.appendChild(jsonLd)
    }
    jsonLd.textContent = JSON.stringify(structuredData)
  }
}

onMounted(() => {
  updateSEO()
})

watch(() => [props.title, props.description, props.keywords], () => {
  updateSEO()
})
</script>