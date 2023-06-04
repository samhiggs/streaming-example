import express, { Request, Response } from 'express';
import httpProxy from 'http-proxy';
import cors from 'cors'

const app = express();
const proxy = httpProxy.createProxyServer();
app.use(cors())
interface RouteMappings {
    [podId: string]: string;
}
interface Params {
    containerName: string;
    [key: string]: string;
}

const routeMappings: RouteMappings = {
    'node-app': 'http://node-app:3001',
};

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'healthy' });
});


app.use((req, res, next) => {
    console.log('Setting headers')
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next()
})

app.use('/project-gateway/:containerName/*', (req, res) => {
    console.log('Routing...')
    const params = req.params as Params;
    const containerName = routeMappings[params['containerName']]
    const targetUrl = `${containerName}/${params['0']}`;
    console.log(`Target: ${targetUrl}`)
    proxy.web(req, res, { target: targetUrl })
});

app.listen(3000, () => {
    console.log('Project Gateway is running on port 3000');
});
