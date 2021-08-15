import { useEffect, useState } from 'react'
import { useCookieConsent } from 'use-cookie-consent'
import liff from '@line/liff'

declare global {
  interface Window {
    liff: any
  }
}

interface LineProfile {
  displayName?: string | undefined
  pictureUrl?: string | undefined
  userId?: string | undefined
  email?: string | undefined
}

function App() {
  const [userProfile, setUserProfile] = useState<LineProfile>({})
  const { consent, acceptAllCookies } = useCookieConsent()

  useEffect(() => {
    if (liff) {
      ;(async () => {
        await liff?.init({ liffId: '1655232598-75GlOzq5' })
        if (!liff?.isLoggedIn()) {
          liff?.login()
          return
        }

        console.log(liff)
        await liff.ready
        const token = liff.getAccessToken()
        console.log(token)
        // TODO: add loading screen
        let getProfile: LineProfile = await liff.getProfile()
        const email = liff.getDecodedIDToken()?.email
        console.log(getProfile)
        setUserProfile({ ...getProfile, email })
        // TODO: remove loading screen
      })()
    }
  }, [])

  function logOut(): void {
    window?.liff.logout()
    window.location.reload()
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>Name: {userProfile?.displayName}</p>
        <p>LID: {userProfile?.userId}</p>
        <p>Email: {userProfile?.email}</p>
        <img alt="pic" src={userProfile?.pictureUrl} />
        <button className="px-8 py-2 font-bold text-center text-gray-700 bg-gray-50 hover:red-700" id="btnLogOut" onClick={() => logOut()}>
          Log out
        </button>
      </header>
      <footer className="w-full bg-gray-50">
        <h3>Cookie: {consent.firstParty ? 'Accepted' : 'Rejected'}</h3>
        <p>{JSON.stringify(consent)}</p>
        {!consent.firstParty && <button onClick={() => acceptAllCookies()}>Accept All Cookies</button>}
      </footer>
    </div>
  )
}

export default App
