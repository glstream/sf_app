import { onMounted, onUnmounted } from 'vue'

interface MetaInfo {
  title?: string
  description?: string
  meta?: Array<{ [key: string]: string }>
}

export function useMeta(metaInfo: MetaInfo) {
  let existingTags: Element[] = []
  let descriptionTag: HTMLMetaElement | null = null
  let titleTag: HTMLTitleElement | null = null

  const updateMeta = () => {
    // Remove previous tags added by this composable
    existingTags.forEach((tag) => tag.remove())
    existingTags = []

    // Update title
    if (metaInfo.title) {
      titleTag = document.head.querySelector('title')
      if (!titleTag) {
        titleTag = document.createElement('title')
        document.head.appendChild(titleTag)
        existingTags.push(titleTag) // Track if newly created
      }
      titleTag.textContent = metaInfo.title
    }

    // Update description
    if (metaInfo.description) {
      descriptionTag = document.head.querySelector('meta[name="description"]')
      if (!descriptionTag) {
        descriptionTag = document.createElement('meta')
        descriptionTag.setAttribute('name', 'description')
        document.head.appendChild(descriptionTag)
        existingTags.push(descriptionTag) // Track if newly created
      }
      descriptionTag.setAttribute('content', metaInfo.description)
    }

    // Add/Update other meta tags
    if (metaInfo.meta) {
      metaInfo.meta.forEach((tagAttrs) => {
        const keyAttribute = Object.keys(tagAttrs).find((attr) =>
          ['name', 'property', 'http-equiv'].includes(attr)
        )
        const keySelector = keyAttribute
          ? `meta[${keyAttribute}="${tagAttrs[keyAttribute]}"]`
          : null

        let tag: HTMLMetaElement | null = keySelector
          ? document.head.querySelector(keySelector)
          : null

        if (!tag) {
          tag = document.createElement('meta')
          Object.keys(tagAttrs).forEach((attr) => {
            tag!.setAttribute(attr, tagAttrs[attr])
          })
          document.head.appendChild(tag)
          existingTags.push(tag) // Track newly created tags
        } else {
          // Update existing tag attributes if necessary (optional, depends on desired behavior)
          Object.keys(tagAttrs).forEach((attr) => {
            tag!.setAttribute(attr, tagAttrs[attr])
          })
        }
      })
    }
  }

  const cleanupMeta = () => {
    // More robust cleanup: remove only tags added by this instance
    existingTags.forEach((tag) => tag.remove())
    // Optionally reset title/description if they were originally absent
    // This part might need refinement based on how you want cleanup to behave
  }

  onMounted(updateMeta)
  onUnmounted(cleanupMeta)

  // Watch for changes if metaInfo is reactive (optional)
  // watch(metaInfo, updateMeta, { deep: true });
}
