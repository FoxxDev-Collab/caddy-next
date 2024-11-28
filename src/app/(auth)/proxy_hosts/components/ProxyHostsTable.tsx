/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { useHosts } from "../../../../lib/hooks/useHosts"
import { Button } from "../../../components/ui/button"
import { Card } from "../../../components/ui/card"
import { AddHostDialog } from "./AddHostDialog"
import { DeleteHostDialog } from "./DeleteHostDialog"
import { ToggleHostDialog } from "./ToggleHostDialog"
import { TableLoadingSpinner, Spinner } from "../../../components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../components/ui/tooltip"

export default function ProxyHostsTable() {
  const { hosts, isLoading, error, deleteHost, mutate } = useHosts()

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-red-500">Error loading hosts: {error.message}</div>
      </Card>
    )
  }

  if (isLoading) {
    return <TableLoadingSpinner />
  }

  return (
    <Card className="p-6">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Proxy Hosts</h2>
            <p className="text-sm text-muted-foreground">
              Manage your proxy host configurations
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => mutate()}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Spinner size="sm" />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 2v6h-6" />
                        <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                        <path d="M3 22v-6h6" />
                        <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                      </svg>
                    )}
                    <span className="sr-only">Refresh</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh host list</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <AddHostDialog onHostAdded={mutate} />
          </div>
        </div>

        {hosts.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8">
            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-sm text-muted-foreground">
                No proxy hosts found
              </p>
              <p className="text-sm text-muted-foreground">
                Click the button above to add your first proxy host
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {hosts.map((host) => (
              <div key={host.id} className="rounded-lg border border-border shadow-sm">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{host.domain}</h3>
                        <span className="text-sm text-muted-foreground">→</span>
                        <span className="text-sm text-muted-foreground">
                          {host.targetHost}:{host.targetPort}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            host.enabled
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {host.enabled ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ToggleHostDialog host={host} onToggle={() => mutate()} />
                      <DeleteHostDialog 
                        host={host} 
                        onDelete={async () => {
                          await deleteHost(host.id)
                          await mutate()
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
