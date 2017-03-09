'use strict'

const {app, net} = require('electron')
const TestServer = require('./server')

const local = new TestServer()
const base = `http://${local.hostname}:${local.port}`

const doRequest = (url) => new Promise(resolve => {
  const request = net.request(url)
  request.on('response', (response) => {
    console.log(`STATUS: ${response.statusCode}`)
    console.log(`HEADERS: ${JSON.stringify(response.headers)}`)
    response.on('data', (chunk) => {
      console.log(`BODY: ${chunk}`)
    })
    response.on('end', () => {
      resolve()
    })
  })
  request.end()
})

app.on('ready', async () => {
  await local.start()
  console.log('Server started')

  await doRequest(`${base}/hello`)

  await doRequest(`${base}/gzip`)

  // Demonstration of https://github.com/electron/electron/issues/8867
  await doRequest(`${base}/sdch`)

  // Demonstration of https://github.com/electron/electron/issues/8867#issuecomment-285306575
  // await doRequest(`${base}/invalid-content-encoding`)

  await local.stop()
  app.quit()
})
