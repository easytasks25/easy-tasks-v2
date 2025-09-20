'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { 
  XMarkIcon,
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  PhotoIcon,
  MicrophoneIcon,
  PaperClipIcon,
  CloudIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { Task, TaskPriority, TaskStatus, VoiceNote } from '@/types/task'
import { useVoiceRecording } from '@/hooks/useVoiceRecording'
import { useSpeechTranscription } from '@/hooks/useSpeechTranscription'

const taskSchema = z.object({
  title: z.string().min(1, 'Titel ist erforderlich'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['pending', 'in-progress', 'completed', 'cancelled']),
  dueDate: z.string().optional(),
  category: z.string().optional(),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
  bucketId: z.string().optional(),
})

type TaskFormData = z.infer<typeof taskSchema>

interface TaskFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  initialData?: Task | null
  buckets?: Array<{ id: string; name: string; color: string; type: string }>
  selectedBucketId?: string | null
  defaultBucketId?: string | null
}

export function TaskForm({ isOpen, onClose, onSubmit, initialData, buckets = [], selectedBucketId, defaultBucketId }: TaskFormProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [attachments, setAttachments] = useState<any[]>([])
  const [photos, setPhotos] = useState<any[]>([])
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([])
  
  // Voice recording hooks
  const {
    isRecording,
    isPaused,
    recordingTime,
    audioBlob,
    audioUrl,
    error: recordingError,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    formatTime
  } = useVoiceRecording()

  const {
    isTranscribing,
    transcribedText,
    error: transcriptionError,
    isSupported: isTranscriptionSupported,
    transcribeAudio,
    resetTranscription
  } = useSpeechTranscription()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
        defaultValues: {
          priority: 'medium',
          status: 'pending',
          dueDate: format(new Date(), 'yyyy-MM-dd'),
        }
  })


  useEffect(() => {
    if (initialData) {
        reset({
          title: initialData.title,
          description: initialData.description,
          priority: initialData.priority,
          status: initialData.status,
          dueDate: initialData.dueDate ? format(new Date(initialData.dueDate), 'yyyy-MM-dd') : '',
          category: initialData.category,
          assignedTo: initialData.assignedTo,
          notes: initialData.notes,
        })
    } else {
      reset()
    }
  }, [initialData, reset])

  const handleFormSubmit = (data: TaskFormData) => {
    const taskData = {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : new Date().toISOString(),
      attachments: attachments,
      photos: photos,
      voiceNotes: voiceNotes,
      // Set startedAt if status changes to in-progress
      startedAt: (data.status === 'in-progress' && (!initialData || initialData.status !== 'in-progress')) 
        ? new Date() 
        : initialData?.startedAt,
      // Set completedAt if status changes to completed
      completedAt: (data.status === 'completed' && (!initialData || initialData.status !== 'completed')) 
        ? new Date() 
        : initialData?.completedAt,
    }
    
    // If editing, only send the changed fields
    if (initialData) {
      const updates: any = {}
      Object.keys(taskData).forEach(key => {
        if (taskData[key as keyof typeof taskData] !== initialData[key as keyof Task]) {
          updates[key] = taskData[key as keyof typeof taskData]
        }
      })
      onSubmit(updates)
    } else {
      onSubmit(taskData)
    }
    
    reset()
    setAttachments([])
    setPhotos([])
    setVoiceNotes([])
  }

  const handleFileUpload = async (files: FileList, type: 'attachments' | 'photos') => {
    setIsUploading(true)
    // Simulate file upload
    setTimeout(() => {
      const newFiles = Array.from(files).map(file => ({
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        uploadedAt: new Date(),
      }))
      
      if (type === 'attachments') {
        setAttachments(prev => [...prev, ...newFiles])
      } else {
        setPhotos(prev => [...prev, ...newFiles])
      }
      setIsUploading(false)
    }, 1000)
  }

  const handleVoiceRecord = async () => {
    if (isRecording) {
      if (isPaused) {
        resumeRecording()
      } else {
        pauseRecording()
      }
    } else {
      await startRecording()
    }
  }

  const handleStopRecording = () => {
    stopRecording()
  }

  const handleSaveRecording = async () => {
    if (audioBlob) {
      const newVoiceNote: VoiceNote = {
        id: Date.now().toString(),
        url: audioUrl!,
        duration: recordingTime,
        recordedAt: new Date()
      }

      // Try to transcribe if supported
      if (isTranscriptionSupported) {
        try {
          const transcription = await transcribeAudio(audioBlob)
          if (transcription) {
            newVoiceNote.transcribedText = transcription
          }
        } catch (error) {
          console.error('Transcription failed:', error)
        }
      }

      setVoiceNotes(prev => [...prev, newVoiceNote])
      resetRecording()
      resetTranscription()
    }
  }

  const handleDiscardRecording = () => {
    resetRecording()
    resetTranscription()
  }

  const handleRemoveVoiceNote = (voiceNoteId: string) => {
    setVoiceNotes(prev => {
      const noteToRemove = prev.find(note => note.id === voiceNoteId)
      if (noteToRemove?.url) {
        URL.revokeObjectURL(noteToRemove.url)
      }
      return prev.filter(note => note.id !== voiceNoteId)
    })
  }


  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Aufgabe bearbeiten' : 'Neue Aufgabe erstellen'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titel *
              </label>
              <input
                {...register('title')}
                className="input-field"
                placeholder="Aufgabentitel eingeben"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priorität
              </label>
              <select {...register('priority')} className="input-field">
                <option value="low">Niedrig</option>
                <option value="medium">Mittel</option>
                <option value="high">Hoch</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select {...register('status')} className="input-field">
                <option value="pending">Ausstehend</option>
                <option value="in-progress">In Arbeit</option>
                <option value="completed">Erledigt</option>
                <option value="cancelled">Abgebrochen</option>
              </select>
            </div>
          </div>

          {/* Bucket, Category and Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bucket Selection */}
            {buckets.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bucket
                </label>
                <select
                  {...register('bucketId')}
                  className="input-field"
                  defaultValue={selectedBucketId || defaultBucketId || ''}
                >
                  <option value="">Bucket auswählen...</option>
                  {buckets.map((bucket) => (
                    <option key={bucket.id} value={bucket.id}>
                      {bucket.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategorie
              </label>
              <input
                {...register('category')}
                className="input-field"
                placeholder="z.B. Fundament, Dach, etc."
              />
            </div>

            {/* Assigned To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zugewiesen an
              </label>
              <input
                {...register('assignedTo')}
                className="input-field"
                placeholder="Mitarbeiter eingeben..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Beschreibung
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="input-field"
              placeholder="Detaillierte Beschreibung der Aufgabe"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fälligkeitsdatum
              </label>
              <input
                {...register('dueDate')}
                type="date"
                className="input-field"
              />
            </div>

          </div>





          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notizen
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="input-field"
              placeholder="Zusätzliche Notizen oder Anmerkungen"
            />
          </div>

          {/* File Uploads */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anhänge
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <PaperClipIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-700">Dateien hochladen</span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'attachments')}
                  />
                </label>

                <label className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <PhotoIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-700">Fotos hinzufügen</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'photos')}
                  />
                </label>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleVoiceRecord}
                    className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                      isRecording 
                        ? 'border-red-300 bg-red-50 text-red-700' 
                        : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <MicrophoneIcon className={`h-5 w-5 ${isRecording ? 'text-red-500' : 'text-gray-400'}`} />
                    <span className="text-sm">
                      {isRecording 
                        ? (isPaused ? 'Fortsetzen' : 'Pausieren') 
                        : 'Sprachnotiz'
                      }
                    </span>
                  </button>

                  {isRecording && (
                    <button
                      type="button"
                      onClick={handleStopRecording}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                    >
                      <StopIcon className="h-5 w-5 text-gray-400" />
                      <span className="text-sm">Stoppen</span>
                    </button>
                  )}
                </div>

                {/* Recording Status */}
                {isRecording && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-red-700">
                          {isPaused ? 'Pausiert' : 'Aufnahme läuft'} - {formatTime(recordingTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recording Controls */}
                {audioBlob && !isRecording && (
                  <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <PlayIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          Aufnahme bereit ({formatTime(recordingTime)})
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={handleSaveRecording}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Speichern
                        </button>
                        <button
                          type="button"
                          onClick={handleDiscardRecording}
                          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Verwerfen
                        </button>
                      </div>
                    </div>
                    
                    {/* Audio Preview */}
                    {audioUrl && (
                      <div className="mt-2">
                        <audio controls className="w-full">
                          <source src={audioUrl} type="audio/webm" />
                          Ihr Browser unterstützt keine Audio-Wiedergabe.
                        </audio>
                      </div>
                    )}

                    {/* Transcription Status */}
                    {isTranscribing && (
                      <div className="mt-2 text-xs text-blue-600">
                        Transkription läuft...
                      </div>
                    )}
                    
                    {transcribedText && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                        <strong>Transkription:</strong> {transcribedText}
                      </div>
                    )}
                  </div>
                )}

                {/* Error Messages */}
                {(recordingError || transcriptionError) && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                    {recordingError || transcriptionError}
                  </div>
                )}

                {/* Voice Notes List */}
                {voiceNotes.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Sprachnotizen:</h4>
                    {voiceNotes.map((voiceNote) => (
                      <div key={voiceNote.id} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded">
                        <div className="flex items-center space-x-2">
                          <PlayIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-xs text-gray-600">
                            {formatTime(voiceNote.duration)} - {format(voiceNote.recordedAt, 'HH:mm', { locale: de })}
                          </span>
                          {voiceNote.transcribedText && (
                            <span className="text-xs text-blue-600">(transkribiert)</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveVoiceNote(voiceNote.id)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {isUploading && (
                <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
                  <CloudIcon className="h-4 w-4 animate-spin" />
                  <span>Wird hochgeladen...</span>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {initialData ? 'Aktualisieren' : 'Erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
