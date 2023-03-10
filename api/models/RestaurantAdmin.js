/**
 * RestaurantAdmin.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝


    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    isSuperAdmin:{
      type:'boolean',
      defaultsTo:false,
    },
    isActive:{
      type:'boolean',
      defaultsTo:false,
    },
    adminName:{
      type:'string',
    },
    emailAddress:{
      type:'string',
      isEmail:true,
      unique:true,
      required:true,
    },
    password:{
      type:'string',
      required:true,
    },
    authToken:{
      type:'string'
    },
    users:{
      collection:'restaurantuser',
      via:'owner'
    },
    superAdmin:{
      collection:'restaurantadmin',
      via:'admins'
    },
    admins:{
      collection:'restaurantadmin',
      via:'superAdmin'
    },
    restaurants:{
      collection:'restaurant',
      via:'admin'
    }
  },

};

