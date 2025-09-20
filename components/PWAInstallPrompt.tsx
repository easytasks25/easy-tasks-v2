'use client'

import { useState, useEffect } from 'react'
import { 
  DevicePhoneMobileIcon, 
  XMarkIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallPrompt(true)
    }

    // Listen for the appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('PWA installation accepted')
    } else {
      console.log('PWA installation dismissed')
    }
    
    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true')
  }

  // Don't show if already installed or dismissed in this session
  if (isInstalled || !showInstallPrompt || sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null
  }

  return (
    <div className="pwa-install-prompt">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <DevicePhoneMobileIcon className="h-8 w-8 text-white" />
          <div>
            <h3 className="text-sm font-medium text-white">
              App installieren
            </h3>
            <p className="text-xs text-white opacity-90">
              Für bessere Performance und Offline-Nutzung
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleInstallClick}
            className="flex items-center space-x-1 px-3 py-1 bg-white bg-opacity-20 text-white text-sm font-medium rounded-md hover:bg-opacity-30 transition-colors"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>Installieren</span>
          </button>
          
          <button
            onClick={handleDismiss}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
