import { 
    auth, 
    db, 
    googleProvider 
  } from './firebaseConfig.js';
  import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signInWithPopup,
    onAuthStateChanged 
  } from 'firebase/auth';
  import { 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc 
  } from 'firebase/firestore';
  
  class AuthHandler {
    constructor() {
      this.initializeEventListeners();
      this.setupAuthStateObserver();
    }
  
    initializeEventListeners() {
      // Email Login Form
      const emailLoginForm = document.getElementById('email-login');
      if (emailLoginForm) {
        emailLoginForm.addEventListener('submit', this.handleEmailLogin.bind(this));
      }
  
      // Google Login Button
      const googleLoginBtn = document.getElementById('google-login');
      if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', this.handleGoogleLogin.bind(this));
      }
  
      // Signup Form
      const signupForm = document.getElementById('signup-form');
      if (signupForm) {
        signupForm.addEventListener('submit', this.handleSignup.bind(this));
      }
    }
  
    async handleEmailLogin(event) {
      event.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
  
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update last login in Firestore
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { lastLogin: new Date() });
  
        console.log('Login successful', user);
        window.location.href = '/dashboard.html';
      } catch (error) {
        console.error('Login failed:', error);
        alert(`Login failed: ${error.message}`);
      }
    }
  
    async handleGoogleLogin() {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
  
        // Check if user exists in Firestore, if not create a document
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
  
        if (!userDoc.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || '',
            createdAt: new Date(),
            lastLogin: new Date(),
            profileComplete: false
          });
        } else {
          await updateDoc(userRef, { 
            lastLogin: new Date(),
            displayName: user.displayName || userDoc.data().displayName
          });
        }
  
        console.log('Google login successful', user);
        window.location.href = '/dashboard.html';
      } catch (error) {
        console.error('Google login failed:', error);
        alert(`Google login failed: ${error.message}`);
      }
    }
  
    async handleSignup(event) {
      event.preventDefault();
      const name = document.getElementById('signup-name').value;
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
  
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
  
        // Create user document in Firestore
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: name,
          createdAt: new Date(),
          lastLogin: new Date(),
          profileComplete: false
        });
  
        console.log('Signup successful', user);
        window.location.href = '/dashboard.html';
      } catch (error) {
        console.error('Signup failed:', error);
        alert(`Signup failed: ${error.message}`);
      }
    }
  
    setupAuthStateObserver() {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          console.log('User is signed in:', user);
          // Redirect to dashboard if not already there
          if (window.location.pathname !== '/dashboard.html') {
            window.location.href = '/dashboard.html';
          }
        } else {
          console.log('No user is signed in');
          // Redirect to login page if not already there
          if (window.location.pathname !== '/index.html') {
            window.location.href = '/index.html';
          }
        }
      });
    }
  }
  
  // Initialize the AuthHandler when the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', () => {
    new AuthHandler();
  });
  
  export default AuthHandler;