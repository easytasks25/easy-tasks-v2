'use client'

import { useState } from 'react'
import { 
  PlusIcon, 
  CameraIcon, 
  MicrophoneIcon, 
  DocumentTextIcon,
  QrCodeIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline'

interface QuickActionsProps {
  onAddTask: () => void
}

export function QuickActions({ onAddTask }: QuickActionsProps) {
  const [isScanning, setIsScanning] = useState(false)

  const quickActions = [
    {
      id: 'add-task',
      label: 'Schnelle Aufgabe',
      description: 'Aufgabe mit minimalen Eingaben erstellen',
      icon: PlusIcon,
      color: 'bg-primary-500 hover:bg-primary-600',
      onClick: onAddTask
    },
    {
      id: 'photo-task',
      label: 'Foto-Aufgabe',
      description: 'Aufgabe aus Foto erstellen',
      icon: CameraIcon,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => console.log('Photo task')
    },
    {
      id: 'voice-task',
      label: 'Sprach-Aufgabe',
      description: 'Aufgabe per Spracheingabe erstellen',
      icon: MicrophoneIcon,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => console.log('Voice task')
    },
    {
      id: 'quick-note',
      label: 'Schnelle Notiz',
      description: 'Notiz ohne Formular erstellen',
      icon: DocumentTextIcon,
      color: 'bg-yellow-500 hover:bg-yellow-600',
      onClick: () => console.log('Quick note')
    },
    {
      id: 'qr-scan',
      label: 'QR-Code scannen',
      description: 'Aufgabe aus QR-Code erstellen',
      icon: QrCodeIcon,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      onClick: () => setIsScanning(true)
    },
    {
      id: 'sync-outlook',
      label: 'Outlook synchronisieren',
      description: 'Mit Outlook Kalender synchronisieren',
      icon: CloudArrowUpIcon,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => console.log('Sync Outlook')
    }
  ]


  return (
    <div className="space-y-6">
      {/* Quick Actions Grid */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Schnellaktionen</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                className={`${action.color} text-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105`}
              >
                <Icon className="h-8 w-8 mx-auto mb-2" />
                <div className="text-center">
                  <div className="text-sm font-medium">{action.label}</div>
                  <div className="text-xs opacity-90 mt-1 hidden lg:block">
                    {action.description}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>


      {/* QR Scanner Modal */}
      {isScanning && (
        <QRScanner
          onClose={() => setIsScanning(false)}
          onScan={(data) => {
            console.log('QR Code scanned:', data)
            setIsScanning(false)
          }}
        />
      )}
    </div>
  )
}

interface QRScannerProps {
  onClose: () => void
  onScan: (data: string) => void
}

function QRScanner({ onClose, onScan }: QRScannerProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">QR-Code scannen</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        
        <div className="p-6 text-center">
          <div className="w-64 h-64 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <QrCodeIcon className="h-16 w-16 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 mb-4">
            QR-Code vor die Kamera halten
          </p>
          <button
            onClick={() => onScan('sample-qr-data')}
            className="btn-primary"
          >
            Test-Scan (Demo)
          </button>
        </div>
      </div>
    </div>
  )
}
