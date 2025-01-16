// firebase.js
import { initializeApp } from '@react-native-firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from '@react-native-firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAtEBPCdClOfCewMbylWd_Us9Ps4Svf9LI",
    authDomain: "smart-transit-67924.firebaseapp.com",
    projectId: "smart-transit-67924",
    storageBucket: "smart-transit-67924.firebasestorage.app",
    messagingSenderId: "213557277357",
    appId: "1:213557277357:web:94671d9c11bc3fccc54c24"
  };
  

 // Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Recaptcha setup
const setupRecaptcha = (containerId) => {
    try {
      const recaptchaVerifier = new RecaptchaVerifier(
        containerId,
        {
          size: 'invisible',
          callback: (response) => {
            console.log('Recaptcha verified:', response);
          },
        },
        auth
      );
      console.log('Recaptcha setup successful');
      return recaptchaVerifier;
    } catch (error) {
      console.error('Recaptcha setup failed:', error);
      return null;
    }
  };
  

export { auth, setupRecaptcha, signInWithPhoneNumber };
