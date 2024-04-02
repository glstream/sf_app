// useGuid.ts
import Cookies from 'js-cookie'

export function useGuid() {
  const guidKey = 'userGuid'

  function generateGUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  function getOrCreateGUID(): string {
    let guid = Cookies.get(guidKey)
    if (!guid) {
      guid = generateGUID()
      // Set the cookie to expire in 1 year
      Cookies.set(guidKey, guid, { expires: 365, secure: true, sameSite: 'Strict' })
    }
    // const guid = generateGUID()
    // // Set or update the cookie to expire in 1 year
    // Cookies.set(guidKey, guid, { expires: 365, secure: true, sameSite: 'Strict' })
    return guid
  }

  return {
    getOrCreateGUID
  }
}
