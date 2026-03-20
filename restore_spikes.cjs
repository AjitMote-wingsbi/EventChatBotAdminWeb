const fs = require('fs');
let dash = fs.readFileSync('src/pages/Dashboard/Dashboard.tsx', 'utf8');

// Replace the conditional label toggle with a permanent 10px outer label render instruction!
dash = dash.replace(/label=\{isFull \? \{ fontSize: 11, fontWeight: 600 \} : false\}/g, 'label={{ fontSize: 10, fontWeight: 500 }}');

fs.writeFileSync('src/pages/Dashboard/Dashboard.tsx', dash);
console.log('Restored all outer slice labels (spikes) regardless of layout density.');
