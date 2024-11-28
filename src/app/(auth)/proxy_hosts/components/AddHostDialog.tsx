import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog"
import { Button } from "@/app/components/ui/button"
import { AddHostForm } from "./AddHostForm"
import { useApi } from "@/lib/hooks/useApi"
import { useState } from "react"
import { CaddyHost } from "@/lib/caddy/types"

interface AddHostDialogProps {
  onHostAdded: () => void
}

type NewHostData = Omit<CaddyHost, 'id' | 'createdAt' | 'updatedAt'>

export function AddHostDialog({ onHostAdded }: AddHostDialogProps) {
  const [open, setOpen] = useState(false)
  const api = useApi()

  const handleSubmit = async (data: NewHostData) => {
    const response = await api.post('/api/hosts', data, {
      showSuccessToast: true,
      successMessage: 'Host added successfully'
    })
    
    if (response) {
      setOpen(false)
      onHostAdded()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Host</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Host</DialogTitle>
        </DialogHeader>
        <AddHostForm 
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
