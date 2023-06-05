const express = require('express')
const http = require('http')
const sql = require('mssql')
const socketIO = require('socket.io')
const { Kafka } = require('kafkajs');

// Create a new instance of Kafka
const kafka = new Kafka({
  clientId: 'node-server',
  brokers: ['kafka:9092'],  // Replace with your Kafka broker(s) configuration
  ssl: false,
});

// Create a Kafka consumer
const consumer = kafka.consumer({ groupId: '2' });  // Replace with your desired consumer group ID

async function runConsumer() {
  // Connect the consumer to the Kafka cluster
  await consumer.connect();
  // Subscribe to the topic(s)
  await consumer.subscribe({ topic: 'cdc.MyEvents.dbo.EventData' });

  // Start consuming messages
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`emitting kafka msg`);
      io.emit('kafka-message', message.value.toString())
      // Process the received message
    }
  });
}


const config = {
  server: 'sql-server',
  user: 'sa',
  password: 'YourStrongPassword1!',
  database: 'MyEvents',
  options: {
    encrypt: false
  }
}

const app = express()
app.use(express.json()); // Add this line to parse the request body as JSON

const server = http.createServer(app)
const io = socketIO(server)
// const pool = new sql.ConnectionPool(config); // TODO: implement pool later.
runConsumer().catch(console.error);
// Serve static files from the "public" directory
app.use((req, res, next) => {
  console.log('Setting headers')
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next()
})
app.use(express.static('public'))
// Home route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
})

// Route to fetch EventData from the database
app.get('/api/eventdata', async (req, res) => {
  console.log('getting data')
  try {
    // Connect to the SQL Server
    await sql.connect(config);

    // Query the EventData table
    const result = await sql.query('SELECT * FROM EventData');

    // Send the fetched data as the API response
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching EventData:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    // Close the SQL Server connection
    await sql.close();
  }
});

app.post('/api/eventdata/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    console.log('Posting to /api/eventdata/')
    const { eventName } = req.body;
    await sql.connect(config);
    // Update the event name in the database
    const query = `UPDATE EventData SET EventName = '${eventName}' WHERE ID = ${parseInt(eventId)}`;
    await sql.query(query);
    // Emit an event to notify connected clients about the update
    io.emit('message', { eventId, eventName });
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating event name:', error);
    res.status(500).json({ error: 'An error occurred' });
  } finally {
    // Close the database connection
    await sql.close();
  }
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected')

  // Handle "message" event
  socket.on('message', (data) => {
    console.log('Received message:', data)
    socket.emit('message', data) // Echo back the message to the sender
  })

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected')
  })
})

// Start the server
const port = 3001
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
