/**
 * Workflow.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    name: {
      type: "string",
      required: true,
    },

    enabled: {
      type: "boolean",
      defaultsTo: true,
    },

    triggerPath: {
      type: "string",
      required: true,
      unique: true,
    },

    steps: {
      type: "json",
      defaultsTo: [],
    },

    // Associations
    runs: {
      collection: "WorkflowRun",
      via: "workflow",
    },
  },
};
