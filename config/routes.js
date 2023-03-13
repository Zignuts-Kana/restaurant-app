/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` your home page.            *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  '/': { view: 'pages/homepage' },

  'GET /admin/profile':'RestaurantAdminController.getSelfProfile',//get admin profile
  'GET /user/profile/:userId':'RestaurantUserController.getUserProfile',//get any profile
  'GET /user/profile':'RestaurantUserController.getUserProfile',//get any profile
  'GET /restaurant/:restaurantId/users':'RestaurantController.getAllUserOfRestaurant',//get all users of restaurant
  'GET /user/:userId/status/change':'RestaurantUserController.changeUserStatus',//Change user status
  'GET /restaurant/:restaurantId/status/change':'RestaurantUserController.changeRestaurantStatus',//Change restaurant status
  'GET /restaurant/menu/:menuId/status/change':'RestaurantMenuController.changeMenuStatus',//change status of category to unavailable
  'GET /menu/item/:itemId/status/change':'RestaurantItemsController.changeItemStatus',//change status of item to unavailable
  'GET /restaurant/:restaurantId':'RestaurantController.getRestaurant',//detail of restaurant
  'GET /user/profile/restaurant':'RestaurantUserController.getUserProfile',//get profile with restaurant

  'POST /admin/login':'RestaurantAdminController.loginAdmin',//login super admin or admin
  'POST /admin/restaurant/create':'RestaurantController.createRestaurant',//create restaurant and admin
  'POST /admin/edit/:adminId':'RestaurantAdminController.editAdmin',//edit Admin by super
  'POST /restaurant/:restaurantId/update':'RestaurantController.updateRestaurant',//update restaurant
  'POST /admin/create/restaurant/user':'RestaurantUserController.registerUser',//register new user by admin
  'POST /admin/create/restaurant/:restaurantId/user':'RestaurantUserController.registerUser',//register new user by super admin
  'POST /user/login':'RestaurantUserController.loginUser',//login user
  'POST /user/:userId/update':'RestaurantUserController.editUser',//update user


  'GET /user/:userId/logout':'RestaurantUserController.logOutUser',//logout user
  'GET /user/logout':'RestaurantUserController.logOutUser',//logout user
  'GET /admin/logout':'RestaurantAdminController.logOutAdmin',//logout super admin or admin
  'GET /user/:userId/delete':'RestaurantUserController.deleteUser',//delete user by admin

  //menu and items

  'GET /restaurant/menu/:menuId/items':'RestaurantMenuController.getAllItemsOfMenuCategory',//get all items of category
  'GET /menu/items/:itemId':'RestaurantItemsController.getItem',//get item

  'POST /user/restaurant/:restaurantId/menu/add':'RestaurantMenuController.createMenuCategory',//add new category
  'POST /user/restaurant/menu/:menuId/update':'RestaurantMenuController.editMenuCategory',//update category
  'POST /menu/:menuId/item/add':'RestaurantItemsController.addItem',//add new item in category
  'POST /menu/item/:itemId/update':'RestaurantItemsController.editItem',//update item in category

  'GET /restaurant/menu/:menuId/delete':'RestaurantMenuController.deleteMenuCategory',//delete category
  'GET /menu/items/:itemId/delete':'RestaurantItemsController.deleteItem',//delete item


  /***************************************************************************
  *                                                                          *
  * More custom routes here...                                               *
  * (See https://sailsjs.com/config/routes for examples.)                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the routes in this file, it   *
  * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
  * not match any of those, it is matched against static assets.             *
  *                                                                          *
  ***************************************************************************/


};
