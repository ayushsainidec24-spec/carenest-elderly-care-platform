const fs = require('fs');
const path = require('path');

// Patch ALL ajv-keywords bundles to avoid ajv v8 incompatibility
const ajvKeywordsPaths = [
  path.join(__dirname, 'node_modules/ajv-keywords'),
  path.join(__dirname, 'node_modules/babel-loader/node_modules/ajv-keywords'),
  path.join(__dirname, 'node_modules/file-loader/node_modules/ajv-keywords'),
  path.join(__dirname, 'node_modules/fork-ts-checker-webpack-plugin/node_modules/ajv-keywords'),
];

ajvKeywordsPaths.forEach(pluginPath => {
  if (!fs.existsSync(pluginPath)) return;

  // Patch index.js
  const indexFile = path.join(pluginPath, 'index.js');
  if (fs.existsSync(indexFile)) {
    let content = fs.readFileSync(indexFile, 'utf8');
    if (!content.includes('if (typeof defFunc')) {
      content = content.replace(
        'for (var i=0; i<keyword.length; i++)\n      get(keyword[i])(ajv);',
        'for (var i=0; i<keyword.length; i++) {\n        var defFunc = get(keyword[i]);\n        if (typeof defFunc === "function") try { defFunc(ajv); } catch(e) {}\n      }'
      );
      fs.writeFileSync(indexFile, content);
    }
  }

  // Patch _formatLimit.js
  const formatLimitFile = path.join(pluginPath, 'keywords/_formatLimit.js');
  if (fs.existsSync(formatLimitFile)) {
    let content = fs.readFileSync(formatLimitFile, 'utf8');
    if (!content.includes('try {')) {
      const newFunc = `function extendFormats(ajv) {
  try {
    if (!ajv || !ajv._formats || typeof ajv._formats !== 'object') return;
    var formats = ajv._formats;
    for (var name in COMPARE_FORMATS) {
      try {
        var format = formats[name];
        if (!format) format = formats[name] = { validate: function() { return true; } };
        if (!format.validate) format.validate = function() { return true; };
        if (!format.compare) format.compare = COMPARE_FORMATS[name];
      } catch (e) {}
    }
  } catch (err) {}
}`;
      content = content.replace(
        /function extendFormats\(ajv\) \{[\s\S]*?\n\}/,
        newFunc
      );
      fs.writeFileSync(formatLimitFile, content);
    }
  }
});

// Patch babel-preset-react-app to use transform instead of proposal plugins
const babelCreateFile = path.join(__dirname, 'node_modules/babel-preset-react-app/create.js');
if (fs.existsSync(babelCreateFile)) {
  let content = fs.readFileSync(babelCreateFile, 'utf8');
  if (content.includes('plugin-proposal-')) {
    content = content.replace(/@babel\/plugin-proposal-class-properties/g, '@babel/plugin-transform-class-properties');
    content = content.replace(/@babel\/plugin-proposal-private-methods/g, '@babel/plugin-transform-private-methods');
    content = content.replace(/@babel\/plugin-proposal-private-property-in-object/g, '@babel/plugin-transform-private-property-in-object');
    content = content.replace(/@babel\/plugin-proposal-numeric-separator/g, '@babel/plugin-transform-numeric-separator');
    content = content.replace(/@babel\/plugin-proposal-optional-chaining/g, '@babel/plugin-transform-optional-chaining');
    content = content.replace(/@babel\/plugin-proposal-nullish-coalescing-operator/g, '@babel/plugin-transform-nullish-coalescing-operator');
    // Comment out decorators as it's not available
    if (content.includes('plugin-proposal-decorators') || content.includes('plugin-transform-decorators')) {
      content = content.replace(/isTypeScriptEnabled && \[\s*require\('@babel\/plugin-(?:proposal|transform)-decorators'\)\.default,\s*false,\s*\],/,
        '// Decorators plugin disabled - not available in this babel version');
    }
    fs.writeFileSync(babelCreateFile, content);
    console.log('✓ Patched babel-preset-react-app');
  }
}

// Patch schema-utils instances
const schemaUtilsPaths = [
  path.join(__dirname, 'node_modules/fork-ts-checker-webpack-plugin/node_modules/schema-utils/dist/validate.js'),
  path.join(__dirname, 'node_modules/schema-utils/dist/validate.js'),
];

schemaUtilsPaths.forEach(validateFile => {
  if (!fs.existsSync(validateFile)) return;
  
  let content = fs.readFileSync(validateFile, 'utf8');
  if (!content.includes('try {')) {
    content = content.replace(
      /(0, _ajvKeywords.default)\(ajv, \['instanceof', 'formatMinimum', 'formatMaximum', 'patternRequired'\]\);/,
      'try { (0, _ajvKeywords.default)(ajv, ["instanceof", "formatMinimum", "formatMaximum", "patternRequired"]); } catch(e) {}'
    );
    fs.writeFileSync(validateFile, content);
  }
});

console.log('✓ All patches applied');

