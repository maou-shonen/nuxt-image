import { joinURL } from 'ufo'
import type { ProviderGetImage, ImgproxyOptions } from '../../types'
// import { generateSignature } from '../imgproxy'
import { createOperationsGenerator } from '#image'
import { useRuntimeConfig } from '#imports'

// https://github.com/nuxt/image/pull/385#issuecomment-1435406867
const operationsGenerator = createOperationsGenerator({
  valueMap: {
    resize: 'rs',
    size: 's',
    fit: 'rt',
    width: 'w',
    height: 'h',
    dpr: 'dpr',
    enlarge: 'el',
    extend: 'ex',
    gravity: 'g',
    crop: 'c',
    padding: 'pd',
    trim: 't',
    rotate: 'rotate',
    quality: 'q',
    maxBytes: 'mb',
    background: 'bg',
    backgroundAlpha: 'bga',
    blur: 'bl',
    sharpen: 'sh',
    watermark: 'wm',
    preset: 'pr',
    cacheBuster: 'cb',
    stripMetadata: 'sm',
    stripColorProfile: 'scp',
    autoRotate: 'ar',
    filename: 'fn',
    format: 'f'
  },
  joinWith: '/',
  formatter: (key, value) => `${key}:${value}`
})

export const getImage: ProviderGetImage = (src, {
  modifiers = {}
} = {}, ctx) => {
  const operations = operationsGenerator(modifiers)

  const path = operations + '/plain/' + src

  let url: string
  const opts: ImgproxyOptions = useRuntimeConfig().public.image?.imgproxy

  if (opts.prerender === true) {
    url = joinURL(opts.baseURL, '/insecure', path)
  } else {
    url = joinURL(ctx.options.nuxt.baseURL, '/_imgproxy', path)
  }

  return {
    url
  }
}
