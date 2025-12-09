import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useAlertStore } from '@/stores/alertStore'
import { AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AlertContainer() {
  const { alerts, removeAlert } = useAlertStore()

  if (alerts.length === 0) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 space-y-2">
      {alerts.map((alert) => (
        <Alert 
          key={alert.id} 
          variant={alert.variant}
          className="shadow-lg animate-in slide-in-from-top-5 relative pr-12"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription>{alert.description}</AlertDescription>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
            onClick={() => removeAlert(alert.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      ))}
    </div>
  )
}
