import { create } from 'zustand'

export const useAlertStore = create((set) => ({
    alerts: [],
    addAlert: (alert) => {
        const id = Date.now()
        set((state) => ({
            alerts: [...state.alerts, { ...alert, id }]
        }))
        // 3秒后自动移除
        setTimeout(() => {
            set((state) => ({
                alerts: state.alerts.filter((a) => a.id !== id)
            }))
        }, 5000)
    },
    removeAlert: (id) => {
        set((state) => ({
            alerts: state.alerts.filter((a) => a.id !== id)
        }))
    },
    clearAlerts: () => set({ alerts: [] })
}))

export const showAlert = (title, description, variant = 'default') => {
    useAlertStore.getState().addAlert({ title, description, variant })
}
