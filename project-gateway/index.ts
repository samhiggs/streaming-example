import express, { Request, Response } from 'express';
import httpProxy from 'http-proxy';
import cors from 'cors'
const socketio = require('socket.io');
import { io as ioClient } from 'socket.io-client';

const app = express();

const proxy = httpProxy.createProxyServer({
    ws: true // Enable WebSocket proxying
});
const server = require('http').createServer(app, {
    target: {
        protocol: 'http:',
        host: 'node-app',
        port: 3001,
    },
    changeOrigin: true,
});
const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:3002',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    }
})
const nodeAppSocket = ioClient('http://node-app:3001')

app.use(cors())
interface RouteMappings {
    [podId: string]: string;
}
interface Params {
    containerName: string;
    [key: string]: string;
}

io.on('connection', (socket: any) => {
    console.log('connected to front end socket')
});

nodeAppSocket.on('connect', () => {
    console.log('Connected to node app socket')
})

nodeAppSocket.on('kafka-message', (data) => {
    console.log('Forwarding kafka message to frontend', data)
    io.emit('kafka-message', data)
})

const routeMappings: RouteMappings = {
    'node-app': 'http://node-app:3001',
};

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'healthy' });
});


app.use((req: any, res: any, next: any) => {
    console.log('Setting headers')
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next()
})


app.use('/socket.io/*', (req: any, res: any) => {
    console.log('Routing socket io')
    const params = req.params as Params;
    console.log(req.originalUrl.slice(1, req.originalUrl.length))
    console.log(req.url.slice(1, req.url.length))
    // const targetUrl = `${params['0']}`;
    // console.log(`Target: ${targetUrl}`)
    proxy.web(req, res, { target: req.originalUrl.slice(1, req.originalUrl.length) })
});

app.use('/project-gateway/:containerName/*', (req: any, res: any) => {
    console.log('Routing...')
    const params = req.params as Params;
    const containerName = routeMappings[params['containerName']]
    const targetUrl = `${containerName}/${params['0']}`;
    console.log(req.url)
    console.log(`Target: ${targetUrl}`)
    proxy.web(req, res, { target: targetUrl })
});

server.listen(3000, () => {
    console.log('Project Gateway is running on port 3000');
});
