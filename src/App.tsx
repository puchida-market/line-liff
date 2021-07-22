import React, { useEffect, useState } from 'react'
import liff from '@line/liff'
import './App.css'

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

// const liff = window.liff

function App() {
  const [userProfile, setUserProfile] = useState<LineProfile>({})

  useEffect(() => {
    if (liff) {
      ;(async () => {
        try {
          await liff?.init({ liffId: '1655232598-75GlOzq5' })
        } catch (error) {
          console.error('liff init error', error.message)
        }

        if (liff?.isLoggedIn()) {
          console.log('login')
          console.log(liff)
          await liff.ready
          let getProfile: LineProfile = await liff.getProfile()
          const email = liff.getDecodedIDToken()?.email
          console.log(getProfile)
          setUserProfile({ ...getProfile, email })
        } else {
          liff?.login()
        }
      })()
    }
  }, [])

  // const showDisplayName = () => {
  //   if (!isLoggedIn) {
  //     return (
  //       <button className="App-button" onClick={() => liff.login()}>
  //         Login
  //       </button>
  //     )
  //   }
  //   return (
  //     <>
  //       <p>Welcome to the react-liff demo app, {displayName}!</p>
  //       <button className="App-button" onClick={() => liff.logout()}>
  //         Logout
  //       </button>
  //     </>
  //   )
  // }

  return (
    <div className="App">
      <header className="App-header">
        <p>Name: {userProfile?.displayName}</p>
        <p>Line ID: {userProfile?.userId}</p>
        <p>Email: {userProfile?.email}</p>
        <img alt="pic" src={userProfile?.pictureUrl} />
      </header>
    </div>
  )
}

export default App
