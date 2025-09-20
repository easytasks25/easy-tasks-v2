'use client'

import { useState, useRef } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  PhotoIcon, 
  MicrophoneIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  TagIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
  photos: string[]
  voiceNotes: string[]
  category: string
  isPinned: boolean
}

export function NotesSection() {
  const [notes, setNotes] = useLocalStorage<Note[]>('lwtasks-notes', [])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const categories = [
    { value: 'all', label: 'Alle' },
    { value: 'general', label: 'Allgemein' },
    { value: 'safety', label: 'Sicherheit' },
    { value: 'quality', label: 'Qualität' },
    { value: 'materials', label: 'Materialien' },
    { value: 'weather', label: 'Wetter' },
    { value: 'other', label: 'Sonstiges' },
  ]

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const createNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...noteData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setNotes(prev => [newNote, ...prev])
  }

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note => 
      note.id === id 
        ? { ...note, ...updates, updatedAt: new Date() }
        : note
    ))
  }

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id))
  }

  const togglePin = (id: string) => {
    updateNote(id, { isPinned: !notes.find(n => n.id === id)?.isPinned })
  }

  const handlePhotoUpload = (files: FileList) => {
    // Simulate photo upload
    const photoUrls = Array.from(files).map(file => URL.createObjectURL(file))
    if (editingNote) {
      updateNote(editingNote.id, { 
        photos: [...(editingNote.photos || []), ...photoUrls] 
      })
    }
  }

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording)
    // Voice recording implementation would go here
  }

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Notizen</h2>
          <p className="text-sm text-gray-500">
            {filteredNotes.length} von {notes.length} Notizen
          </p>
        </div>
        
        <button
          onClick={() => {
            setEditingNote(null)
            setShowNoteForm(true)
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Neue Notiz</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Notizen durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input-field sm:w-48"
        >
          {categories.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedNotes.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Notizen gefunden</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || selectedCategory !== 'all'
                ? 'Versuchen Sie andere Suchbegriffe oder Filter.'
                : 'Erstellen Sie Ihre erste Notiz.'}
            </p>
          </div>
        ) : (
          sortedNotes.map((note) => (
            <div
              key={note.id}
              className={`card cursor-pointer hover:shadow-md transition-shadow ${
                note.isPinned ? 'ring-2 ring-primary-500' : ''
              }`}
              onClick={() => {
                setEditingNote(note)
                setShowNoteForm(true)
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {note.title}
                </h3>
                <div className="flex items-center space-x-1">
                  {note.isPinned && (
                    <div className="w-2 h-2 bg-primary-500 rounded-full" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      togglePin(note.id)
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    📌
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                {note.content}
              </p>

              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {note.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                  {note.tags.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{note.tags.length - 3} weitere
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {format(new Date(note.updatedAt), 'dd.MM.yyyy HH:mm', { locale: de })}
                </span>
                <div className="flex items-center space-x-2">
                  {note.photos.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <PhotoIcon className="h-4 w-4" />
                      <span>{note.photos.length}</span>
                    </div>
                  )}
                  {note.voiceNotes.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <MicrophoneIcon className="h-4 w-4" />
                      <span>{note.voiceNotes.length}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Note Form Modal */}
      {showNoteForm && (
        <NoteForm
          note={editingNote}
          onClose={() => {
            setShowNoteForm(false)
            setEditingNote(null)
          }}
          onSave={(noteData) => {
            if (editingNote) {
              updateNote(editingNote.id, noteData)
            } else {
              createNote(noteData)
            }
            setShowNoteForm(false)
            setEditingNote(null)
          }}
          onPhotoUpload={handlePhotoUpload}
          onVoiceRecord={handleVoiceRecord}
          isRecording={isRecording}
          fileInputRef={fileInputRef}
        />
      )}
    </div>
  )
}

interface NoteFormProps {
  note?: Note | null
  onClose: () => void
  onSave: (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void
  onPhotoUpload: (files: FileList) => void
  onVoiceRecord: () => void
  isRecording: boolean
  fileInputRef: React.RefObject<HTMLInputElement>
}

function NoteForm({ 
  note, 
  onClose, 
  onSave, 
  onPhotoUpload, 
  onVoiceRecord, 
  isRecording,
  fileInputRef 
}: NoteFormProps) {
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [category, setCategory] = useState(note?.category || 'general')
  const [tags, setTags] = useState<string[]>(note?.tags || [])
  const [newTag, setNewTag] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onSave({
      title: title.trim(),
      content: content.trim(),
      category,
      tags,
      photos: note?.photos || [],
      voiceNotes: note?.voiceNotes || [],
      isPinned: note?.isPinned || false,
    })
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {note ? 'Notiz bearbeiten' : 'Neue Notiz erstellen'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titel
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder="Notiz-Titel eingeben"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inhalt
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="input-field"
              placeholder="Notiz-Inhalt eingeben..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field"
              >
                <option value="general">Allgemein</option>
                <option value="safety">Sicherheit</option>
                <option value="quality">Qualität</option>
                <option value="materials">Materialien</option>
                <option value="weather">Wetter</option>
                <option value="other">Sonstiges</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-primary-600 hover:text-primary-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="input-field flex-1"
                  placeholder="Tag hinzufügen"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="btn-secondary"
                >
                  Hinzufügen
                </button>
              </div>
            </div>
          </div>

          {/* Media Actions */}
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <PhotoIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-700">Fotos hinzufügen</span>
            </button>

            <button
              type="button"
              onClick={onVoiceRecord}
              className={`flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 ${
                isRecording ? 'bg-red-50 border-red-300' : ''
              }`}
            >
              <MicrophoneIcon className={`h-5 w-5 ${isRecording ? 'text-red-500' : 'text-gray-400'}`} />
              <span className="text-sm text-gray-700">
                {isRecording ? 'Aufnahme beenden' : 'Sprachnotiz'}
              </span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && onPhotoUpload(e.target.files)}
          />

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
              {note ? 'Aktualisieren' : 'Erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
