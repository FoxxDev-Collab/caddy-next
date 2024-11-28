'use client'

export default function JobsManagementPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">Scheduled Tasks</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your automated tasks and jobs</p>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
            Create Job
          </button>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                No jobs scheduled
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click the button above to create your first job
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
