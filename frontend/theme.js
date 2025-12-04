// 🎨 Theme System - Dark Mode Support

// Get current theme from localStorage or default to light
function getCurrentTheme() {
    return localStorage.getItem('theme') || 'light';
}

// Set theme
function setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') {
        console.error(`Theme ${theme} not supported`);
        return;
    }
    
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f172a' : '#ffffff');
    }
}

// Toggle theme
function toggleTheme() {
    const currentTheme = getCurrentTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

// Initialize theme on page load
function initTheme() {
    const theme = getCurrentTheme();
    document.documentElement.setAttribute('data-theme', theme);
}

// Auto-detect system preference if no theme is set
function autoDetectTheme() {
    if (!localStorage.getItem('theme')) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
    }
}

// Listen for system theme changes
function watchSystemTheme() {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    autoDetectTheme();
    watchSystemTheme();
});

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getCurrentTheme, setTheme, toggleTheme, initTheme };
}
