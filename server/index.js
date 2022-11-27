const express = require('express')
const app = express()
const REST_PORT = 3000
const GRPC_PORT = 5000
var grpc = require("@grpc/grpc-js");
var protoLoader = require("@grpc/proto-loader");

const quotes = [
  {
    id: 1,
    quote: "Frankly, my dear, I don't give a damn",
    author: "Gone With the Wind"
  },
  {
    id: 2,
    quote: "I'm going to make him an offer he can't refuse",
    author: "The Godfather"
  },
  {
    id: 3,
    quote: "Go ahead, make my day",
    author: "Sudden Impact"
  },
  {
    id: 4,
    quote: "I love the smell of napalm in the morning",
    author: "Apocalyse Now"
  },
  {
    id: 5,
    quote: "You're gonna need a bigger boat",
    author: "Jaws"
  },
]

function getQuoteById(id) {
  // Return single object quote
  return quotes.filter(quote => quote.id == id)[0] || {}
}




// Add REST routes
app.get('/api/quotes/', (req, res) => {
  res.json(quotes)
})

app.get('/api/quotes/:id', (req, res) => {
  res.json(getQuoteById(req.params.id))
})


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

let quotesProto = grpc.loadPackageDefinition(pkgDefinition);

const gRpcServer = new grpc.Server();

// Add gRPC services
gRpcServer.addService(quotesProto.QuoteService.service, {
  get: (_, callback) => {
    callback(null, { quotes })
  },

  getOne: (call, callback) => {
    let quote = getQuoteById(call.request.id)

    if (quote) {
      callback(null, quote);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: `Quote id ${call.request.id} not found`
      })
    }
  }
});


// Start both REST and gRPC servers
async function serverStart() {
  gRpcServer.bindAsync(
    `127.0.0.1:${GRPC_PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err) => {
      if (err) {
        console.error(err.message);
        return null;
      }

      gRpcServer.start();
      console.log(`gRPC listening on ${GRPC_PORT}`)
      app.listen(REST_PORT, () => {
        console.log(`REST listening on ${REST_PORT}`)
      })
    });
}

serverStart()
