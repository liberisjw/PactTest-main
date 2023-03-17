class Company {
  constructor(partner_company_id, partner_name) {
    this.partner_company_id = partner_company_id;
    this.partner_name = partner_name;    
  }

  toString() {
    return `Company ${this.partner_company_id}, Name: ${this.partner_name}`;
  }
}

module.exports = {
  Company,
};
