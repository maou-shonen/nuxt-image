import { eventHandler, sendProxy } from 'h3'
import { joinURL } from 'ufo'
import type { BinaryString, ImgproxyOptions } from '../types/module'
import { useRuntimeConfig } from '#imports'

function decodeBinaryString (value: BinaryString): Buffer {
  const delimiterIndex = value.indexOf(':')
  const encoding = value.slice(0, delimiterIndex) as BufferEncoding
  const content = value.slice(delimiterIndex + 1)
  return Buffer.from(content, encoding)
}

export async function generateSignature (key: BinaryString, salt: BinaryString, path: string): Promise<string> {
  // TODO: deno support
  const { createHmac } = await import('node:crypto')

  return createHmac('sha256', decodeBinaryString(key))
    .update(decodeBinaryString(salt))
    .update(path)
    .digest()
    .toString('base64url')
}

export default eventHandler(async (event) => {
  const opts: ImgproxyOptions = useRuntimeConfig().image?.imgproxy

  const path = event.path!.slice('/_imgproxy'.length)

  if (opts.prerender === true) {
    const url = joinURL(opts.baseURL, '/insecure', path)
    return sendProxy(event, url, {
      sendStream: true
    })
  }

  let sign: string
  if (opts.key && opts.salt) {
    sign = await generateSignature(opts.key, opts.salt, path)
  } else if (opts.key === undefined && opts.salt === undefined) {
    sign = 'insecure'
  } else {
    throw new Error('imgproxy: key and salt must be both set or both unset')
  }

  const url = joinURL(opts.baseURL, `/${sign}${path}`)

  return sendProxy(event, url, {
    sendStream: true
  })
})
