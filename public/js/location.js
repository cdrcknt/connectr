import { doc, updateDoc, GeoPoint } from 'firebase/firestore';
import { db } from '../config/firebase-config.js';
import { auth, googleProvider } from "./firebaseConfig.js";

export class LocationService {
    constructor(userId) {
        this.userId = userId;
        this.watchId = null;
    }

    // Request geolocation permissions and start tracking
    startLocationTracking() {
        if ('geolocation' in navigator) {
            this.watchId = navigator.geolocation.watchPosition(
                this.handleLocationUpdate.bind(this),
                this.handleLocationError.bind(this),
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    }

    // Update user's location in Firestore
    async handleLocationUpdate(position) {
        const { latitude, longitude } = position.coords;

        try {
            const userDocRef = doc(db, 'users', this.userId);
            await updateDoc(userDocRef, {
                location: new GeoPoint(latitude, longitude),
                lastLocationUpdate: new Date()
            });

            console.log('Location updated successfully');
        } catch (error) {
            console.error('Error updating location:', error);
        }
    }

    // Handle geolocation errors
    handleLocationError(error) {
        switch(error.code) {
            case error.PERMISSION_DENIED:
                console.error("User denied the request for Geolocation.");
                break;
            case error.POSITION_UNAVAILABLE:
                console.error("Location information is unavailable.");
                break;
            case error.TIMEOUT:
                console.error("The request to get user location timed out.");
                break;
            case error.UNKNOWN_ERROR:
                console.error("An unknown error occurred.");
                break;
        }
    }

    // Calculate distance between two points
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the Earth in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c; // Distance in kilometers
    }

    // Convert degrees to radians
    deg2rad(deg) {
        return deg * (Math.PI/180);
    }

    // Stop location tracking
    stopLocationTracking() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    }
}

export default LocationService;