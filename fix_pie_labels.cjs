const fs = require('fs');

let dash = fs.readFileSync('src/pages/Dashboard/Dashboard.tsx', 'utf8');

// 1. Shrink the normal-view pie radiuses to prevent label clipping outside the SVG bounding box
dash = dash.replace(/outerRadius=\{isFull \? 250 : "75%"\}/g, 'outerRadius={isFull ? 250 : "55%"}');
dash = dash.replace(/innerRadius=\{isFull \? 150 : "50%"\}/g, 'innerRadius={isFull ? 150 : "35%"}');

// 2. Remove the micro-slice label suppression algorithm so all minority language items get their lines drawn
dash = dash.replace(
  /label=\{\(\{ name, percent \}\) => \(?percent \|\| 0\)? > 0\.04 \? name : ''\}/g,
  'label={{ fontSize: 11, fontWeight: 600 }}'
);

fs.writeFileSync('src/pages/Dashboard/Dashboard.tsx', dash);
console.log('Un-suppressed all minor pie slice labels and shrank pie radius geometries to prevent canvas bounds clipping.');
