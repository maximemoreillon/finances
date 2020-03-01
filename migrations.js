const axios = require('axios')
const jwt = require('jsonwebtoken')
const secrets = require('./secrets')


jwt.sign({ app: 'finances' }, secrets.jwt_secret, (err, token) => {

  axios.post('https://finances.maximemoreillon.com/get_balance_history',{}, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    }
  })
  .then(response => {


    response.data.forEach(item => {
      item.account = "resona"
      item.currency = "JPY"
    });

    console.log(response.data[0])



    axios.post('http://192.168.1.2:7086/register_multiple_balance_entries',
    response.data,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      }
    })
    .then(response => {console.log(response.data)})
    .catch(error => {console.log(error.response.data)})

  })
  .catch(error => {console.log(error.response.data)})

});
