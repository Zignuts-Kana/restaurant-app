/**
 * RestaurantMenuController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  createMenuCategory: async (req, res) => {
    try {
      const user = req.user;
      let manager;
      const restaurantId = req.params.restaurantId;
      const restaurant = await Restaurant.findOne({
        id: restaurantId,
      }).populate('menuCollections');
      if (!restaurant) {
        return res.status(400).send({ Message: 'Data not found!' });
      }
      let superCondition =
        (user.id !== restaurant.admin) ^ (user.id !== restaurant.owner); //super admin true , admin true
      superCondition = superCondition === 1 ? true : false;
      console.log(superCondition); //only true in 1x0 or 0x1
      let getManager =
        restaurant.menuCollections && restaurant.menuCollections.length
          ? restaurant.menuCollections[0].restaurantId === user.id ? restaurant.menuCollections[0].restaurantId : undefined
          : undefined;
      if (!getManager) {
        getManager = await Restaurant.findOne({ id: restaurantId }).populate(
          'users'
        );
        if (getManager) {
          getManager = getManager.users.some(
            (element) => element.id === user.id && element.isManager === true
          );
        }
      }
      const userCondition = getManager ? true : false;
      console.log(userCondition); //only true in not manager
      if ((superCondition || userCondition) === true ? false : true) {
        return res.status(403).send({ Message: 'Restricted Action!' });
      }
      const nameAlreadyTaken = restaurant.menuCollections.some(
        (menu) => menu.category === req.body.category
      );
      if (nameAlreadyTaken) {
        return res.status(400).send({ Message: 'Category already exist!' });
      }
      if (!user.isManager) {
        manager = await RestaurantUser.find({ isManager: true }).populate(
          'restaurants'
        );
        manager = manager.filter(
          (element) => element.restaurants[0].id === restaurantId
        );
      }
      manager = manager && manager.length ? manager[0] :undefined;
      const { category } = req.body;
      const menu = await RestaurantMenu.create({
        restaurantId,
        category,
        owner: manager ? manager.owner : user.owner,
        managerId: manager ? manager.id : user.id,
      }).fetch();
      return res.status(200).send({ menu });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ Error: error });
    }
  },
  editMenuCategory: async (req, res) => {
    try {
      const user = req.user;
      console.log(user);
      const menuId = req.params.menuId;
      let menu = await RestaurantMenu.findOne({ id: menuId });
      if (!menu) {
        return res.status(400).send({Message:'Data not found!'});
      }
      if (
        user.isSuperAdmin ||
        (user.isSuperAdmin && user.isSuperAdmin === false)
          ? true
          : false
      ) {
        const restaurant = await Restaurant.findOne({ id: menu.restaurantId });
        if (
          restaurant &&
          !(user.id !== restaurant.owner || user.id !== restaurant.admin)
        ) {
          return res.status(403).send({ Message: 'Restricted Action!' });
        }
      } else if (!user.isManager) {
        return res.status(403).send({ Message: 'Restricted Action!' });
      }
      const { category } = req.body;
      menu = await RestaurantMenu.update({ id: menuId })
        .set({ category })
        .fetch();
      return res.status(200).send({ menu });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ Error: error });
    }
  },
  getAllItemsOfMenuCategory: async (req, res) => {
    try {
      const menuId = req.params.menuId;
      const menu = await RestaurantMenu.find({ id: menuId }).populate('items');
      if (!menu) {
        return res.status(400).send({ Message: 'Data not found!' });
      }
      return res.status(200).send({ menu });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ Error: error });
    }
  },
  deleteMenuCategory: async (req, res) => {
    try {
      const user = req.user;
      const menuId = req.params.menuId;
      // if (
      //   !(user.id === user.restaurants[0].admin ||
      //   user.id === user.restaurants[0].owner ||
      //   user.isManager
      //     ? user.isManager
      //     : true)
      // ) {
      //   return res.status(403).send({ Message: 'Restricted Action!' });
      // }
      let menu = await RestaurantMenu.findOne({ id: menuId });
      if (!menu) {
        return res.status(400).send({Message:'Data not found!'})
      }
      if (
        user.isSuperAdmin ||
        (user.isSuperAdmin && user.isSuperAdmin === false)
          ? true
          : false
      ) {
        const restaurant = await Restaurant.findOne({ id: menu.restaurantId });
        if (
          restaurant &&
          !(user.id !== restaurant.owner || user.id !== restaurant.admin)
        ) {
          return res.status(403).send({ Message: 'Restricted Action!' });
        }
      } else if (!user.isManager) {
        return res.status(403).send({ Message: 'Restricted Action!' });
      }
      menu = await RestaurantMenu.destroy({ id: menuId }).fetch();
      if (!menu) {
        return res.status(400).send({ Message: 'Error while delete!' });
      }
      return res.status(200).send({ Message: 'Delete category successful!' });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ Error: error });
    }
  },
  changeMenuStatus: async (req, res) => {
    try {
      const user = req.user;
      const menuId = req.params.menuId;
      let menu = await RestaurantMenu.findOne({ id: menuId });
      if (!menu) {
        return res.status(400).send({Message:'Data not found!'})
      }
      if (
        user.isSuperAdmin ||
        (user.isSuperAdmin && user.isSuperAdmin === false)
          ? true
          : false
      ) {
        const restaurant = await Restaurant.findOne({ id: menu.restaurantId });
        if (
          restaurant &&
          !(user.id !== restaurant.owner || user.id !== restaurant.admin)
        ) {
          return res.status(403).send({ Message: 'Restricted Action!' });
        }
      }else if (user.isManager) {
        if (user.restaurants.id !== restaurantId) {
          return res.status(403).send({ Message: 'Restricted Action!' });
        }
      } else if (!user.isManager && !superCondition){
        return res.status(403).send({ Message: 'Restricted Action!' });
      }
      await RestaurantMenu.updateOne({ id: menuId }).set({
        isAvailable: menu.isAvailable === false ? true : false,
      });
      return res.status(200).send({
        Message: `Menu category status changed to ${
          menu.isAvailable === false ? ' is available.' : ' is unavailable.'
        }`,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ Error: error });
    }
  },listOfMenuForPublic :async (req,res)=>{
    try {
      // const user = req.user;
      const restaurantId = req.params.restaurantId;
      const restaurant = await Restaurant.findOne({id:restaurantId});
      if (!restaurant) {
        return res.status(400).send({Message:'Can not find data!'});
      }
      const categories = await RestaurantMenu.find({restaurantId}).populate('items');
      const restaurantItems = {};
      categories.forEach((category,index)=>{
        console.log(index,category.category);
        category.items.forEach(item=>{
          if (!restaurantItems[categories[index].category]) {
            console.log('1',item.itemName);
            restaurantItems[categories[index].category] = item.itemName === undefined?[]:[item.itemName];
          }else{
            console.log('2',item.itemName);
            restaurantItems[categories[index].category].push(item.itemName);
          }
        });
      });
      return res.status(200).send({Restaurant:restaurant.restaurantName , restaurantItems});
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
