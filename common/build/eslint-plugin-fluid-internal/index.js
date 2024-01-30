"use strict";

const pkg = require("./package.json");
// const requireIndex = require("requireindex");

const plugin = {
	meta: {
		name: pkg.name,
		version: pkg.version,
	},
  	// configs: require("./configs"),
	// configs: {
	// 	minimal: require("./minimal"),
	// 	recommended: require("./recommended"),
	// 	strict: require("./strict"),
	// },
  configs: {},
  	rules: require("./rules"),
};

// assign configs here so we can reference `plugin`
Object.assign(plugin.configs, {
  recommended: {
      plugins: {
          example: plugin
      },
      rules: {
          "example/rule1": "error",
          "example/rule2": "error"
      }
  }
})

module.exports = plugin;
