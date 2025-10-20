import React, { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Moon, Sun, Plus, Trash2, Check, X } from 'lucide-react'
import './App.css'

function App() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState({})
  const [todos, setTodos] = useState([])
  const [activeTab, setActiveTab] = useState('calendar')
  const [theme, setTheme] = useState('dark')
  const [showEventForm, setShowEventForm] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: '', time: '12:00', description: '', notification: '0' })
  const [newTodo, setNewTodo] = useState('')

  // Charger les données au démarrage
  useEffect(() => {
    const savedEvents = localStorage.getItem('calendarEvents')
    const savedTodos = localStorage.getItem('todoItems')
    const savedTheme = localStorage.getItem('theme')
    
    if (savedEvents) setEvents(JSON.parse(savedEvents))
    if (savedTodos) setTodos(JSON.parse(savedTodos))
    if (savedTheme) setTheme(savedTheme)
  }, [])

  // Sauvegarder les données
  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events))
  }, [events])

  useEffect(() => {
    localStorage.setItem('todoItems', JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Fonctions du calendrier
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const calendarDays = []
  const startDay = monthStart.getDay()

  // Ajouter les jours du mois précédent
  for (let i = 0; i < startDay; i++) {
    const prevDate = new Date(monthStart)
    prevDate.setDate(prevDate.getDate() - (startDay - i))
    calendarDays.push(prevDate)
  }

  // Ajouter les jours du mois actuel
  calendarDays.push(...monthDays)

  // Ajouter les jours du mois suivant pour compléter
  const remainingDays = 42 - calendarDays.length
  for (let i = 1; i <= remainingDays; i++) {
    const nextDate = new Date(monthEnd)
    nextDate.setDate(nextDate.getDate() + i)
    calendarDays.push(nextDate)
  }

  // Gestion des événements
  const handleAddEvent = (e) => {
    e.preventDefault()
    if (!newEvent.title.trim()) return

    const dateKey = format(selectedDate, 'yyyy-MM-dd')
    const updatedEvents = {
      ...events,
      [dateKey]: [
        ...(events[dateKey] || []),
        {
          ...newEvent,
          id: Date.now(),
          notification: parseInt(newEvent.notification)
        }
      ].sort((a, b) => a.time.localeCompare(b.time))
    }

    setEvents(updatedEvents)
    setNewEvent({ title: '', time: '12:00', description: '', notification: '0' })
    setShowEventForm(false)
  }

  const handleDeleteEvent = (dateKey, eventId) => {
    const updatedEvents = {
      ...events,
      [dateKey]: events[dateKey].filter(event => event.id !== eventId)
    }
    
    if (updatedEvents[dateKey].length === 0) {
      delete updatedEvents[dateKey]
    }
    
    setEvents(updatedEvents)
  }

  // Gestion des todos
  const handleAddTodo = (e) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    setTodos([...todos, {
      id: Date.now(),
      text: newTodo,
      completed: false,
      createdAt: new Date().toISOString()
    }])
    setNewTodo('')
  }

  const handleToggleTodo = (todoId) => {
    setTodos(todos.map(todo => 
      todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const handleDeleteTodo = (todoId) => {
    setTodos(todos.filter(todo => todo.id !== todoId))
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const selectedDateEvents = events[format(selectedDate, 'yyyy-MM-dd')] || []

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">Mon Calendrier Todo</h1>
          <p className="app-subtitle">Gérez vos événements et tâches simplement</p>
        </div>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      {/* Navigation par onglets */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          Calendrier
        </button>
        <button 
          className={`tab ${activeTab === 'todo' ? 'active' : ''}`}
          onClick={() => setActiveTab('todo')}
        >
          Todo List
        </button>
      </div>

      {/* Contenu principal */}
      <main className="main-content">
        {activeTab === 'calendar' && (
          <div className="calendar-container">
            {/* En-tête du calendrier */}
            <div className="calendar-header">
              <button 
                className="nav-button"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              >
                ‹
              </button>
              <h2 className="current-month">
                {format(currentDate, 'MMMM yyyy', { locale: fr })}
              </h2>
              <button 
                className="nav-button"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              >
                ›
              </button>
            </div>

            {/* Jours de la semaine */}
            <div className="weekdays">
              {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
                <div key={day} className="weekday">{day}</div>
              ))}
            </div>

            {/* Grille du calendrier */}
            <div className="calendar-grid">
              {calendarDays.map((date, index) => {
                const isCurrentMonth = isSameMonth(date, currentDate)
                const isSelected = isSameDay(date, selectedDate)
                const isTodayDate = isToday(date)
                const dateKey = format(date, 'yyyy-MM-dd')
                const hasEvents = events[dateKey] && events[dateKey].length > 0

                return (
                  <button
                    key={index}
                    className={`calendar-day 
                      ${!isCurrentMonth ? 'other-month' : ''} 
                      ${isTodayDate ? 'today' : ''} 
                      ${isSelected ? 'selected' : ''}
                      ${hasEvents ? 'has-events' : ''}
                    `}
                    onClick={() => {
                      setSelectedDate(date)
                      setShowEventForm(false)
                    }}
                  >
                    {format(date, 'd')}
                  </button>
                )
              })}
            </div>

            {/* Événements de la date sélectionnée */}
            <div className="events-section">
              <h3 className="section-title">
                Événements pour le {format(selectedDate, 'dd MMMM yyyy', { locale: fr })}
              </h3>
              
              <div className="events-list">
                {selectedDateEvents.length > 0 ? (
                  selectedDateEvents.map(event => (
                    <div key={event.id} className="event-item">
                      <span className="event-time">{event.time}</span>
                      <span className="event-title">{event.title}</span>
                      <button 
                        className="event-action"
                        onClick={() => handleDeleteEvent(format(selectedDate, 'yyyy-MM-dd'), event.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">Aucun événement pour cette date</div>
                )}
              </div>

              {!showEventForm ? (
                <button 
                  className="add-button"
                  onClick={() => setShowEventForm(true)}
                >
                  <Plus size={20} />
                  Ajouter un événement
                </button>
              ) : (
                <form className="event-form" onSubmit={handleAddEvent}>
                  <h4>Nouvel événement</h4>
                  
                  <div className="form-group">
                    <label>Titre</label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                      placeholder="Nom de l'événement"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Heure</label>
                    <input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>Description (optionnel)</label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                      placeholder="Détails de l'événement"
                    />
                  </div>

                  <div className="form-group">
                    <label>Notification</label>
                    <select
                      value={newEvent.notification}
                      onChange={(e) => setNewEvent({...newEvent, notification: e.target.value})}
                    >
                      <option value="0">Aucune</option>
                      <option value="5">5 minutes avant</option>
                      <option value="15">15 minutes avant</option>
                      <option value="30">30 minutes avant</option>
                      <option value="60">1 heure avant</option>
                    </select>
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="cancel-button"
                      onClick={() => setShowEventForm(false)}
                    >
                      <X size={16} />
                      Annuler
                    </button>
                    <button type="submit" className="save-button">
                      <Check size={16} />
                      Enregistrer
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {activeTab === 'todo' && (
          <div className="todo-container">
            {/* Formulaire d'ajout de tâche */}
            <form className="todo-input-container" onSubmit={handleAddTodo}>
              <input
                type="text"
                className="todo-input"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Ajouter une nouvelle tâche..."
              />
              <button type="submit" className="todo-add-button">
                <Plus size={20} />
              </button>
            </form>

            {/* Liste des tâches */}
            <div className="todo-list">
              {todos.length > 0 ? (
                todos.map(todo => (
                  <div key={todo.id} className="todo-item">
                    <button 
                      className={`todo-checkbox ${todo.completed ? 'checked' : ''}`}
                      onClick={() => handleToggleTodo(todo.id)}
                    >
                      {todo.completed && <Check size={14} />}
                    </button>
                    <span className={`todo-text ${todo.completed ? 'completed' : ''}`}>
                      {todo.text}
                    </span>
                    <button 
                      className="todo-action"
                      onClick={() => handleDeleteTodo(todo.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-state">Aucune tâche pour le moment</div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App