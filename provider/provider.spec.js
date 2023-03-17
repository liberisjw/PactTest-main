const Verifier = require("@pact-foundation/pact").Verifier;
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const { server } = require("./provider.js");
const { providerName, pactFile } = require("../pact.js");
chai.use(chaiAsPromised);
let port;
let opts;
let app;

describe("Pact Verification", () => {
  before(async () => {
    port = 80;

    opts = {    
      provider: providerName,     
      providerBaseUrl: `http://localhost:${port}`,
      logLevel: "info"
    };

  
    if (process.env.PACT_URL) {
      opts = {
        ...opts,
        pactUrls: [process.env.PACT_URL]
      }
      
    } else if (!process.env.PACT_URL && !process.env.PACT_BROKER_BASE_URL) {
      opts = {
        ...opts,
        pactUrls: [pactFile]
      }
    }
   
    if (process.env.PACT_BROKER_BASE_URL) {
      opts = {
        ...opts,
        //broker location
        pactBrokerUrl: process.env.PACT_BROKER_BASE_URL,
        //mock identifiers for provider version
        providerVersion: process.env.GIT_COMMIT,
        providerVersionBranch: process.env.GIT_BRANCH,
        // we only want to publish pacts if we are in CI
        publishVerificationResult: !!process.env.CI ?? false,
      }


      //broker authentication options
      if (process.env.PACT_BROKER_USERNAME) {
        opts = {
          ...opts,
          pactBrokerUsername: process.env.PACT_BROKER_USERNAME,
          pactBrokerPassword: process.env.PACT_BROKER_PASSWORD
        }
      } else if (process.env.PACT_BROKER_TOKEN) {
        opts = {
          ...opts,
          pactBrokerToken: process.env.PACT_BROKER_TOKEN,
        }
      }

      //provider options for normal testing practice
      if (!process.env.PACT_URL) {
        opts = {
          ...opts,
          // We can use consumer version selectors for fine grained control
          // over the pacts we retrieve
          consumerVersionSelectors: [
            { mainBranch: true },
            { deployedOrReleased: true }
          ],
          // Dont allow pending pacts that haven't had a successful 
          // verification to block provider build
          enablePending: true,
          // Allow the provider to catch any in-flight work in progress 
          // pacts from the consumers
          includeWipPactsSince: "2022-01-01"
        }
      }
    }

    app = server.listen('80', '127.0.0.1', () => {
      console.log(`Provider service listening on http://localhost:${port}`);
    });
  });

  after(() => {
    if (app) {
      app.close();
    }
  });


  it("should validate the expectations of Company Web", () => {
    console.log(opts)
    return new Verifier(opts)
      .verifyProvider()
      .then((output) => {
        console.log("Pact Verification Complete!");
        console.log(output);
      })
      .catch((e) => {
        console.error("Pact verification failed :(", e);
      });
  });
});
