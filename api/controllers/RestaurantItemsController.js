/**
 * RestaurantItemsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  addItem:async(req,res)=>{
    try {
      const user = req.user;
      const menuId = req.params.menuId;
      if (!(user.id === user.restaurants[0].admin || user.id === user.restaurants[0].owner || user.isManager)) {
        return res.status(403).send({Message:'Restricted Action!'});
      }
      const menu = await RestaurantMenu.findOne({id:menuId});
      console.log(menu);
      if (!menu) {
        return res.status(400).send({Message:'Can not find data!'});
      }
      const {itemName} = req.body;
      const item = await RestaurantItems.create({managerId:menu.managerId,menuId:menu.id,restaurantId:menu.restaurantId,itemName}).fetch();
      return res.status(200).send({item});
    } catch (error) {
      console.log(error);
      return res.status(500).send({Error:error});
    }
  },
  editItem:async(req,res)=>{
    try {
      const user = req.user;
      const itemId = req.params.itemId;
      if (!(user.id === user.restaurants[0].admin || user.id === user.restaurants[0].owner || user.isManager)) {
        return res.status(403).send({Message:'Restricted Action!'});
      }
      let item = await RestaurantItems.findOne({id:itemId});
      if (!item) {
        return res.status(400).send({Message:'Can not find data!'});
      }
      const {itemName} = req.body;
      item = await RestaurantItems.update({id:itemId}).set({itemName}).fetch();
      return res.status(200).send({item});
    } catch (error) {
      console.log(error);
      return res.status(500).send({Error:error});
    }
  },getItem:async(req,res)=>{
    try {
      const itemId = req.params.itemId;
      const item = await RestaurantItems.find({id:itemId});
      if (!item) {
        return res.status(400).send({Message:'Can not find data!'});
      }
      return res.status(200).send({item});
    } catch (error) {
      console.log(error);
      return res.status(500).send({Error:error});
    }
  },deleteItem:async(req,res)=>{
    try {
      const user = req.user;
      const itemId = req.params.itemId;
      if (!(user.id === user.restaurants[0].admin || user.id === user.restaurants[0].owner || user.isManager)) {
        return res.status(403).send({Message:'Restricted Action!'});
      }
      let item = await RestaurantItems.destroy({id:itemId}).fetch();
      if (!item) {
        return res.status(400).send({Message:'error while delete!'});
      }
      return res.status(200).send({item});
    } catch (error) {
      console.log(error);
      return res.status(500).send({Error:error});
    }
  }
};

