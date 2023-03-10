module.exports = {
  friendlyName: 'JWT Token Generated Success.',

  description:
    'Take user unique field for create token and store in localstorage for further use.',

  sync: true,

  inputs: {
    id: {
      type: 'string',
      readOnly: false,
    },
  },

  fn: function (id) {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({_id:id.id},'ThisIsSecretFro1432',{ expiresIn: 24*60*60*1000 });
    return {token};
  },
};
