import { useEffect, useState } from 'react'
import liff from '@line/liff'
import logo from './logo.svg'

interface LineProfile {
  displayName: string | undefined
  pictureUrl?: string
  userId: string | undefined
  email: string | undefined
}

function App(): JSX.Element {
  const [userProfile, setUserProfile] = useState<LineProfile | null>(null)

  useEffect(() => {
    const checkLogin = async () => {
      await liff?.init({ liffId: '1655232598-75GlOzq5' })
      if (!liff?.isLoggedIn()) {
        liff?.login()
        return
      }

      console.log(liff)
      await liff.ready
      const token = liff.getAccessToken()
      console.log(token)
      const idToken = liff.getIDToken()
      console.log(idToken)
      // TODO: add loading screen
      const getProfile = await liff.getProfile()
      const email = liff.getDecodedIDToken()?.email
      console.log(getProfile)
      setUserProfile({ ...getProfile, email })
      // TODO: remove loading screen
    }
    if (liff) {
      checkLogin()
    }
  }, [])

  function close(): void {
    if (liff) {
      liff.closeWindow()
    }
  }

  return (
    <div className="h-screen bg-white">
      <div className="flex flex-col px-6 py-12 mx-auto space-y-4 text-center">
        <div className="flex justify-center">
          <img src={logo} alt="logo" className="object-cover" width={120} />
        </div>
        <h2 className="py-4 text-2xl font-bold text-gray-900">
          <span className="block">ต้องการเชื่อมต่อบัญชีนี้?</span>
        </h2>
        <div className="flex flex-col items-center justify-center h-full space-y-2">
          <img className="inline-block w-24 h-24 bg-gray-100 rounded-full" src={userProfile?.pictureUrl ?? ''} alt="line profile image" />
          <p>{userProfile?.displayName}</p>
          <p>LID: {userProfile?.userId}</p>
          <p>Email: {userProfile?.email}</p>
        </div>
        <h3 className="text-lg font-medium text-warm-gray-900">กรอกหมายเลขมือถือ</h3>
        <form className="flex-1 h-full max-w-sm px-6 space-y-4">
          <div>
            <label htmlFor="phone-number" className="sr-only">
              Phone Number
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 flex items-center">
                <label htmlFor="country" className="sr-only">
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  className="h-full py-0 pl-3 text-gray-700 bg-transparent border-transparent rounded-md focus:ring-0 focus:border-transparent pr-7 sm:text-sm"
                >
                  <option>+66</option>
                </select>
              </div>
              <input
                type="tel"
                inputMode="tel"
                name="phone-number"
                id="phone-number"
                maxLength={10}
                className="block w-full pl-16 border-gray-300 placeholder-gray-300 tracking-wider rounded-md focus:ring-[#b22222] focus:border-[#b22222] sm:text-sm"
                placeholder="081 111 1111"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="inline-flex items-center justify-center px-12 py-2 text-base font-medium text-white shadow bg-[#820002] border border-transparent rounded hover:bg-[#3b0d00]"
            >
              ขอรหัส OTP
            </button>
          </div>
        </form>
        <footer className="mt-auto">
          <button className="px-8 py-2 font-bold text-center text-gray-700 bg-gray-300 shadow hover:bg-gray-700" id="btnLogOut" onClick={() => close()}>
            ปิดหน้านี้
          </button>
        </footer>
      </div>
    </div>
  )
}

export default App
