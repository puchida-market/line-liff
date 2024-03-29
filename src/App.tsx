import Loading from '@components/LoadingIndicator'
import liff from '@line/liff'
import axios from 'axios'
import { MouseEvent, useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import toast, { Toaster } from 'react-hot-toast'
import countries from './data/countries.json'
import logo from './amuletdd-logo.jpg'
import { numericCheck } from './utils/validator'

interface LineProfile {
  displayName: string | undefined
  pictureUrl?: string
  userId: string | undefined
  email: string | undefined
}

function App(): JSX.Element {
  const otpInput = useRef<HTMLInputElement>(null)
  const [userProfile, setUserProfile] = useState<LineProfile | null>(null)
  const [hasLinkAccount, setHasLinkAccount] = useState<boolean>(false)
  const [hasRequestOtp, setHasRequestOtp] = useState<boolean>(false)
  const [showLanding, setShowLanding] = useState<boolean>(false)
  const [showLinkAccount, setShowLinkAccount] = useState<boolean>(false)
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  const [otpNumber, setOtpNumber] = useState<string>('')
  const [responseSid, setResponseSid] = useState<string>('')
  const [countryCode, setCountryCode] = useState<string>('+66')

  useEffect(() => {
    const checkLogin = async () => {
      liff
        ?.init({ liffId: import.meta.env.VITE_LIFF_ID })
        .then(async () => {
          if (!liff?.isLoggedIn()) {
            liff?.login()
            return
          }
          const idToken = liff.getIDToken()
          const profile = await liff.getProfile()
          const email = liff.getDecodedIDToken()?.email
          setUserProfile({ ...profile, email })

          try {
            const result = await axios.get(
              `${import.meta.env.VITE_API_URL}/api/line/linkAccountStatus`,
              {
                headers: {
                  Authorization: `Bearer ${idToken}`
                }
              }
            )
            if (result.status === 200) {
              setHasLinkAccount(true)
              setShowLinkAccount(true)
            }
          } catch (error) {
            if (error instanceof Error) {
              console.error(error)
              toast.error(
                'ไม่พบบัญชีผู้ใช้ โปรดลงทะเบียนที่ AmuletDD ก่อนเชื่อมบัญชี Line'
              )
              return
            }
          } finally {
            setShowLanding(true)
          }
        })
        .catch((error) => {
          toast.error(error.message)
          console.error(error)
        })
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
            signal: ac.signal
          })
          .then((otp) => {
            setOtpNumber(String(otp?.code))
          })
          .catch((err) => {
            console.log(err)
          })
      })
    }
  }, [])

  async function requestOtp(
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ): Promise<void> {
    e.preventDefault()
    if (!phoneNumber.length) {
      toast.error('โปรดกรอกหมายเลขมือถือ')
      return
    }
    const toastId = toast.loading('กำลังส่งคำขอ OTP')
    const result = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/line/requestOtp`,
      {
        phoneNumber: `${countryCode}${phoneNumber}`
      }
    )
    if (result?.data?.success) {
      setResponseSid(result?.data?.message)
      toast.success(`ส่งรหัส OTP ไปที่หมายเลข ${phoneNumber} โปรดตรวจสอบ SMS`, {
        id: toastId
      })
      setHasRequestOtp(true)
      otpInput?.current?.focus()
    } else {
      toast.error('ส่งรหัส OTP ล้มเหลว โปรดตรวจสอบหมายเลขมือถือ', {
        id: toastId
      })
    }
  }

  async function verifyOtp(): Promise<void> {
    const result = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/line/verifyOtp`,
      {
        sid: responseSid,
        otp: otpNumber
      }
    )
    if (result?.data?.success) {
      setShowLinkAccount(true)
    } else {
      toast.error('รหัส OTP ไม่ถูกต้อง')
    }
  }

  async function linkAccount(
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ): Promise<void> {
    e.preventDefault()
    const toastId = toast.loading('กำลังเชื่อมต่อบัญชี โปรดรอซักครู่')
    try {
      const result = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/line/linkLineAccount`,
        {
          phoneNumber
        },
        {
          headers: {
            Authorization: `Bearer ${liff.getIDToken()}`
          }
        }
      )
      if (result.status === 204) {
        toast.error(
          'ไม่พบบัญชีนี้ใน AmuletDD โปรดกรอกเบอร์มือถือในบัญชีของท่าน',
          { id: toastId }
        )
        return
      }
      if (result?.status === 200) {
        toast.success('เชื่อมต่อบัญชีสำเร็จ', { id: toastId })
        setHasLinkAccount(true)
        liff.sendMessages([
          {
            type: 'text',
            text: 'คุณได้เชื่อมต่อบัญชี Line กับ AmuletDD เรียบร้อย 😊'
          }
        ])
      } else {
        toast.error(result?.data?.message, { id: toastId })
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        toast.error('ไม่พบบัญชีผู้ใช้ โปรดติดต่อเจ้าหน้าที่สำหรับความช่วยเหลือ')
      }
    }
  }

  async function unlinkAccount(
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ): Promise<void> {
    e.preventDefault()
    try {
      const result = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/line/linkLineAccount`,
        {
          headers: {
            Authorization: `Bearer ${liff.getIDToken()}`
          }
        }
      )
      if (result.status === 204) {
        toast.error('ไม่พบบัญชีนี้ใน AmuletDD')
        return
      }
      if (result?.status === 200) {
        toast.success('ยกเลิกการเชื่อมต่อบัญชีสำเร็จ')
        setShowLinkAccount(true)
        setHasLinkAccount(false)
        liff.sendMessages([
          {
            type: 'text',
            text: 'คุณได้ยกเลิกเชื่อมต่อบัญชี Line กับ AmuletDD 😔'
          }
        ])
      } else {
        toast.error(result?.data?.message)
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error)
        toast.error('ไม่พบบัญชีผู้ใช้ โปรดติดต่อเจ้าหน้าที่สำหรับความช่วยเหลือ')
      }
    }
  }

  function close(): void {
    if (liff) {
      liff.closeWindow()
    }
  }

  return (
    <>
      <Helmet>
        <title>AmuletDD Notify</title>
      </Helmet>
      {!showLanding && (
        <div className="min-h-screen overflow-hidden">
          <Loading />
        </div>
      )}
      <div
        className={`${
          showLanding ? 'block' : 'hidden'
        } min-h-screen h-full overflow-hidden`}
      >
        <div className="flex flex-col px-6 py-12 mx-auto space-y-4 text-center">
          <section className="flex flex-col items-center justify-center space-y-2">
            <div className="flex justify-center">
              <img src={logo} alt="logo" className="object-cover" width={120} />
            </div>
            <h2 className="py-4 text-2xl font-bold">
              {hasLinkAccount
                ? 'เชื่อมบัญชี Line สำเร็จ'
                : 'เชื่อมบัญชี Line ไปที่ AmuletDD'}
            </h2>
            {hasLinkAccount ? (
              <div className="relative flex items-center justify-center text-green-700 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-24 h-24"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
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
                src={userProfile?.pictureUrl ?? '/images/default.png'}
                alt="line profile image"
              />
            )}
            <p className="text-lg text-center text-gray-700">
              {hasLinkAccount ? (
                <>
                  <button
                    onClick={(e) => unlinkAccount(e)}
                    className="btn-secondary"
                  >
                    ยกเลิกเชื่อมต่อบัญชี
                  </button>
                </>
              ) : (
                userProfile?.displayName
              )}
            </p>
          </section>
          {!showLinkAccount ? (
            <>
              <h3 className="text-lg font-medium text-warm-gray-900">
                {!hasRequestOtp
                  ? 'กรอกหมายเลขมือถือ ที่สมัครใช้งานบน AmuletDD'
                  : 'กรอกรหัส OTP 6 หลัก'}
              </h3>
              <form className="h-full px-6 space-y-4">
                {!hasRequestOtp ? (
                  <>
                    <div className="mx-auto max-w-sm">
                      <label htmlFor="phone-number" className="sr-only">
                        เบอร์มือถือ
                      </label>
                      <div className="relative mt-1 rounded">
                        <div className="absolute inset-y-0 left-0 flex items-center border-r border-gray-300">
                          <label htmlFor="country" className="sr-only">
                            รหัสประเทศ
                          </label>
                          <select
                            id="country"
                            name="country"
                            defaultValue="+66"
                            onChange={(e) =>
                              setCountryCode(e.currentTarget.value)
                            }
                            className="h-full py-0 pl-3 pr-3 text-gray-800 bg-transparent border-transparent rounded focus:ring-0 focus:border-transparent sm:text-sm"
                          >
                            {countries.map((country) => {
                              return (
                                <option
                                  key={country.isoCode}
                                  value={country.dialCode}
                                >
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
                          onKeyUp={(e) => numericCheck(e, false)}
                          onChange={(e) =>
                            setPhoneNumber(e.currentTarget.value)
                          }
                          autoComplete="tel-local"
                          className="text-center input-text"
                          placeholder="081 111 1111"
                        />
                      </div>
                    </div>

                    <div>
                      <button
                        disabled={phoneNumber.length < 10}
                        onClick={(e) => requestOtp(e)}
                        className={
                          phoneNumber.length < 10
                            ? 'btn-disabled'
                            : 'btn-primary'
                        }
                      >
                        ขอรหัส OTP
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mx-auto max-w-sm">
                      <label htmlFor="otp" className="sr-only">
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
                          onKeyUp={(e) => numericCheck(e, false)}
                          onChange={(e) => setOtpNumber(e.currentTarget.value)}
                          className="text-center input-text"
                        />
                      </div>
                    </div>
                    <div>
                      <button
                        disabled={otpNumber.length < 6}
                        onClick={(e) => {
                          e.preventDefault()
                          verifyOtp()
                        }}
                        className={
                          otpNumber.length < 6 ? 'btn-disabled' : 'btn-primary'
                        }
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
                <button
                  onClick={(e) => linkAccount(e)}
                  className="btn-secondary"
                >
                  เชื่อมต่อบัญชี
                </button>
              )}
            </section>
          )}
        </div>
      </div>
      <footer className="w-full mt-auto mb-8 text-center safe-area-bottom">
        <button className="btn-light" onClick={() => close()}>
          ปิดหน้านี้
        </button>
      </footer>
      <Toaster position="top-center" />
    </>
  )
}

export default App
