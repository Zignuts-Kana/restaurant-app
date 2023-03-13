/**
 * RestaurantController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const bcryptjs = require('bcryptjs');

module.exports = {
  createRestaurant : async (req,res)=>{
    try {
      const user = req.user;
      if (!user.isSuperAdmin) {
        return res.status(403).send({Message:'Access denied!'});
      }
      const {restaurantName} = req.body;
      const {adminName,emailAddress,password} = req.body;
      const hashPassword = bcryptjs.hashSync(password, 8);

      const admin = await RestaurantAdmin.create({adminName,emailAddress,isOpen:true,password:hashPassword}).fetch();
      const restaurant = await Restaurant.create({admin:admin.id,restaurantName,owner:user.id}).fetch();

      await RestaurantAdmin.addToCollection(user.id,'admins',admin.id);
      await RestaurantAdmin.addToCollection(admin.id,'superAdmin',user.id);
      return res.status(200).send({restaurant,admin});
    } catch (error) {
      console.log(error);
      return res.status(500).send({Error:error});
    }
  },
  getRestaurant : async(req,res)=>{
    try {
      // const user = req.user;
      const restaurantId = req.params.restaurantId;
      const restaurantUsers = await Restaurant.find({id:restaurantId}).populate('users');
      const restaurantItems = await Restaurant.find({id:restaurantId}).populate('menuCollections');
      if(!restaurantUsers || !restaurantItems){
        return res.status(400).send({Message:'Restaurant not found!'});
      }
      return res.status(200).send({users:restaurantUsers.users,restaurant:restaurantItems });
    } catch (error) {
      console.log(error);
      return res.status(500).send({Error:error});
    }
  },
  updateRestaurant : async(req,res)=>{
    try {
      const user = req.user;
      const restaurantId = req.params.restaurantId;
      const {restaurantName} = req.body;
      let restaurant = await Restaurant.findOne({id:restaurantId});
      if(restaurant &&
        !(restaurant.owner !== user.id || restaurant.admin !== user.id)){
        return res.status(400).send({Message:'Access Denied!'});
      }
      restaurant = await Restaurant.update({id:restaurantId}).set({restaurantName}).fetch();
      return res.status(200).send({restaurant});
    } catch (error) {
      console.log(error);
      return res.status(500).send({Error:error});
    }
  },
  deleteRestaurant : async(req,res)=>{
    try {
      const admin = req.user;
      if (user.isSuperAdmin === false) {
        return res.status(403).send({Message:'Access denied!'});
      }
      const restaurantId = req.params.restaurantId;
      const restaurant = await Restaurant.destroy({id:restaurantId});
      await RestaurantAdmin.removeFromCollection(user.id,'admins',admin.id);
      await RestaurantAdmin.removeFromCollection(admin.id,'superAdmin',user.id);
      if (!restaurant) {
        return res.status(400).send({Message:'Error while delete!'});
      }
      return res.status(200).send({restaurant});
    } catch (error) {
      console.log(error);
      return res.status(500).send({Error:error});
    }
  },getAllUserOfRestaurant : async (req,res)=>{
    try {
      // const user = req.user;
      const restaurantId = req.params.restaurantId;
      const restaurant = await Restaurant.findOne({id:restaurantId}).populate('users');
      if (!restaurant) {
        return res.status(400).send({Message:'Data not found!'});
      }
      return res.status(200).send({restaurant});
    } catch (error) {
      console.log(error);
      return res.status(500).send({Error:error});
    }
  }
};

