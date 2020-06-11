//
// Copyright © 2020 Anticrm Platform Contributors.
// 
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// 
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { createServer, IncomingMessage } from 'http'
import WebSocket, { Server } from 'ws'

import { decode } from 'jwt-simple'
import { response, Service, getRequest, Client } from './types'
import { connect } from './service'

const BEARER = "Bearer "

export function start (port: number, dbUri: string) {

  const server = createServer()
  const wss = new Server({ noServer: true })

  const clients = new Map<string, Promise<Service>>()

  function createClient (uri: string, tenant: string): Promise<Service> {
    const service = new Promise<Service>((resolve, reject) => {
      connect(uri, tenant).then(service => { resolve(service) }).catch(err => reject(err))
    })
    clients.set(tenant, service)
    return service
  }

  wss.on('connection', function connection (ws: WebSocket, request: any, client: Client) {
    ws.on('message', function message (msg: string) {
      const request = getRequest(msg)
      let service = clients.get(client.tenant)
      if (!service) {
        service = createClient(dbUri, client.tenant)
      }
      service.then(s => {
        const f = s[request.meth]
        f.apply(null, request.params ?? []).then(result => {
          ws.send(response({
            id: request.id,
            result
          }))
        })
      })
    })
  })

  function auth (request: IncomingMessage, done: (err: Error | null, client: Client | null) => void) {
    const auth = request.headers.authorization
    if (!auth) {
      done(new Error('no authorization header'), null)
    } else {
      if (!auth.startsWith(BEARER)) {
        done(new Error('expect bearer'), null)
      } else {
        const token = auth.substring(BEARER.length)
        const payload = decode(token, 'secret', false)
        done(null, payload)
      }
    }
  }

  server.on('upgrade', function upgrade (request: IncomingMessage, socket, head: Buffer) {
    auth(request, (err: Error | null, client: Client | null) => {
      if (!client) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
        socket.destroy()
        return
      }
      console.log(client)
      wss.handleUpgrade(request, socket, head, function done (ws) {
        wss.emit('connection', ws, request, client);
      })
    })
  })

  const httpServer = server.listen(port)

  return async function shutdown () {
    for (const client of clients) {
      (await client[1]).shutdown()
    }
    httpServer.close()
  }
}