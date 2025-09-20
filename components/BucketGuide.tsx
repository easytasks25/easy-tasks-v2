'use client'

import { useState } from 'react'
import { 
  QuestionMarkCircleIcon,
  XMarkIcon,
  HandRaisedIcon,
  ArrowRightIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

export function BucketGuide() {
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-colors z-40"
        title="Bucket-Anleitung anzeigen"
      >
        <QuestionMarkCircleIcon className="h-6 w-6" />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Bucket-Anleitung</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Concept */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Was sind Buckets?</h3>
            <p className="text-gray-600">
              Buckets sind Behälter für Ihre Aufgaben, die Ihnen helfen, Aufgaben zu organisieren und zu priorisieren. 
              Sie können Aufgaben zwischen Buckets verschieben, um Ihren Arbeitsablauf zu strukturieren.
            </p>
          </div>

          {/* Default Buckets */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Standard-Buckets</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-gray-900">Heute</div>
                  <div className="text-sm text-gray-600">Aufgaben, die heute erledigt werden müssen</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-gray-900">Morgen</div>
                  <div className="text-sm text-gray-600">Aufgaben für morgen</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-gray-900">Diese Woche</div>
                  <div className="text-sm text-gray-600">Aufgaben für diese Woche</div>
                </div>
              </div>
            </div>
          </div>

          {/* How to Use */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">So verwenden Sie Buckets</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <HandRaisedIcon className="h-5 w-5 text-primary-600 mt-1" />
                <div>
                  <div className="font-medium text-gray-900">Aufgaben verschieben</div>
                  <div className="text-sm text-gray-600">
                    Ziehen Sie Aufgaben per Drag & Drop zwischen den Buckets
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <ArrowRightIcon className="h-5 w-5 text-primary-600 mt-1" />
                <div>
                  <div className="font-medium text-gray-900">Schnellverschiebung</div>
                  <div className="text-sm text-gray-600">
                    Klicken Sie auf den Pfeil-Button, um Aufgaben von "Heute" auf "Morgen" zu verschieben
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <PlusIcon className="h-5 w-5 text-primary-600 mt-1" />
                <div>
                  <div className="font-medium text-gray-900">Neue Aufgaben</div>
                  <div className="text-sm text-gray-600">
                    Klicken Sie auf "Aufgabe hinzufügen" in einem Bucket, um direkt dort eine Aufgabe zu erstellen
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Smart Features */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Intelligente Funktionen</h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="font-medium text-green-900">Automatische Verschiebung</div>
                <div className="text-sm text-green-700">
                  Überfällige Aufgaben werden automatisch in den "Heute"-Bucket verschoben
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-900">Persistente Aufgaben</div>
                <div className="text-sm text-blue-700">
                  Aufgaben, die heute nicht erledigt wurden, bleiben am nächsten Tag im "Heute"-Bucket
                </div>
              </div>
              
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="font-medium text-purple-900">Benutzerdefinierte Buckets</div>
                <div className="text-sm text-purple-700">
                  Erstellen Sie eigene Buckets für spezielle Kategorien wie "Dringend", "Wartung", etc.
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Tipps für Bauleiter</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Verwenden Sie "Heute" für die wichtigsten Aufgaben des Tages</li>
              <li>• Verschieben Sie nicht erledigte Aufgaben am Abend auf "Morgen"</li>
              <li>• Erstellen Sie Buckets für verschiedene Baustellen oder Projekte</li>
              <li>• Nutzen Sie die Farben zur schnellen Orientierung</li>
              <li>• Überprüfen Sie morgens den "Heute"-Bucket als ersten Schritt</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            onClick={() => setIsOpen(false)}
            className="btn-primary"
          >
            Verstanden
          </button>
        </div>
      </div>
    </div>
  )
}
