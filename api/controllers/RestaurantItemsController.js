/**
 * RestaurantItemsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  addItem: async (req, res) => {
    try {
      const user = req.user;
      console.log(user);
      const menuId = req.params.menuId;
      const menu = await RestaurantMenu.findOne({ id: menuId }).populate(
        'items'
      );
      if (!menu) {
        return res.status(400).send({ Message: 'Can not find data!' });
      }
      const restaurant = await Restaurant.findOne({ id: menu.restaurantId });
      if (!restaurant) {
        return res.status(400).send({ Message: 'Error while fetching data!' });
      }
      // if (user.id !== restaurant.admin || user.id !== restaurant.owner || user.isManager?user.isManager:true) {
      //   return res.status(403).send({Message:'Restricted Action!'});
      // }else if(!user.isManager){
      //   return res.status(403).send({Message:'Restricted Action!'});
      // }
      if (
        user.isSuperAdmin || (user.isSuperAdmin && user.isSuperAdmin === false)
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
      } else if (
        user.isSuperAdmin && user.isSuperAdmin === false
          ? true
          : false && !user.isManager
      ) {
        console.log('here');
        return res.status(403).send({ Message: 'Restricted Action!' });
      }

      const nameAlreadyTaken = menu.items.some(
        (item) => item.itemName === req.body.itemName
      );
      if (nameAlreadyTaken) {
        return res.status(400).send({ Message: 'Item already exist!' });
      }
      const { itemName } = req.body;
      const item = await RestaurantItems.create({
        managerId: menu.managerId,
        menuId: menu.id,
        restaurantId: menu.restaurantId,
        itemName,
      }).fetch();
      return res.status(200).send({ item });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ Error: error });
    }
  },
  editItem: async (req, res) => {
    try {
      const user = req.user;
      const itemId = req.params.itemId;
      let item = await RestaurantItems.findOne({ id: itemId });
      if (!item) {
        return res.status(400).send({ Message: 'Can not find data!' });
      }
      const restaurant = await Restaurant.findOne({ id: item.restaurantId });
      if (!restaurant) {
        return res.status(400).send({ Message: 'Error while fetching data!' });
      }
      if (
        user.isSuperAdmin ||
        (user.isSuperAdmin && user.isSuperAdmin === false)
          ? true
          : false
      ) {
        const restaurant = await Restaurant.findOne({ id: item.restaurantId });
        if (
          restaurant &&
          !(user.id !== restaurant.owner || user.id !== restaurant.admin)
        ) {
          return res.status(403).send({ Message: 'Restricted Action!' });
        }
      } else if (!user.isManager) {
        return res.status(403).send({ Message: 'Restricted Action!' });
      }
      const menu = await RestaurantMenu.findOne({ id: item.menuId }).populate(
        'items'
      );
      const nameAlreadyTaken = menu.items.some(
        (item) => item.itemName === req.body.itemName
      );
      if (nameAlreadyTaken) {
        return res.status(400).send({ Message: 'Item already exist!' });
      }
      const { itemName } = req.body;
      item = await RestaurantItems.update({ id: itemId })
        .set({ itemName })
        .fetch();
      return res.status(200).send({ item });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ Error: error });
    }
  },
  getItem: async (req, res) => {
    try {
      const itemId = req.params.itemId;
      const item = await RestaurantItems.find({ id: itemId });
      if (!item) {
        return res.status(400).send({ Message: 'Can not find data!' });
      }
      return res.status(200).send({ item });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ Error: error });
    }
  },
  deleteItem: async (req, res) => {
    try {
      const user = req.user;
      const itemId = req.params.itemId;
      let item = await RestaurantItems.findOne({ id: itemId });
      if (!item) {
        return res.status(400).send({ Message: 'Can not find data!' });
      }
      const restaurant = await Restaurant.findOne({ id: item.restaurantId });
      if (!restaurant) {
        return res.status(400).send({ Message: 'Error while fetching data!' });
      }
      if (
        user.isSuperAdmin ||
        (user.isSuperAdmin && user.isSuperAdmin === false)
          ? true
          : false
      ) {
        const restaurant = await Restaurant.findOne({ id: item.restaurantId });
        if (
          restaurant &&
          !(user.id !== restaurant.owner || user.id !== restaurant.admin)
        ) {
          return res.status(403).send({ Message: 'Restricted Action!' });
        }
      } else if (!user.isManager) {
        return res.status(403).send({ Message: 'Restricted Action!' });
      }
      item = await RestaurantItems.destroy({ id: itemId }).fetch();
      return res.status(200).send({ item });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ Error: error });
    }
  },
  changeItemStatus: async (req, res) => {
    try {
      const user = req.user;
      const itemId = req.params.itemId;
      let item = await RestaurantItems.findOne({ id: itemId });
      if (!item) {
        return res.status(400).send({ Message: 'Can not find data!' });
      }
      const restaurant = await Restaurant.findOne({ id: item.restaurantId });
      if (!restaurant) {
        return res.status(400).send({ Message: 'Error while fetching data!' });
      }
      if (
        user.isSuperAdmin ||
        (user.isSuperAdmin && user.isSuperAdmin === false)
          ? true
          : false
      ) {
        const restaurant = await Restaurant.findOne({ id: item.restaurantId });
        if (
          restaurant &&
          !(user.id !== restaurant.owner || user.id !== restaurant.admin)
        ) {
          return res.status(403).send({ Message: 'Restricted Action!' });
        }
      } else if (!user.isManager) {
        return res.status(403).send({ Message: 'Restricted Action!' });
      }
      item = await RestaurantItems.updateOne({id:itemId}).set({isAvailable:item.isAvailable === false ? true :false})
      return res
        .status(200)
        .send({
          Message: `Item status changed to ${
            item.isAvailable === true ? ' is available.' : ' is unavailable.'
          }`,
        });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ Error: error });
    }
  },
};
