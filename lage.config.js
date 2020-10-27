module.exports = {
    "pipeline": {
        "build": [
            "^tsc"
        ],
        "test": [
            "build"
        ],
        "lint": [
            "eslint"
        ]
    },
    "npmClient": "pnpm"
};
