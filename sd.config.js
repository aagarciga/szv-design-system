// const StyleDictionary = require("style-dictionary").extend("config.json");
// const figmaSetName = "global";

// StyleDictionary.registerTransform({
//   type: "value",
//   transitive: true,
//   name: "value/ref/correction",
//   matcher: (token) => {},
//   transformer: (token) => {
//     if (token.value.includes("{")) {
//       return token.value.replace("{", `{${figmaSetName}.`);
//     }
//     return token;
//   },
// });

// StyleDictionary.buildAllPlatforms();

const StyleDictionary = require("style-dictionary");
const FIGMA_SET_NAME = "global";

const figmaRefCorrection = (token) => {
  const { value, type } = token;
  console.log(">>", value, type, token);
  if (value.inclides("{")) {
    return value.replace("{", `{${FIGMA_SET_NAME}.`);
  }

  return value;
};

StyleDictionary.registerParser({
  pattern: /\json$/,
  parse: ({ contents, filePath }) => {
    try {
      const object = JSON.parse(contents);
      const result = {};

      for (const key in object) {
        if (object.hasOwnProperty(key)) {
          const element = object[key];
          result[`${key}`] = element;
        }
      }
      console.log(result);
      return result;
    } catch (error) {
      console.log(error);
    }
  },
});

module.exports = {
  source: [`tokens/**/*.@(json|json5)`],
  transform: {
    correction: {
      type: "value",
      transitive: true,
      matcher: (token) => {},
      transformer: figmaRefCorrection,
    },
    "color/css": Object.assign({}, StyleDictionary.transform[`color/css`], {
      transitive: true,
    }),
  },
  platforms: {
    scss: {
      transforms: [
        `correction`,
        `attribute/cti`,
        `name/cti/kebab`,
        `time/seconds`,
        `content/icon`,
        `size/rem`,
        `color/css`,
      ],
      buildPath: "build/web/scss/",
      files: [
        {
          destination: "_variables.scss",
          format: "scss/variables",
          options: {
            outputReferences: true,
          },
        },
        {
          destination: "_variables.map.scss",
          format: "scss/map-flat",
          options: {
            outputReferences: true,
          },
        },
      ],
    },
    android: {
      transforms: [
        `attribute/cti`,
        `name/cti/snake`,
        `color/hex`,
        `size/remToSp`,
        `size/remToDp`,
      ],
      buildPath: "build/android/src/main/res/values",
      files: [
        {
          destination: "colors.xml",
          format: "android/colors",
        },
      ],
    },
  },
};
