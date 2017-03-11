'use strict'

const { app, net } = require('electron')
const TestServer = require('./server')

const local = new TestServer()
const base = `http://${local.hostname}:${local.port}`

const doRequest = (url) => new Promise((resolve) => {
  const request = net.request(url)
  request.on('response', (response) => {
    console.log(`STATUS: ${response.statusCode}`)
    console.log(`HEADERS: ${JSON.stringify(response.headers)}`)
    response.on('data', (chunk) => {
      console.log(`BODY: ${chunk}`)
    })
    response.on('end', () => {
      console.log()
      resolve()
    })
    response.on('error', err => {
      console.error('ResponseError!', err, '\n')
      resolve()
    })
  })
  request.on('error', err => {
    console.error('RequestError!', err, '\n')
    resolve()
  })
  request.end()
})

app.on('ready', async () => {
  await local.start()
  console.log('Server started')

  try { // should be useless, my promise doesn't know how to reject
    await doRequest(`${base}/hello`)

    await doRequest(`${base}/gzip`)

    // Demonstration of https://github.com/electron/electron/issues/8867#issuecomment-285306575
    // EDIT: this one is actually catchable
    await doRequest(`${base}/invalid-content-encoding`)


    console.log('GOING TO FAIL\n')
    // Demonstration of https://github.com/electron/electron/issues/8867
    await doRequest(`${base}/sdch`)
  } catch (err) {
    console.error('An Error happened:', err)
  }

  await local.stop()
  app.quit()
})
