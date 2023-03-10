/**
 * RestaurantAdminController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const bcryptjs = require('bcryptjs');
const createSuperAdmin = async()=>{
  try {
    let superAdmin = await RestaurantAdmin.findOne({emailAddress:'admin@zignuts.com'});
    const hashPassword = bcryptjs.hashSync('admin@super', 8);
    if (!superAdmin) {
      superAdmin = await RestaurantAdmin.create({isSuperAdmin:true,adminName:'superAdmin',emailAddress:'admin@zignuts.com',password:hashPassword}).fetch();
    }
    console.info('Super Admin ID :- ' +superAdmin.id);
    return superAdmin;
  } catch (error) {
    throw error;
  }
};
createSuperAdmin();
module.exports = {
  registerAdmin:async (req,res)=>{
    try {
      const {name,email,password} = req.body;
      const hashPassword = bcryptjs.hashSync(password, 8);
      let user = await RestaurantAdmin.create({adminName:name,emailAddress:email,password:hashPassword}).fetch();

      return res.status(201).json({Message:'New user created',user});
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  },loginAdmin:async (req,res)=>{
    try {
      const {userName,password}= req.body;
      let user = await RestaurantAdmin.findOne(userName.includes('@')?{emailAddress:userName}:{adminName:userName});

      if (!user || !user.password) {
        return res.status(400).send({ Message: 'RestaurantAdmin Not Found!' });
      }

      const matchPassword = bcryptjs.compareSync(password, user.password);

      if (!matchPassword) {
        return res.status(401).send({ Message: 'Credencials Miss Mach!' });
      }

      const token = sails.helpers.jwtTokenGenerater(user.id);
      user = await RestaurantAdmin.update({id:user.id}).set({authToken:token.token,isActive:true}).fetch();
      user = user[0];
      return res.status(200).json(token);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  },logOutAdmin:async(req,res)=>{
    try {
      const user = req.user;
      await RestaurantAdmin.update({id:user.id}).set({authToken:'',isActive:false}).fetch();
      return res.status(200).json('RestaurantAdmin logout Successfully!');
    } catch (error) {
      console.log(error);
      return res.status(500).send({Error:error});
    }
  },
  editAdmin:async(req,res)=>{
    try {
      const user = req.user;
      const adminId = req.params.adminId;
      if (!(user.isSuperAdmin || user.id === adminId)) {
        return res.status(403).send({Message:'Access Denied!'});
      }
      let admin = await RestaurantAdmin.findOne({id:adminId});
      if (!admin) {
        return res.status(400).send({Message:'Can not find Data!'});
      }
      const adminName = req.body.name?req.body.name:admin.adminName;
      const emailAddress = req.body.email?req.body.email:admin.emailAddress;
      const password = req.body.password?req.body.password:admin.password;
      const hashPassword = bcryptjs.hashSync(password, 8);
      admin = await RestaurantAdmin.update({id:adminId}).set({adminName,emailAddress,password:hashPassword}).fetch();
      return res.status(200).send({admin});
    } catch (error) {
      console.log(error);
      return res.status(500).send({Error:error});
    }
  },
  getSelfProfile:async(req,res)=>{
    try {
      const user = req.user;
      return res.status(200).send({user});
    } catch (error) {
      console.log(error);
      return res.status(500).send({Error:error});
    }
  }
  // editUser:async(req,res)=>{
  //   try {
  //     const userId = req.params.userId;
  //     let user = await RestaurantUser.findOne({id:userId});
  //     if (!user) {
  //       return res.status(400).send({Message:'Can not find Data!'});
  //     }
  //     const userName = req.body.name?req.body.name:admin.userName;
  //     const emailAddress = req.body.email?req.body.email:admin.emailAddress;
  //     const password = req.body.password?req.body.password:admin.password;
  //     const hashPassword = bcryptjs.hashSync(password, 8);
  //     user = await RestaurantUser.update({id:adminId}).set({userName,emailAddress,password:hashPassword});
  //     return res.status(200).send({user});
  //   } catch (error) {
  //     console.log(error);
  //     return res.status(500).send({Error:error});
  //   }
  // }
  // ,deleteUser:async(req,res)=>{
  //   try {
  //     const admin = req.user;
  //     const userId = req.params.userId;
  //     const user = await RestaurantUser.destroy({id:userId});
  //     await RestaurantUser.removeFromCollection(user.id,'restaurants',admin.restaurants[0]);
  //     await Restaurant.removeFromCollection(admin.restaurants[0],'users',user.id);
  //     if (!user) {
  //       return res.status(400).send({Message:'error while delete!'});
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     return res.status(500).send({Error:error});
  //   }
  // }
  //   ,fetchAllRestaurantAdmin:async(req,res)=>{
  //     try {
  //       const admins = await RestaurantAdmin.find({});
  //       console.log(admins);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   }

};

