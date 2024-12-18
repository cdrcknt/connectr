import { 
    collection, 
    addDoc, 
    query, 
    where, 
    orderBy, 
    limit, 
    getDocs 
} from 'firebase/firestore';
import { db } from '../config/firebase-config.js';

export class MoodService {
    constructor(userId) {
        this.userId = userId;
        this.moodCollection = collection(db, 'moods');
    }

    // Predefined mood types
    static MOOD_TYPES = [
        'Excited', 'Happy', 'Calm', 'Neutral', 
        'Stressed', 'Sad', 'Angry', 'Anxious'
    ];

    // Record user's current mood
    async recordMood(mood, activities = [], notes = '') {
        if (!MoodService.MOOD_TYPES.includes(mood)) {
            throw new Error('Invalid mood type');
        }

        try {
            const moodEntry = {
                userId: this.userId,
                mood,
                activities,
                notes,
                timestamp: new Date()
            };

            return await addDoc(this.moodCollection, moodEntry);
        } catch (error) {
            console.error('Error recording mood:', error);
            throw error;
        }
    }

    // Retrieve recent mood history
    async getMoodHistory(days = 7) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - days);

        const q = query(
            this.moodCollection,
            where('userId', '==', this.userId),
            where('timestamp', '>=', sevenDaysAgo),
            orderBy('timestamp', 'desc')
        );

        try {
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching mood history:', error);
            return [];
        }
    }

    // Get mood statistics
    async getMoodStatistics() {
        const moodHistory = await this.getMoodHistory();
        
        const moodCounts = moodHistory.reduce((acc, entry) => {
            acc[entry.mood] = (acc[entry.mood] || 0) + 1;
            return acc;
        }, {});

        const totalMoods = moodHistory.length;
        const moodPercentages = Object.fromEntries(
            Object.entries(moodCounts).map(([mood, count]) => [
                mood, 
                Math.round((count / totalMoods) * 100)
            ])
        );

        return {
            totalEntries: totalMoods,
            moodCounts,
            moodPercentages,
            mostFrequentMood: this.getMostFrequentMood(moodCounts)
        };
    }

    // Determine most frequent mood
    getMostFrequentMood(moodCounts) {
        return Object.entries(moodCounts).reduce(
            (a, b) => b[1] > a[1] ? b : a
        )[0];
    }

    // Generate mood insights
    async generateMoodInsights() {
        const stats = await this.getMoodStatistics();
        
        return {
            summary: `Over the past week, you've logged ${stats.totalEntries} moods.`,
            predominantMood: `Your most frequent mood was ${stats.mostFrequentMood}.`,
            recommendation: this.generateMoodRecommendation(stats.mostFrequentMood)
        };
    }

    // Generate personalized mood recommendations
    generateMoodRecommendation(predominantMood) {
        const recommendations = {
            'Excited': 'Great energy! Channel it into productive activities.',
            'Happy': 'Maintain your positive mindset and spread joy.',
            'Calm': 'Continue practicing mindfulness and self-care.',
            'Neutral': 'Explore activities that might boost your mood.',
            'Stressed': 'Consider meditation, exercise, or talking to a friend.',
            'Sad': 'Reach out to loved ones or consider professional support.',
            'Angry': 'Practice deep breathing and find healthy outlets.',
            'Anxious': 'Try grounding techniques and limit stressors.'
        };

        return recommendations[predominantMood] || 'Take care of yourself.';
    }
}

export default MoodService;