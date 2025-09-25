import { useState, useCallback, useEffect } from 'react'

interface TranscriptionState {
  isTranscribing: boolean
  transcribedText: string
  error: string | null
  isSupported: boolean
}

export function useSpeechTranscription() {
  const [state, setState] = useState<TranscriptionState>({
    isTranscribing: false,
    transcribedText: '',
    error: null,
    isSupported: false // Wird später gesetzt
  })

  // Prüfe Browser-Unterstützung nach dem Mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setState(prev => ({
        ...prev,
        isSupported: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
      }))
    }
  }, [])

  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    if (!state.isSupported) {
      setState(prev => ({
        ...prev,
        error: 'Spracherkennung wird in diesem Browser nicht unterstützt'
      }))
      return ''
    }

    setState(prev => ({
      ...prev,
      isTranscribing: true,
      error: null,
      transcribedText: ''
    }))

    try {
      // Create audio element to play the blob
      const audio = new Audio()
      const audioUrl = URL.createObjectURL(audioBlob)
      audio.src = audioUrl

      return new Promise<string>((resolve) => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        const recognition = new SpeechRecognition()

        recognition.continuous = true
        recognition.interimResults = false
        recognition.lang = 'de-DE' // German language
        recognition.maxAlternatives = 1

        let finalTranscript = ''

        recognition.onresult = (event: any) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript
            }
          }
        }

        recognition.onend = () => {
          setState(prev => ({
            ...prev,
            isTranscribing: false,
            transcribedText: finalTranscript
          }))
          
          // Clean up
          URL.revokeObjectURL(audioUrl)
          resolve(finalTranscript)
        }

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setState(prev => ({
            ...prev,
            isTranscribing: false,
            error: `Spracherkennung fehlgeschlagen: ${event.error}`
          }))
          
          URL.revokeObjectURL(audioUrl)
          resolve('')
        }

        // Start recognition and play audio
        recognition.start()
        audio.play().catch(console.error)
      })

    } catch (error) {
      console.error('Transcription error:', error)
      setState(prev => ({
        ...prev,
        isTranscribing: false,
        error: 'Fehler bei der Spracherkennung'
      }))
      return ''
    }
  }, [state.isSupported])

  const resetTranscription = useCallback(() => {
    setState(prev => ({
      ...prev,
      transcribedText: '',
      error: null
    }))
  }, [])

  return {
    ...state,
    transcribeAudio,
    resetTranscription
  }
}
