const express = require('express')
const app = express()
const REST_PORT = 3000
const GRPC_PORT = 5000
var grpc = require("@grpc/grpc-js");
var protoLoader = require("@grpc/proto-loader");

let pkgDefinition = protoLoader.loadSync(
  "./src/grpc/protos/quotes.proto",
  {
    keepCase: true,
    longs: BigInt,
    enums: String,
    arrays: true
  })



app.get('/', (req, res) => {
  res.send('Hello World!')
})


async function serverStart() {
  let quotesProto = grpc.loadPackageDefinition(pkgDefinition);
  const server = new grpc.Server();

  server.bindAsync(
    `127.0.0.1:${GRPC_PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err) => {
      if (err) {
        console.error(err.message);
        return null;
      }


      server.start();
      console.log(`gRPC listening on ${GRPC_PORT}`)
      app.listen(REST_PORT, () => {
        console.log(`REST listening on ${REST_PORT}`)
      })
    });


}

serverStart()
