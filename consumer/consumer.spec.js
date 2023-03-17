const chai = require("chai");
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const { provider } = require("../pact");
const { eachLike } = require("@pact-foundation/pact").MatchersV3;
const { like } = require("@pact-foundation/pact").MatchersV3;

const { Company } = require("./getCompany"); 
const { getCompanyClient } = require("./getCompanyClient");

//test start
describe("Pact with Get Company API", () => {
  describe("given there are company details retrieved", () => {    

    const companyProperties = {
      status: like(""),
      verification_level: like(""),
      originating_source: like(""),
      partner_company_id: "9999",
      entity_type: like(""),
      country_code: like(""),
      partner_name: "Barclaycard",
      partner_id: like("Barclaycard"),
      sub_brand: like(""),
      business_start_date: like(""),
      currency_code: like(""),
      registration_number: like(""),
      company_name: like(""),
      registered_address: eachLike({
        street: like(""),
        city: like(""),
        country: like(""),
        state: like(""),
        postcode: like("")
      }),
      trading_address: eachLike({
        street: like(""),
        city: like(""),
        country: like(""),
        state: like(""),
        postcode: like("")
      }),
      industry: like(""),
      sic_code: like(""),
      account_id: like("1234125"),
      payment_channels: eachLike([
        {
          payment_channel_id: "a091q00000HIpQ0AAL",
          payment_channel_currency_code: "GBP",
          payment_processor: "Barclaycard"
        }
      ])
    };

    describe("when a call to the API is made", () => {
      before(() => {        
        provider
          .given("there is a company")
          .uponReceiving("a request for the company details")
          .withRequest({
            method: "GET",
            path: `/Company`,
          })
          .willRespondWith({
            body: eachLike(companyProperties),
            status: 200,
            headers: {
              "Content-Type": "application/json; charset=utf-8",
            },
          });
      });

      it("will receive the company information", () => {
        return provider.executeTest((mockserver) => {          
          process.env.API_PORT = mockserver.port;
          return expect(getCompanyClient()).to.eventually.have.deep.members([
            new Company(companyProperties.partner_company_id, companyProperties.partner_name),            
          ]);
        });
      });
    });
  });
});