const THEME_KEY = 'chat_theme'

// 获取主题
export function getTheme() {
    const saved = localStorage.getItem(THEME_KEY)
    return saved || 'light'
}

// 保存主题
export function saveTheme(theme) {
    localStorage.setItem(THEME_KEY, theme)
}

// 切换主题
export function toggleTheme() {
    const current = getTheme()
    const newTheme = current === 'light' ? 'dark' : 'light'
    saveTheme(newTheme)
    return newTheme
}

// 应用主题到DOM
export function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark')
    } else {
        document.documentElement.classList.remove('dark')
    }
}
