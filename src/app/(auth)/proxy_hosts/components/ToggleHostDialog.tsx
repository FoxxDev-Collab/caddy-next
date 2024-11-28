import { useState } from "react"
import { CaddyHost } from "@/lib/caddy/types"
import { Button } from "@/app/components/ui/button"
import { Spinner } from "@/app/components/ui/spinner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog"

interface ToggleHostDialogProps {
  host: CaddyHost
  onToggle: (host: CaddyHost) => Promise<void>
}

export function ToggleHostDialog({ host, onToggle }: ToggleHostDialogProps) {
  const [isToggling, setIsToggling] = useState(false)
  const [open, setOpen] = useState(false)

  const handleToggle = async () => {
    setIsToggling(true)
    try {
      await onToggle(host)
      setOpen(false)
    } finally {
      setIsToggling(false)
    }
  }

  const action = host.enabled ? "disable" : "enable"
  const actionCapitalized = action.charAt(0).toUpperCase() + action.slice(1)

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          {host.enabled ? "Disable" : "Enable"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{actionCapitalized} Proxy Host</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to {action} the proxy host for{" "}
            <span className="font-semibold">{host.domain}</span>?
            {host.enabled
              ? " This will stop forwarding traffic to the target."
              : " This will start forwarding traffic to the target."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isToggling}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleToggle}
            disabled={isToggling}
            className={host.enabled ? "bg-destructive hover:bg-destructive/90" : ""}
          >
            {isToggling ? (
              <>
                <Spinner size="sm" className="mr-2" />
                {actionCapitalized}ing...
              </>
            ) : (
              actionCapitalized
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
