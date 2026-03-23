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

  "/": { view: "pages/homepage" },

  // Workflow API
  "POST /workflows": "WorkflowController.create",
  "GET /workflows": "WorkflowController.find",
  "GET /workflows/:id": "WorkflowController.findOne",
  "PUT /workflows/:id": "WorkflowController.update",
  "DELETE /workflows/:id": "WorkflowController.destroy",

  // Trigger
  "POST /t/:path": "WorkflowController.trigger",
};
