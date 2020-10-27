module.exports = {
    "pipeline": {
        "build": [
            "^tsc"
        ],
        "test": [
            "build"
        ],
        "lint": [
            "lint"
        ]
    },
    "npmClient": "pnpm"
};
