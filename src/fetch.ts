import * as https from 'https'
import {TLSSocket} from 'tls'
import {urlToHttpOptions} from 'url'

import type {IncomingMessage} from 'http'

import type {HttpRequest, HttpResponse} from './types'

// see https://github.com/Jigsaw-Code/outline-server/blob/9fc83859c22ff502f9577916776dcb24007b89c9/src/server_manager/electron_app/fetch.ts#L23
export default async function fetchWithPin(
  req: HttpRequest,
  fingerprint: string
): Promise<HttpResponse> {
  const response = await new Promise<IncomingMessage>((resolve, reject) => {
    const options: https.RequestOptions = {
      ...urlToHttpOptions(new URL(req.url)),
      method: req.method,
      headers: req.headers,
      rejectUnauthorized: false, // Disable certificate chain validation.
    }
    const request = https.request(options, resolve).on('error', reject)

    // Enforce certificate fingerprint match.
    request.on('socket', (socket: TLSSocket) =>
      socket.on('secureConnect', () => {
        const certificate = socket.getPeerCertificate()
        // Parse fingerprint in "AB:CD:EF" form.
        const sha2hex = certificate.fingerprint256.replace(/:/g, '')
        const sha2binary = Buffer.from(sha2hex, 'hex').toString('binary')
        if (sha2binary !== fingerprint) {
          request.emit(
            'error',
            new Error(`Fingerprint mismatch: expected ${fingerprint}, not ${sha2binary}`)
          )
          request.destroy()
          return
        }
      })
    )

    if (req.body) {
      request.write(req.body)
    }

    request.end()
  })

  const chunks: Buffer[] = []
  for await (const chunk of response) {
    chunks.push(chunk)
  }

  return {
    status: response.statusCode,
    ok: response.statusCode ? response.statusCode >= 200 && response.statusCode < 300 : false,
    body: Buffer.concat(chunks).toString(),
  }
}