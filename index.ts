import * as http from 'http';
import { IncomingMessage, ServerResponse } from 'http';
import * as fs from 'fs';
import * as p from 'path';
import * as url from 'url';

const server = http.createServer();
const publicDir = p.resolve(__dirname, 'public');
let cacheAge = 3600 * 24 * 365;

server.on('request', (request: IncomingMessage, response: ServerResponse) => {
    const { method, url: path, headers } = request;

    if (method !== 'GET') {
        response.statusCode = 405;
        response.end('this is a fake response');
        return;
    }

    const { pathname, search } = url.parse(path);
    let fileName = pathname.substr(1);
    if (fileName === '') fileName = 'index.html';
    // response.setHeader('Content-Type', 'text/html; charset=utf-8');
    fs.readFile(p.resolve(publicDir, fileName), (error, data) => {
        if (error) {
            if (error.errno === -4058) {
                response.statusCode = 404;
                fs.readFile(p.resolve(publicDir, '404.html'), (error, data) => {
                    response.end(data);
                })
            } else if (error.errno === -4068) {
                response.statusCode = 403;
                response.end("no right to check the directory");
            } else {
                response.statusCode = 500;
                response.end('server is busy');
            }
        } else {
            response.setHeader('Cache-Control', `public, max-age=${cacheAge}`);
            response.end(data);
        }
    });
})

server.listen(8888);