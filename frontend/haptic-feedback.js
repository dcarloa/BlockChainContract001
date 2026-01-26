/**
 * Haptic Feedback & Sound System
 * Provides subtle vibrations and sounds for better UX on PWA
 * 
 * @version 1.0.0
 */

const HapticFeedback = {
    // Settings (can be toggled by user)
    enabled: true,
    soundEnabled: true,
    
    // Vibration patterns (in milliseconds)
    patterns: {
        light: [10],           // Very subtle tap
        medium: [20],          // Normal feedback
        success: [10, 50, 20], // Success pattern
        error: [50, 30, 50],   // Error pattern
        chest: [20, 40, 20, 40, 30], // Chest opening excitement
        reward: [15, 30, 15, 30, 15, 30, 50] // Getting a reward
    },
    
    // Sound effects (using Web Audio API for tiny sounds)
    audioContext: null,
    
    /**
     * Initialize the feedback system
     */
    init() {
        // Load user preferences
        const hapticPref = localStorage.getItem('antpool_haptic_enabled');
        const soundPref = localStorage.getItem('antpool_sound_enabled');
        
        this.enabled = hapticPref !== 'false';
        this.soundEnabled = soundPref !== 'false';
        
        // Initialize AudioContext on first user interaction
        document.addEventListener('click', () => this.initAudio(), { once: true });
        document.addEventListener('touchstart', () => this.initAudio(), { once: true });
        
        console.log('✅ Haptic Feedback System initialized');
    },
    
    /**
     * Initialize Web Audio API
     */
    initAudio() {
        if (this.audioContext) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('✅ Audio Context initialized');
        } catch (e) {
            console.warn('⚠️ Web Audio API not supported');
        }
    },
    
    /**
     * Vibrate the device
     * @param {string} type - Pattern type: light, medium, success, error, chest, reward
     */
    vibrate(type = 'light') {
        if (!this.enabled) return;
        if (!navigator.vibrate) return;
        
        const pattern = this.patterns[type] || this.patterns.light;
        
        try {
            navigator.vibrate(pattern);
        } catch (e) {
            // Vibration not supported or not allowed
        }
    },
    
    /**
     * Play a subtle sound effect
     * @param {string} type - Sound type: tap, success, error, coin, chest, pop
     */
    playSound(type = 'tap') {
        if (!this.soundEnabled) return;
        if (!this.audioContext) return;
        
        try {
            const ctx = this.audioContext;
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            // Configure sound based on type
            switch (type) {
                case 'tap':
                    oscillator.frequency.value = 800;
                    gainNode.gain.setValueAtTime(0.03, ctx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
                    oscillator.start(ctx.currentTime);
                    oscillator.stop(ctx.currentTime + 0.05);
                    break;
                    
                case 'success':
                    oscillator.frequency.value = 880;
                    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
                    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
                    oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
                    oscillator.start(ctx.currentTime);
                    oscillator.stop(ctx.currentTime + 0.2);
                    break;
                    
                case 'error':
                    oscillator.frequency.value = 200;
                    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
                    oscillator.start(ctx.currentTime);
                    oscillator.stop(ctx.currentTime + 0.15);
                    break;
                    
                case 'coin':
                    oscillator.type = 'sine';
                    oscillator.frequency.value = 1200;
                    gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
                    oscillator.frequency.setValueAtTime(1500, ctx.currentTime + 0.05);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
                    oscillator.start(ctx.currentTime);
                    oscillator.stop(ctx.currentTime + 0.15);
                    break;
                    
                case 'chest':
                    // Magical chest opening sound
                    oscillator.type = 'sine';
                    gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
                    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
                    oscillator.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
                    oscillator.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
                    oscillator.frequency.setValueAtTime(1000, ctx.currentTime + 0.3);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
                    oscillator.start(ctx.currentTime);
                    oscillator.stop(ctx.currentTime + 0.4);
                    break;
                    
                case 'pop':
                    oscillator.type = 'sine';
                    oscillator.frequency.value = 600;
                    gainNode.gain.setValueAtTime(0.03, ctx.currentTime);
                    oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
                    oscillator.start(ctx.currentTime);
                    oscillator.stop(ctx.currentTime + 0.08);
                    break;
                    
                case 'levelup':
                    // Level up / upgrade sound
                    oscillator.type = 'sine';
                    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
                    oscillator.frequency.setValueAtTime(523, ctx.currentTime); // C5
                    oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.1); // E5
                    oscillator.frequency.setValueAtTime(784, ctx.currentTime + 0.2); // G5
                    oscillator.frequency.setValueAtTime(1047, ctx.currentTime + 0.3); // C6
                    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
                    oscillator.start(ctx.currentTime);
                    oscillator.stop(ctx.currentTime + 0.5);
                    break;
            }
        } catch (e) {
            // Sound playback failed silently
        }
    },
    
    /**
     * Combined feedback for common actions
     */
    
    // Light tap feedback (for normal buttons)
    tap() {
        this.vibrate('light');
    },
    
    // Success feedback (for completed actions)
    success() {
        this.vibrate('success');
        this.playSound('success');
    },
    
    // Error feedback
    error() {
        this.vibrate('error');
        this.playSound('error');
    },
    
    // Button click (subtle)
    buttonClick() {
        this.vibrate('light');
        this.playSound('tap');
    },
    
    // Expense added
    expenseAdded() {
        this.vibrate('medium');
        this.playSound('coin');
    },
    
    // Chest opening
    chestOpen() {
        this.vibrate('chest');
        this.playSound('chest');
    },
    
    // Got a reward
    reward() {
        this.vibrate('reward');
        this.playSound('levelup');
    },
    
    // Item equipped
    itemEquipped() {
        this.vibrate('light');
        this.playSound('pop');
    },
    
    // Toggle haptic feedback
    toggleHaptic(enabled) {
        this.enabled = enabled;
        localStorage.setItem('antpool_haptic_enabled', enabled ? 'true' : 'false');
    },
    
    // Toggle sound
    toggleSound(enabled) {
        this.soundEnabled = enabled;
        localStorage.setItem('antpool_sound_enabled', enabled ? 'true' : 'false');
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    HapticFeedback.init();
});

// Export globally
window.HapticFeedback = HapticFeedback;
