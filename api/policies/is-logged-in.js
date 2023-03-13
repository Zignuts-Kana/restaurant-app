/**
 * is-logged-in
 *
 * A simple policy that allows any request from an authenticated user.
 *
 * For more about how to use policies, see:
 *   https://sailsjs.com/config/policies
 *   https://sailsjs.com/docs/concepts/policies
 *   https://sailsjs.com/docs/concepts/policies/access-control-and-permissions
 */
module.exports = async function (req, res, proceed) {
  // RestaurantAdminController.createSuperAdmin();
  let loggedInUser;
  if (req.headers['authorization']) {
    const token = req.headers['authorization'].replace('Bearer ', '');
    const user = await sails.helpers.jwtAuthHelper(token);
    if (!user || !user.authToken) {
      return res.status(401).send({Message:'Unauthorized'});
    }
    if (user.authToken !== token) {
      return res.status(401).send({Message:'Expired Token!'});
    }
    loggedInUser = user;
  }
  if (req.query.token) {
    const token = decodeURIComponent(req.query.token);
    const user = await sails.helpers.jwtAuthHelper(token);
    if (!user && !user.token) {
      return res.status(401).send({Message:'Unauthorized'});
    }
    if (user.authToken !== token) {
      return res.status(401).send({Message:'Expired Token!'});
    }
    loggedInUser = user;
  }
  if (!loggedInUser) {
    return res.status(401).send({Message:'Unauthorized'});
  }

  // Otherwise, look up the logged-in user.

  // If the logged-in user has gone missing, log a warning,
  // wipe the user id from the requesting user agent's session,
  // and then send the "unauthorized" response.
  if (!loggedInUser) {
    sails.log.warn(
      'Somehow, the user record for the logged-in user (`' +
        req.session.userId +
        '`) has gone missing....'
    );
    return res.redirect('/login');
  }

  req.user = loggedInUser;

  return proceed();

  //   // If `req.me` is set, then we know that this request originated
  //   // from a logged-in user.  So we can safely proceed to the next policy--
  //   // or, if this is the last policy, the relevant action.
  //   // > For more about where `req.me` comes from, check out this app's
  //   // > custom hook (`api/hooks/custom/index.js`).
  //   if (req.me) {
  //     return proceed();
  //   }
  // console.log('here');
  //   //--•
  //   // Otherwise, this request did not come from a logged-in user.
  //   return res.view('pages/login');
};
