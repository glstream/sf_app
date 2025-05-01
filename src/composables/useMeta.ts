import { onMounted, onUnmounted } from 'vue'

interface MetaOptions {
  title?: string
  description?: string
  meta?: Array<{
    name?: string
    property?: string
    content: string
  }>
}

export function useMeta(options: MetaOptions) {
  const { title, description, meta = [] } = options

  const createdMetaTags: HTMLElement[] = []

  onMounted(() => {
    // Update title
    if (title) {
      document.title = title
    }

    // Update description
    if (description) {
      let descriptionTag = document.querySelector('meta[name="description"]')

      if (!descriptionTag) {
        descriptionTag = document.createElement('meta')
        descriptionTag.setAttribute('name', 'description')
        document.head.appendChild(descriptionTag)
        createdMetaTags.push(descriptionTag as HTMLElement)
      }

      descriptionTag.setAttribute('content', description)
    }

    // Add other meta tags
    meta.forEach((metaInfo) => {
      const metaTag = document.createElement('meta')

      if (metaInfo.name) {
        metaTag.setAttribute('name', metaInfo.name)
      }

      if (metaInfo.property) {
        metaTag.setAttribute('property', metaInfo.property)
      }

      metaTag.setAttribute('content', metaInfo.content)
      document.head.appendChild(metaTag)
      createdMetaTags.push(metaTag)
    })
  })

  // Clean up meta tags when component unmounts
  onUnmounted(() => {
    createdMetaTags.forEach((tag) => {
      if (tag.parentNode) {
        tag.parentNode.removeChild(tag)
      }
    })
  })
}
