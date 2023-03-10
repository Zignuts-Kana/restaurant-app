/**
 * RestaurantUserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const bcryptjs = require('bcryptjs');

module.exports = {
  registerUser: async (req, res) => {
    try {
      let admin = req.user;
      let restaurantId;
      if (admin.isSuperAdmin) {
        restaurantId = req.params.restaurantId;
        if (!restaurantId) {
          return res.status(200).send({Message:'RestaurantId Required!'});
        }
      }
      const { name, email, password } = req.body;
      const isManager = req.body.isManager ? true : undefined;
      const isWorker = req.body.isWorker ? true : undefined;
      const isCustomer = req.body.isCustomer ? true : undefined;
      const hashPassword = bcryptjs.hashSync(password, 8);
      let user = await RestaurantUser.create({
        userName: name,
        emailAddress: email,
        password: hashPassword,
        owner:admin.id,
        isManager:isManager?isManager:undefined,
        isWorker:isWorker?isWorker:undefined,
        isCustomer:isCustomer?isCustomer:undefined,
      }).fetch();
      await RestaurantUser.addToCollection(
        user.id,
        'restaurants',
        restaurantId?restaurantId:admin.restaurants[0].id
      );
      await Restaurant.addToCollection(restaurantId?restaurantId:admin.restaurants[0].id, 'users', user.id);
      return res.status(201).json({ Message: 'New user created', user });
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  },
  loginUser: async (req, res) => {
    try {
      const { userName, password } = req.body;
      let user = await RestaurantUser.findOne(userName.includes('@')?{emailAddress:userName}:{userName:userName});

      if (!user || !user.password) {
        return res.status(400).send({ Message: 'RestaurantUser Not Found!' });
      }

      const matchPassword = bcryptjs.compareSync(password, user.password);

      if (!matchPassword) {
        return res.status(401).send({ Message: 'Credencials Miss Mach!' });
      }

      const token = sails.helpers.jwtTokenGenerater(user.id);
      user = await RestaurantUser.update({ id: user.id })
        .set({ authToken: token.token, isActive: true })
        .fetch();
      user = user[0];
      return res.status(200).json(token);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  },
  logOutUser: async (req, res) => {
    try {
      const user = req.user;
      const userId = req.params.userId;
      await RestaurantUser.update({ id: userId?userId:user.id })
        .set({ authToken: '', isActive: false })
        .fetch();
      return res.status(200).json('RestaurantUser logout Successfully!');
    } catch (error) {
      console.log(error);
      return res.status(500).send({ Error: error });
    }
  },
  editUser: async (req, res) => {
    try {
      let user = req.user;
      const userId = req.params.userId;
      user = await RestaurantUser.findOne({ id: userId }).populate('restaurants');
      if (!user) {
        return res.status(400).send({ Message: 'Can not find Data!' });
      }
      if (
        user.id === userId &&
        ! (user.id !== user.restaurants[0].owner || user.isManager?user.isManager:true)
      ) {
        return res.status(403).send({ Message: 'Restricted Action!' });
      }
      const userName = req.body.userName ? req.body.userName : user.userName;
      const emailAddress = req.body.email ? req.body.email : user.emailAddress;
      const password = req.body.password ? req.body.password : user.password;
      const hashPassword = bcryptjs.hashSync(password, 8);
      user = await RestaurantUser.updateOne({ id: userId }).set({
        userName,
        emailAddress,
        password: hashPassword,
      });
      return res.status(200).send({ user });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ Error: error });
    }
  },
  getUserProfile: async (req, res) => {
    try {
      let user = req.user;
      const userId = req.params.userId ? req.params.userId : req.user.id;
      user = await RestaurantUser.findOne({ id: userId }).populate('restaurants');
      if (!user) {
        user = await RestaurantAdmin.findOne({id:userId}).populate('restaurants');
      }
      return res.status(200).send({ user });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ Error: error });
    }
  },
  deleteUser: async (req, res) => {
    try {
      let user = req.user;
      const userId = req.params.userId;
      const restaurantId = req.params.restaurantId?req.params.restaurantId:undefined;
      if (user.isSuperAdmin && !restaurantId) {
        return res.status(400).send({Message:'Restaurant ID id require!'});
      }
      let restaurant;
      if (restaurantId) {
        const restaurant = await Restaurant.findOne({id:restaurantId});
        if (!restaurant) {
          return res.status(400).send({Message:'Error while fetching data!'});
        }
      }
      let reqUser;
      if (user.isSuperAdmin === false) {
        reqUser = await RestaurantUser.findOne({id:userId}).populate('restaurants');
      }
      if (!reqUser) {
        return res.status(400).send({Message:'Data not found!'});
      }
      if (
        user.id === userId && user.isSuperAdmin === false &&
        (user.id !== user.restaurants[0].admin || user.id !== user.restaurants[0].owner || user.isManager?user.isManager:true)
      ) {
        return res.status(403).send({ Message: 'Restricted Action!' });
      }
      if (
        user.id === userId && user.isSuperAdmin && restaurant &&
        (user.id !== restaurant.admin || user.id !== restaurant.owner || user.isManager?user.isManager:true)
      ) {
        return res.status(403).send({ Message: 'Restricted Action!' });
      }
      const deletedUser = await RestaurantUser.destroy({ id: userId }).fetch();
      if (!deletedUser) {
        return res.status(400).send({ Message: 'error while delete!' });
      }
      await Restaurant.removeFromCollection(
          reqUser.restaurants[0].id,
          'users',
          user.id
      );

      return res.status(200).send({Message:'User Deleted Successfully!'});
    } catch (error) {
      console.log(error);
      return res.status(500).send({ Error: error });
    }
  },
  changeUserStatus: async (req, res) => {
    try {
      const user = req.user;
      console.log(user);
      const userId = req.params.userId;
      if (
        user.id === userId && !user.isSuperAdmin
      ) {
        return res.status(403).send({ Message: 'Restricted Action!' });
      }
      let restaurant = await Restaurant.findOne({admin:user.id});
      restaurant = restaurant ? restaurant : user.restaurants && user.restaurants.length ? user.restaurants[0] : undefined;
      if (
        (user.id === userId && restaurant) &&
        (user.id === restaurant.admin || user.id === restaurant.owner || user.isManager?user.isManager:false)
      ) {
        return res.status(403).send({ Message: 'Restricted Action!' });
      }
      let reqUser = await RestaurantAdmin.findOne({id:userId});
      if (!reqUser) {
        reqUser = await RestaurantUser.findOne({id:userId});
      }
      if (!reqUser) {
        return res.status(400).send({Message:'user not found!'});
      }
      const superCondition = (user.isSuperAdmin === false) ? true : user.isSuperAdmin;
      if ( (user.isManager && reqUser.isManager || !superCondition) || (user.isWorker) || user.isCustomer || (user.isSuperAdmin === false && reqUser.isSuperAdmin)) {
        return res.status(403).send({Message:'Restricted Action!'});
      }
      let updatesUser = await RestaurantUser.update({ id: userId }).set({ isActive: reqUser.isActive === true ? false : true }).fetch();
      if (!updatesUser.length) {
        updatesUser = await RestaurantAdmin.update({ id: userId }).set({ isActive: reqUser.isActive === true ? false : true }).fetch();
      }
      return res.status(200).send({ Message: `RestaurantUser is ${updatesUser[0].isActive === true ? `Active` :`Inactive` } Now!` });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ Error: error });
    }
  },
  changeRestaurantStatus: async (req, res) => {
    try {
      const user = req.user;
      const restaurantId = req.params.restaurantId;
      const restaurant = await Restaurant.findOne({ id: restaurantId });
      const superCondition = (user.isSuperAdmin === false) ? true : user.isSuperAdmin;
      // if (
      //   (!restaurant && !superCondition) &&
      //   !(user.id === restaurant.admin || user.id === restaurant.owner || user.isManager?user.isManager:false)
      // ) {
      //   return res.status(403).send({ Message: 'Restricted Action!' });
      // }
      if (
        user.isSuperAdmin ||
        (user.isSuperAdmin && user.isSuperAdmin === false)
          ? true
          : false
      ) {
        const restaurant = await Restaurant.findOne({ id: restaurantId });
        if (
          restaurant &&
          !(user.id !== restaurant.owner || user.id !== restaurant.admin)
        ) {
          return res.status(403).send({ Message: 'Restricted Action!' });
        }
      } else if (user.isManager) {
        if (user.restaurants.id !== restaurantId) {
          return res.status(403).send({ Message: 'Restricted Action!' });
        }
      } else if (!user.isManager && !superCondition){
        return res.status(403).send({ Message: 'Restricted Action!' });
      }
      const updatedRestaurant = await Restaurant.updateOne({ id: restaurantId }).set({ isOpen: restaurant.isOpen === true?false:true });
      return res.status(200).send({ Message: `Restaurant status ${updatedRestaurant.isOpen === true ? 'Open':'Close'} now!` });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ Error: error });
    }
  },
};
