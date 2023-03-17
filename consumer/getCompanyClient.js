const request = require("superagent");
const { Company } = require("./getCompany");

const getCompanyClient = () => {
  return request.get(`http://localhost:${process.env.API_PORT}/Company`).then(
    (res) => {
      return res.body.reduce((acc, o) => {
        acc.push(new Company(o.partner_company_id, o.partner_name));
        return acc;
      }, []);
    },
    (err) => {
      console.log(err)
      throw new Error(`Error from response: ${err.body}`);
    }
  );
};

module.exports = {
  getCompanyClient,
};
