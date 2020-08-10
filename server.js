const express = require('express')
const app = express()
const http = require('http')
const server = http.Server(app)
const io = require('socket.io')(server)
const rooms = { }

// all templates are located in './views' directory
app.set('views', './views')
// default extension is 'ejs'
app.set('view engine', 'ejs')

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

server.listen(3000)

// when a GET request is made, renders index view
app.get('/', (req, res) => {
  res.render('index', { rooms: rooms })
})

app.post('/room', (req, res) => {
  if (rooms[req.body.room] != null) {
    return res.redirect('/')
  }
  rooms[req.body.room] = { users: {} }
  // redirect to a new room
  res.redirect(req.body.room)
  io.emit('room-started', req.body.room)
})

app.get('/:room', (req, res) => {
  if (rooms[req.params.room] == null) {
    return res.redirect('/')
  }
  res.render('room', { roomName: req.params.room })
})

io.on('connect', socket => {
  // new user joins room
  socket.on('new-user', (room, name) => {
    socket.join(room)
    rooms[room].users[socket.id] = name
    // tell other users about new user connecting
    socket.to(room).broadcast.emit('user-connect', name)
  })

  // user sends chat to everyone but themselves
  socket.on('send-chat', (room, message) => {
    socket.to(room).broadcast.emit('chat-message', { message: message, name: rooms[room].users[socket.id] })
  })

  // users disconnects from chat room
  socket.on('disconnect', () => {
    getRooms(socket).forEach(room => {
      socket.to(room).broadcast.emit('user-disconnect', rooms[room].users[socket.id])
      delete rooms[room].users[socket.id]
    })
  })
})


function getRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name)
    return names
  }, [])
}