import express from 'express';
import httpProxy from 'http-proxy';

const app = express();
const proxy = httpProxy.createProxyServer();

interface RouteMappings {
    [podId: string]: string;
}
interface Params {
    containerName: string;
    [key: string]: string;
}

const routeMappings: RouteMappings = {
    'node-app': 'http://localhost:3002',
    // Add more mappings for each unique pod ID and backend container URL
};

app.use('/project-gateway/:containerName/*', (req, res) => {
    const params = req.params as Params;
    const containerName = routeMappings[params['containerName']]
    const targetUrl = `${containerName}/${params['0']}`;
    console.log(`Target: ${targetUrl}`)
    proxy.web(req, res, { target: targetUrl })
});

app.listen(3000, () => {
    console.log('Project Gateway is running on port 3000');
});
