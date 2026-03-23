/**
 * WorkflowEngine.js
 *
 * @description :: Service to handle workflow execution
 */

const { randomUUID } = require("crypto");

module.exports = {
  /**
   * Execute a workflow run
   * @param {Object} workflow
   * @param {Object} initialContext
   */
  executeWorkflow: async function (workflow, initialContext) {
    const run = await WorkflowRun.create({
      workflow: workflow.id,
      status: "pending",
      startedAt: Date.now(),
      context: initialContext,
      logs: [],
    }).fetch();

    try {
      let context = _.cloneDeep(initialContext);
      let logs = [];

      for (const step of workflow.steps) {
        if (run.status === "skipped" || run.status === "failed") break;

        try {
          const result = await this.executeStep(step, context);

          if (result.skipped) {
            run.status = "skipped";
            logs.push({
              step,
              status: "skipped",
              message: "Step condition not met",
            });
          } else {
            // Merge returned context modifications or use returned context
            // The logic depends on requirements.
            // - Transform: modify ctx
            // - Filter: pass ctx
            // - HTTP: access ctx

            if (result.context) {
              context = result.context;
            }
            logs.push({ step, status: "success" });
          }
        } catch (stepError) {
          console.error("Step execution failed:", stepError);
          run.status = "failed";
          run.error = { message: stepError.message, step };
          logs.push({ step, status: "failed", error: stepError.message });
          break; // Stop on first failure
        }
      }

      if (run.status === "pending") {
        run.status = "success";
      }

      await WorkflowRun.update({ id: run.id }).set({
        status: run.status,
        finishedAt: Date.now(),
        context: context,
        logs: logs,
        error: run.error,
      });

      return run;
    } catch (err) {
      console.error("Workflow execution error:", err);
      // Fallback update if something crashes badly
      await WorkflowRun.update({ id: run.id }).set({
        status: "failed",
        finishedAt: Date.now(),
        error: { message: err.message },
      });
    }
  },

  executeStep: async function (step, context) {
    switch (step.type) {
      case "transform":
        return this.executeTransformStep(step, context);
      case "filter":
        return this.executeFilterStep(step, context);
      case "http_request":
        return this.executeHttpRequestStep(step, context);
      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  },

  executeTransformStep: async function (step, context) {
    const newContext = _.cloneDeep(context);

    for (const op of step.ops) {
      if (op.op === "default") {
        // "default": set a default value if a field is missing/null/empty
        const val = _.get(newContext, op.path);
        if (val === undefined || val === null || val === "") {
          _.set(newContext, op.path, op.value);
        }
      } else if (op.op === "template") {
        // "template": create a string using {{variable}} placeholders
        const rendered = this.applyTemplate(op.template, newContext);
        _.set(newContext, op.to, rendered);
      } else if (op.op === "pick") {
        // "pick": keep only specified fields in ctx (or within a sub-object)
        // This is a bit ambiguous: "keep only specified fields in ctx" usually means the root ctx.
        // But "or within a sub-object" implies we might picking specific keys.
        // Assuming root context pick for specific paths.

        // However, standard limit is usually creating a new object with picked keys.
        // If paths is ["a", "b.c"], it's complex.
        // Lodash pick works on own properties.
        // Let's implement a simple pick implementation for root properties.

        // If paths contains nested paths like 'a.b', _.pick doesn't support it directly in older versions?
        // Sails bundles @sailshq/lodash which is lodash 3.10.x.
        // We might need to iterate.

        const picked = {};
        for (const path of op.paths) {
          const val = _.get(newContext, path);
          if (val !== undefined) {
            _.set(picked, path, val);
          }
        }
        // Replace context with picked? Or just pick...
        // "keep only specified fields in ctx" -> Replace ctx with picked object.
        // But invalidating the reference might be tricky if we want to assign back.
        // We returned `newContext` above.
        // So we should return the picked object as the new context.
        return { context: picked };
      }
    }

    return { context: newContext };
  },

  executeFilterStep: async function (step, context) {
    for (const condition of step.conditions) {
      const val = _.get(context, condition.path);
      const expected = condition.value;

      let passed = false;
      if (condition.op === "eq") {
        passed = _.isEqual(val, expected);
      } else if (condition.op === "neq") {
        passed = !_.isEqual(val, expected);
      }

      if (!passed) {
        return { skipped: true };
      }
    }
    return { skipped: false, context };
  },

  executeHttpRequestStep: async function (step, context) {
    // Resolve template variables in inputs
    const method = step.method || "GET";
    const url = this.applyTemplate(step.url, context);

    const headers = {};
    if (step.headers) {
      for (const [k, v] of Object.entries(step.headers)) {
        headers[k] = this.applyTemplate(v, context);
      }
    }

    let body = undefined;
    if (step.body) {
      if (step.body.mode === "ctx") {
        body = JSON.stringify(context);
      } else if (step.body.mode === "custom" && step.body.value) {
        // Deep template replacement on value object?
        // For simplicity, convert to string, replace, parse back?
        // Or just iterate.
        // Let's do simple stringify-template-parse for full object support
        const bodyStr = JSON.stringify(step.body.value);
        const renderedBodyStr = this.applyTemplate(bodyStr, context);
        body = renderedBodyStr;
      }
    }

    const timeout = step.timeoutMs || 5000;
    const retries = step.retries || 0;

    let attempt = 0;
    let lastError;

    while (attempt <= retries) {
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          method,
          headers,
          body,
          signal: controller.signal,
        });

        clearTimeout(id);

        if (!response.ok && response.status >= 500) {
          throw new Error(`HTTP ${response.status}`);
        }

        // Step successful, return context (HTTP request steps usually don't modify ctx unless specified,
        // requirements say "modify ctx" is for Transform. HTTP just executes.)
        // But maybe we want to store the response?
        // "HTTP request steps must respect timeoutMs and retries" - no mention of capturing output.
        // Assuming side-effect only for now.
        return { context };
      } catch (err) {
        lastError = err;
        attempt++;
        if (attempt <= retries) {
          // simple backoff
          await new Promise((r) => setTimeout(r, 1000 * attempt));
        }
      }
    }

    throw lastError;
  },

  applyTemplate: function (templateStr, context) {
    if (typeof templateStr !== "string") return templateStr;
    return templateStr.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const val = _.get(context, key.trim());
      return val !== undefined && val !== null ? val : ""; // or "null" per requirements choice
    });
  },
};
