module.exports = {
  friendlyName: 'JWT Token Generated Success.',

  description:
      'Take user unique field for create token and store in localstorage for further use.',

  sync: true,

  inputs: {
    user: {
      type: 'ref',
      readOnly: false,
    },
  },

  fn: function (token) {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token.user,'ThisIsSecretFro1432');
    return {decoded};
  },
};

