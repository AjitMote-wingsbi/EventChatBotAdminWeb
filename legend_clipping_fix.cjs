const fs = require('fs');

let dash = fs.readFileSync('src/pages/Dashboard/Dashboard.tsx', 'utf8');

// 1. Remove fixed height={48} from Legends so they can properly wrap to 3 lines without cropping
dash = dash.replace(/ height=\{48\}/g, '');

// 2. Shrink Legend font size slightly to fit more text
dash = dash.replace(/fontSize: '0\.75rem'/g, "fontSize: '0.65rem'");

// 3. Nuke outer slice labels in compact mode because 180px physically cannot house leader lines for 1% slices
// This forces users to read the nicely formatted bottom Legend which now houses all percentages anyway
dash = dash.replace(/label=\{.*?\}/g, (match) => {
    // We only want to replace Pie labels, but there are BarChart labels? No, BarChart doesn't have label={} in this file
    // Let's be safe and just replace the exact Pie label strings
    if (match.includes('percent > 0.04') || match.includes('name }') || match.includes('(percent || 0) > 0.04') || match.includes('fontSize: 11')) {
        return 'label={isFull ? { fontSize: 11, fontWeight: 600 } : false}';
    }
    return match;
});

// 4. Since the Legend is now taller (wrapping to 3 lines), push the actual Pie donut slightly UP to avoid collision!
dash = dash.replace(/cy="50%"/g, 'cy={isFull ? "50%" : "40%"}');

fs.writeFileSync('src/pages/Dashboard/Dashboard.tsx', dash);
console.log('Fixed clipped legends by allowing auto-height and disabled micro slice labels in compact mode.');
