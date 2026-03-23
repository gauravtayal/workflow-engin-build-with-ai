/**
 * WorkflowController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const { randomUUID } = require("crypto");

module.exports = {
  /**
   * Create a new workflow
   */
  create: async function (req, res) {
    try {
      const { name, steps, enabled } = req.body;

      // Generate trigger path
      // "The engine should generate a random URL path for each workflow’s HTTP trigger"
      const triggerPath = `/t/${randomUUID().replace(/-/g, "")}`;

      const workflow = await Workflow.create({
        name,
        enabled: enabled !== undefined ? enabled : true,
        triggerPath,
        steps: steps || [],
      }).fetch();

      return res.status(201).json(workflow);
    } catch (err) {
      return res.serverError(err);
    }
  },

  /**
   * Trigger a workflow
   */
  trigger: async function (req, res) {
    try {
      const path = req.param("path"); // /t/:path
      const triggerPath = `/t/${path}`;

      const workflow = await Workflow.findOne({ triggerPath });

      if (!workflow) {
        return res.notFound({ message: "Workflow not found" });
      }

      if (!workflow.enabled) {
        return res.status(404).json({ message: "Workflow is disabled" }); // Or 403
      }

      // Initialize context with request body
      const initialContext = req.body || {};

      const run = await WorkflowEngine.executeWorkflow(
        workflow,
        initialContext,
      );

      return res.json({
        runId: run.id,
        status: run.status,
        logs: run.logs,
      });
    } catch (err) {
      return res.serverError(err);
    }
  },

  /**
   * List workflows
   */
  find: async function (req, res) {
    try {
      const workflows = await Workflow.find();
      return res.json(workflows);
    } catch (err) {
      return res.serverError(err);
    }
  },

  /**
   * Get one workflow
   */
  findOne: async function (req, res) {
    try {
      const workflow = await Workflow.findOne({ id: req.params.id }).populate(
        "runs",
      );
      if (!workflow) return res.notFound();
      return res.json(workflow);
    } catch (err) {
      return res.serverError(err);
    }
  },

  /**
   * Update workflow
   */
  update: async function (req, res) {
    try {
      const updated = await Workflow.update({ id: req.params.id })
        .set(req.body)
        .fetch();
      return res.json(updated[0]);
    } catch (err) {
      return res.serverError(err);
    }
  },

  /**
   * Delete workflow
   */
  destroy: async function (req, res) {
    try {
      await Workflow.destroy({ id: req.params.id });
      return res.ok();
    } catch (err) {
      return res.serverError(err);
    }
  },
};
