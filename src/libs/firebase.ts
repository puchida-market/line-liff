import { FirebaseApp, initializeApp } from 'firebase/app'
import { Auth, getAuth } from 'firebase/auth'

let firebaseClient: FirebaseApp
let auth: Auth

if (!window.firebase) {
  firebaseClient = initializeApp({
    apiKey: 'AIzaSyDHE9fVBUM_mto-p_SkWnyKtOiRu8M5F98',
    authDomain: 'react-firebase-farazamiruddin.firebaseapp.com',
    databaseURL: 'https://react-firebase-farazamiruddin.firebaseio.com',
    projectId: 'react-firebase-farazamiruddin',
    storageBucket: 'react-firebase-farazamiruddin.appspot.com',
    messagingSenderId: '338564911587',
    appId: '1:338564911587:web:c34e6fee0ff41bbe7fd0d6'
  })
  ;(window as any).firebase = firebaseClient
  auth = getAuth(firebaseClient)
}

export { firebaseClient, auth }
