// "use strict";

import axios from "axios";

const options = {
  method: 'GET',
  url: 'http://localhost:5000/api/auth/signup',
  headers: {'content-type': 'application/json'},
  data: {email: 'jeel@gmail.com', password: '12345'}
};

axios.request(options).then(function (response) {
  console.log(response.data);
}).catch(function (error) {
  console.error(error);
});