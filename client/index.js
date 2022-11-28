const express = require('express')
const app = express()
const REST_PORT = 3001
const GRPC_PORT = 5000
var grpc = require("@grpc/grpc-js");
var protoLoader = require("@grpc/proto-loader");

// gRPC services setup
let pkgDefinition = protoLoader.loadSync(
  "./src/grpc/protos/quotes.proto",
  {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true,
    defaults: true,
    oneofs: true
  })

const QuoteService = grpc.loadPackageDefinition(pkgDefinition).QuoteService;
const client = new QuoteService(
  `127.0.0.1:${GRPC_PORT}`,
  grpc.credentials.createInsecure()
)


app.get('/api/grpc/quotes/', (req, res, next) => {
  client.get(null, (err, data) => {
    if (err) {
      res.status(err.code).send(err.details)
      return next()
    }

    return res.json(data)
  })
})

app.get('/api/grpc/quotes/:id', (req, res, next) => {
  client.getOne({ id: parseInt(req.params.id) }, (err, data) => {
    if (err) {
      res.send(err)
      return next()
    }

    res.json(data)
  })
})

app.listen(REST_PORT, () => {
  console.log(`REST listening on ${REST_PORT}`)
})

