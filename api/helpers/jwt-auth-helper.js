module.exports = {
  friendlyName: 'JWT Token Generated Success.',

  description:
        'Take user unique field for create token and store in localstorage for further use.',

  inputs: {
    token: {
      type: 'string',
      readOnly: false,
    },
  },

  fn: async function (token) {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token.token,'ThisIsSecretFro1432');
    let user = await RestaurantAdmin.findOne({id:decoded._id,isActive:true}).populate('restaurants');
    if (!user) {
      user = await RestaurantUser.findOne({id:decoded._id,isActive:true}).populate('restaurants');
    }
    return (user);
  },
};
