// @ts-nocheck
/// <reference types="@cloudflare/workers-types" />

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    
    // Handle SPA routing - serve index.html for all non-asset requests
    const path = url.pathname
    
    // Check if it's an asset request (has extension or is in assets folder)
    const isAsset = /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|txt|xml)$/i.test(path)
    
    if (!isAsset && path !== '/') {
      // For SPA routes, serve index.html
      const indexRequest = new Request(new URL('/', request.url), request)
      return env.ASSETS.fetch(indexRequest)
    }
    
    return env.ASSETS.fetch(request)
  }
}