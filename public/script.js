const socket = io('http://localhost:3000')
const form = document.getElementById('send-container')
const input = document.getElementById('message-input')
const messageContainer = document.getElementById('message-container')
const roomContainer = document.getElementById('room-container')

if (form != null) {
  const name = prompt('Enter your name:')
  addMessage('You Joined the Chat!')
  socket.emit('new-user', roomName, name)

  form.addEventListener('submit', e => {
    e.preventDefault()
    const words = input.value
    addMessage(`You: ${words}`)
    socket.emit('send-chat', roomName, words)
    // resets words in message box
    input.value = ''
  })
}

// start new room
socket.on('room-started', room => {
  const element = document.createElement('div')
  element.innerText = room
  const link = document.createElement('a')
  link.href = `/${room}`
  link.innerText = 'join'
  roomContainer.append(link)
  roomContainer.append(element)
})

// new user connected
socket.on('user-connect', name => {
  addMessage(`${name} connected`)
})

// user disconnected
socket.on('user-disconnect', name => {
  addMessage(`${name} disconnected`)
})

// send message
socket.on('chat-message', data => {
  addMessage(`${data.name}: ${data.message}`)
})

function addMessage(message) {
  const element = document.createElement('div')
  element.innerText = message
  messageContainer.append(element)
}