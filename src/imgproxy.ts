// import { relative, resolve } from 'pathe'
// import { eventHandler } from 'h3'
import { useNuxt, createResolver } from '@nuxt/kit'
import type { ProviderSetup, ImageProviders } from './types'

export interface ImgproxyOptions {
  baseURL: string
  key?: string
  salt?: string
}

export interface imgproxyRuntimeConfig extends ImgproxyOptions {
  prerender: boolean
}

export const imgproxySetup: ProviderSetup = (providerOptions) => {
  const nuxt = useNuxt()

  // Options
  const options: ImageProviders['imgproxy'] = {
    ...providerOptions.options,
    prerender: false
  }

  // RuntimeConfig
  // const config = Object.assign({}, providerOptions.options)
  const privateConfig: imgproxyRuntimeConfig = { prerender: false, ...providerOptions.options }

  const publicConfig: imgproxyRuntimeConfig = { prerender: true, ...providerOptions.options }
  delete publicConfig.key
  delete publicConfig.salt

  // Add handler
  const resolver = createResolver(import.meta.url)
  nuxt.hook('nitro:init', (nitro) => {
    nitro.options.runtimeConfig.image ??= {}
    nitro.options.runtimeConfig.image.imgproxy = privateConfig
    // TODO: Workaround for prerender support
    // https://github.com/nuxt/image/pull/784
    nitro.options._config.runtimeConfig ??= {}
    nitro.options._config.runtimeConfig.public ??= {}
    nitro.options._config.runtimeConfig.public.image ??= {}
    nitro.options._config.runtimeConfig.public.image.imgproxy = publicConfig
  })
  nuxt.options.serverHandlers.push({
    route: '/_imgproxy/**',
    handler: resolver.resolve('./runtime/imgproxy')
  })
}
