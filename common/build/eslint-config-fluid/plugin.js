// const minimalConfig = require("./minimal");
// const recommendedConfig = require("./recommended");
// const strictConfig = require("./strict");
const customNoMemberReleaseTagsRule = require("./src/custom-rules/rules/no-member-release-tags");

module.exports = {
	/**
	 * Apply ESLint rules later.
	 */
	// configs: {
	// 	minimalConfig: minimalConfig,
	// 	recommendedConfig: recommendedConfig,
	// 	strictConfig: strictConfig,
	// },
	rules: {
		/**
		 * Restrict including release tags inside the member class / interface.
		 */
		"custom-rules/no-member-release-tags": customNoMemberReleaseTagsRule,
	},
};
