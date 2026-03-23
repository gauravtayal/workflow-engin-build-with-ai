/**
 * WorkflowRun.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    status: {
      type: "string",
      isIn: ["pending", "success", "skipped", "failed"],
      defaultsTo: "pending",
    },

    startedAt: {
      type: "number",
      defaultsTo: Date.now(),
    },

    finishedAt: {
      type: "number",
    },

    context: {
      type: "json",
    },

    error: {
      type: "json",
    },

    logs: {
      type: "json",
      defaultsTo: [],
    },

    // Associations
    workflow: {
      model: "Workflow",
      required: true,
    },
  },
};
