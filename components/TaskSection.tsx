'use client'

interface SimpleTask {
  id: string
  title: string
  description?: string
  status: 'pending' | 'completed'
  createdAt: Date
}

interface SimpleOrg {
  id: string
  name: string
  type: 'company' | 'personal'
}

interface TaskSectionProps {
  tasks: SimpleTask[]
  currentOrg: SimpleOrg | null
  onToggleTask: (taskId: string) => void
  onCreateTask: () => void
}

export default function TaskSection({
  tasks,
  currentOrg,
  onToggleTask,
  onCreateTask
}: TaskSectionProps) {
  if (!currentOrg) return null

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Aufgaben - {currentOrg.name}
        </h2>
        <button
          onClick={onCreateTask}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Neue Aufgabe
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Keine Aufgaben
          </h3>
          <p className="text-gray-600 mb-4">
            Erstellen Sie Ihre erste Aufgabe
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <h4 className="font-medium text-gray-900">{task.title}</h4>
                {task.description && (
                  <p className="text-sm text-gray-600">{task.description}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    task.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {task.status === 'completed' ? 'Erledigt' : 'Ausstehend'}
                </span>
                <button
                  onClick={() => onToggleTask(task.id)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {task.status === 'completed' ? '🔄' : '✅'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
