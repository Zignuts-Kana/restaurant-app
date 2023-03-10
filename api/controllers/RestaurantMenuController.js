/**
 * RestaurantMenuController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */


module.exports = {
  createMenuCategory:async(req,res)=>{
    try {
      const user = req.user;
      let manager;
      const restaurantId = req.params.restaurantId;
      const restaurant = await Restaurant.findOne({id:restaurantId});
      if (!restaurant) {
        return res.status(400).send({Message:'Data not found!'});
      }
      if (!(user.id === user.restaurants[0].admin || user.id === user.restaurants[0].owner || user.isManager)) {
        return res.status(403).send({Message:'Restricted Action!'});
      }
      if(!user.isManager){
        manager = await RestaurantUser.find({isManager:true}).populate('restaurants');
        manager = manager.filter((element)=>element.restaurants[0].id === restaurantId);
      }
      const {category}= req.body;
      const menu = await RestaurantMenu.create({restaurantId,category,owner:manager?manager.owner:user.id,managerId:manager?manager.id:user.id}).fetch();
      return res.status(200).send({menu});
    } catch (error) {
      console.log(error);
      return res.status(500).send({Error:error});
    }
  },
  editMenuCategory:async(req,res)=>{
    try {
      const user = req.user;
      const menuId = req.params.menuId;
      let menu = await RestaurantMenu.findOne({id:menuId});
      if (!menu || !(user.id === user.restaurants[0].admin || user.id === user.restaurants[0].owner || user.isManager)) {
        return res.status(403).send({Message:'Restricted Action!'});
      }
      const {category} = req.body;
      menu = await RestaurantMenu.update({id:menuId}).set({category}).fetch();
      return res.status(200).send({menu});
    } catch (error) {
      console.log(error);
      return res.status(500).send({Error:error});
    }
  },getAllItemsOfMenuCategory:async(req,res)=>{
    try {
      const menuId = req.params.menuId;
      const menu = await RestaurantMenu.find({id:menuId}).populate('items');
      if (!menu) {
        return res.status(400).send({Message:'Data not found!'});
      }
      return res.status(200).send({menu});
    } catch (error) {
      console.log(error);
      return res.status(500).send({Error:error});
    }
  },deleteMenuCategory:async(req,res)=>{
    try {
      const user = req.user;
      const menuId = req.params.menuId;
      if (!(user.id === user.restaurants[0].admin || user.id === user.restaurants[0].owner || user.isManager)) {
        return res.status(403).send({Message:'Restricted Action!'});
      }
      const menu = await RestaurantMenu.destroy({id:menuId}).fetch();
      if (!menu) {
        return res.status(400).send({Message:'Error while delete!'});
      }
      return res.status(200).send({Message:'Delete category successful!'});
    } catch (error) {
      console.log(error);
      return res.status(500).send({Error:error});
    }
  }
  // createMenuCategory:async(req,res)=>{
  //     try {

  //     } catch (error) {
  //         console.log(error);
  //         return res.status(500).send({Error:error});
  //     }
  // }
};

