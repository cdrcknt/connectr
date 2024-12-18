import { auth, db } from './firebaseConfig.js';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

class Dashboard {
    constructor() {
        this.user = null;
        this.initElements();
        this.setupEventListeners();
        this.checkAuthState();
    }

    initElements() {
        this.logoutBtn = document.getElementById('logout-btn');
        this.userAvatar = document.getElementById('user-avatar');
        this.userName = document.getElementById('user-name');
        this.contentArea = document.getElementById('content-area');
        this.navLinks = {
            profile: document.getElementById('nav-profile'),
            connections: document.getElementById('nav-connections'),
            mood: document.getElementById('nav-mood'),
            settings: document.getElementById('nav-settings')
        };
    }

    setupEventListeners() {
        this.logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        
        Object.entries(this.navLinks).forEach(([key, element]) => {
            element.addEventListener('click', () => this.loadContent(key));
        });
    }

    checkAuthState() {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                this.user = user;
                await this.loadUserProfile();
            } else {
                window.location.href = '/index.html';
            }
        });
    }

    async loadUserProfile() {
        try {
            const userDocRef = doc(db, 'users', this.user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                this.userName.textContent = userData.name;
                this.userAvatar.src = userData.photoURL || 'default-avatar.png';
            }
        } catch (error) {
            console.error("Error loading user profile:", error);
        }
    }

    async handleLogout() {
        try {
            await signOut(auth);
            window.location.href = '/index.html';
        } catch (error) {
            console.error("Logout Error:", error);
        }
    }

    loadContent(section) {
        switch(section) {
            case 'profile':
                this.renderProfileContent();
                break;
            case 'connections':
                this.renderConnectionsContent();
                break;
            case 'mood':
                this.renderMoodTrackerContent();
                break;
            case 'settings':
                this.renderSettingsContent();
                break;
        }
    }

    renderProfileContent() {
        this.contentArea.innerHTML = `
            <h2>Your Profile</h2>
            <div id="profile-details">
                <!-- Profile details will be dynamically populated -->
            </div>
        `;
    }

    renderConnectionsContent() {
        this.contentArea.innerHTML = `
            <h2>Connections</h2>
            <div id="connections-list">
                <!-- Nearby connections will be listed here -->
            </div>
        `;
    }

    renderMoodTrackerContent() {
        this.contentArea.innerHTML = `
            <h2>Mood Tracker</h2>
            <div id="mood-selector">
                <!-- Mood selection interface -->
            </div>
        `;
    }

    renderSettingsContent() {
        this.contentArea.innerHTML = `
            <h2>Account Settings</h2>
            <form id="settings-form">
                <input type="text" id="name-update" placeholder="Update Name">
                <button type="submit">Update Profile</button>
            </form>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => new Dashboard());

export default Dashboard;