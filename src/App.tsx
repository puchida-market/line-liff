import { useEffect, useRef, useState, MouseEvent } from 'react'
import liff from '@line/liff'
import logo from './logo.svg'
import countries from './data/countries.json'
import { Helmet } from 'react-helmet-async'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { numericCheck } from './utils/validator'

interface LineProfile {
  displayName: string | undefined
  pictureUrl?: string
  userId: string | undefined
  email: string | undefined
}

const client = axios.create({
  baseURL: 'http://localhost:5001/puchida-develop/asia-southeast1',
})

function App(): JSX.Element {
  const otpInput = useRef<HTMLInputElement>(null)
  const [userProfile, setUserProfile] = useState<LineProfile | null>(null)
  const [hasLinkAccount, setHasLinkAccount] = useState<boolean>(false)
  const [hasRequestOtp, setHasRequestOtp] = useState<boolean>(false)
  const [showLinkAccount, setShowLinkAccount] = useState<boolean>(true)
  const [phoneNumber, setPhoneNumber] = useState<string>('0863613535')
  const [otpNumber, setOtpNumber] = useState<string>('')
  const [responseSid, setResponseSid] = useState<string>('')
  const [countryCode, setCountryCode] = useState<string>('+66')

  useEffect(() => {
    if (otpNumber.length === 6) {
      verifyOtp()
    }
  }, [otpNumber])

  useEffect(() => {
    const checkLogin = async () => {
      await liff?.init({ liffId: '1655232598-75GlOzq5' })
      if (!liff?.isLoggedIn()) {
        liff?.login()
        return
      }

      await liff.ready
      const idToken = liff.getIDToken()
      console.log(idToken)
      try {
        const toastId = toast.loading('กำลังโหลดข้อมูล')
        const result = await client.get('/linkAccountStatus', {
          headers: {
            Authorization: `Bearer ${liff.getIDToken()}`,
          },
        })
        toast.dismiss(toastId)
        if (result.status === 200) {
          setHasLinkAccount(true)
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(error)
          toast.error(error.message)
        }
      }
      // TODO: add loading screen
      const getProfile = await liff.getProfile()
      const email = liff.getDecodedIDToken()?.email
      setUserProfile({ ...getProfile, email })
      // TODO: remove loading screen
    }
    if (liff) {
      checkLogin()
    }

    // Feature detection
    if ('OTPCredential' in window) {
      window.addEventListener('DOMContentLoaded', () => {
        if (!otpInput) return
        // Cancel the WebOTP API if the form is submitted manually.
        const ac = new AbortController()
        const form = otpInput?.current?.closest('form')
        if (form) {
          form.addEventListener('submit', () => {
            // Cancel the WebOTP API.
            ac.abort()
          })
        }
        // Invoke the WebOTP API
        navigator.credentials
          .get({
            otp: { transport: ['sms'] },
            signal: ac.signal,
          })
          .then((otp) => {
            setOtpNumber(String(otp?.code))
            // Automatically submit the form when an OTP is obtained.
            // if (form) form.submit()
          })
          .catch((err) => {
            console.log(err)
          })
      })
    }
  }, [])

  async function requestOtp(e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>): Promise<void> {
    e.preventDefault()
    const toastId = toast.loading('กำลังส่งคำขอ OTP')
    const result = await client.post('/requestOtp', {
      phoneNumber: `${countryCode}${phoneNumber}`,
    })
    if (result?.data?.success) {
      setResponseSid(result?.data?.message?.sid)
      toast.success(`ส่งรหัส OTP ไปที่หมายเลข ${phoneNumber} โปรดตรวจสอบ SMS`, { id: toastId })
      setHasRequestOtp(true)
      otpInput?.current?.focus()
    } else {
      toast.error('ส่งรหัส OTP ล้มเหลว โปรดตรวจสอบหมายเลขมือถือ', { id: toastId })
    }
  }

  async function verifyOtp(): Promise<void> {
    const toastId = toast.loading('ระบบกำลังตรวจสอบ OTP')
    const result = await client.post('/verifyOtp', {
      sid: responseSid,
      otp: otpNumber,
    })
    if (result?.data?.success) {
      toast.success(`ยืนยันหมายเลขมือถือสำเร็จ`, { id: toastId })
      setShowLinkAccount(true)
    } else {
      toast.error('รหัส OTP ไม่ถูกต้อง', { id: toastId })
    }
  }

  async function linkAccount(e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>): Promise<void> {
    e.preventDefault()
    const toastId = toast.loading('กำลังเชื่อมต่อบัญชีปูชิดา โปรดรอซักครู่')
    try {
      const result = await client.post(
        '/linkLineAccount',
        {
          phoneNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${liff.getIDToken()}`,
          },
        }
      )
      if (result?.data?.success) {
        toast.success('เชื่อมต่อบัญชีสำเร็จ', { id: toastId })
        setHasLinkAccount(true)
      } else {
        toast.error(result?.data?.message, { id: toastId })
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        toast.error(error.message)
      }
    }
  }

  function close(): void {
    if (liff) {
      liff.closeWindow()
      liff.logout()
      window.location.reload()
    }
  }

  return (
    <>
      <Helmet>
        <title>Puchida Link Account</title>
      </Helmet>
      <div className="h-screen bg-white">
        <div className="flex flex-col px-6 py-12 mx-auto space-y-4 text-center">
          <section className="flex flex-col items-center justify-center flex-1 h-full space-y-2">
            <div className="flex justify-center">
              <img src={logo} alt="logo" className="object-cover" width={120} />
            </div>
            <h2 className="py-4 text-2xl font-bold text-gray-700">{hasLinkAccount ? 'เชื่อมบัญชี Line สำเร็จ' : 'เชื่อมบัญชี Line ไปที่ปูชิดา'}</h2>
            {hasLinkAccount ? (
              <div className="relative flex items-center justify-center text-green-300 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            ) : (
              <img
                className="inline-block w-24 h-24 bg-gray-100 rounded-full"
                src={userProfile?.pictureUrl ?? './assets/default.png'}
                alt="line profile image"
              />
            )}
            <p className="text-lg text-center text-gray-500">{hasLinkAccount ? 'โปรดปิดหน้าต่างนี้' : userProfile?.displayName}</p>
          </section>
          {!showLinkAccount ? (
            <>
              <h3 className="text-lg font-medium text-warm-gray-900">กรุณากรอกหมายเลขมือถือ เพื่อรับรหัส OTP</h3>
              <form className="flex-1 h-full max-w-sm px-6 space-y-4">
                {!hasRequestOtp ? (
                  <>
                    <div>
                      <label htmlFor="phone-number" className="sr-only">
                        Phone Number
                      </label>
                      <div className="relative mt-1 rounded">
                        <div className="absolute inset-y-0 left-0 flex items-center border-r border-gray-300">
                          <label htmlFor="country" className="sr-only">
                            Country
                          </label>
                          <select
                            id="country"
                            name="country"
                            defaultValue="+66"
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="h-full py-0 pl-3 pr-3 text-gray-700 bg-transparent border-transparent rounded focus:ring-0 focus:border-transparent sm:text-sm"
                          >
                            {countries.map((country) => {
                              return (
                                <option key={country.isoCode} value={country.dialCode}>
                                  {country.isoCode} {country.dialCode}
                                </option>
                              )
                            })}
                          </select>
                        </div>
                        <input
                          type="tel"
                          inputMode="tel"
                          name="phone-number"
                          id="phone-number"
                          maxLength={12}
                          required
                          onKeyPress={(e) => numericCheck(e, true)}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          autoComplete="tel-local"
                          className="pl-28 input-text"
                          placeholder="081 111 1111"
                        />
                      </div>
                    </div>

                    <div>
                      <button onClick={(e) => requestOtp(e)} className="btn-primary">
                        ขอรหัส OTP
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label htmlFor="otp" className="block text-sm text-gray-700 md:text-base">
                        รหัส OTP 6 หลัก
                      </label>
                      <div className="relative mt-1 rounded">
                        <input
                          ref={otpInput}
                          id="otp"
                          name="otp"
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          pattern="\d{6}"
                          required
                          value={otpNumber}
                          onKeyPress={(e) => numericCheck(e, true)}
                          onChange={(e) => setOtpNumber(e.target.value)}
                          className="text-center input-text"
                        />
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          verifyOtp()
                        }}
                        className="btn-primary"
                      >
                        ยืนยันรหัส OTP
                      </button>
                    </div>
                  </>
                )}
              </form>
            </>
          ) : (
            <section>
              {!hasLinkAccount && (
                <button onClick={(e) => linkAccount(e)} className="btn-secondary">
                  เชื่อมต่อบัญชี
                </button>
              )}
            </section>
          )}
        </div>
        <footer className="fixed bottom-0 w-full mb-8 text-center">
          <button className="px-8 py-3 font-bold text-center text-gray-700 bg-gray-300 rounded shadow hover:bg-gray-700" id="btnLogOut" onClick={() => close()}>
            ปิดหน้านี้
          </button>
        </footer>
      </div>
      <Toaster position="top-center" />
    </>
  )
}

export default App
