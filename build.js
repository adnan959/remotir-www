const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');
const OUT_DIR = __dirname;
const PARTIALS_DIR = path.join(SRC_DIR, 'partials');

// Load all partials
function loadPartials() {
    const partials = {};
    if (!fs.existsSync(PARTIALS_DIR)) return partials;
    
    const files = fs.readdirSync(PARTIALS_DIR);
    for (const file of files) {
        if (file.endsWith('.html')) {
            const name = file.replace('.html', '');
            partials[name] = fs.readFileSync(path.join(PARTIALS_DIR, file), 'utf-8');
        }
    }
    return partials;
}

// Process partial with parameters
function processPartial(content, params) {
    let result = content;
    
    // Handle activeNav parameter - adds nav__link--active or nav__dropdown-trigger--active
    if (params.activeNav) {
        const navValue = params.activeNav;
        
        // Map activeNav values to their selectors
        const navMappings = {
            'home': { selector: 'href="/"', type: 'link' },
            'problems': { selector: 'Your Problems', type: 'dropdown' },
            'solutions': { selector: 'Our Solutions', type: 'dropdown' },
            'results': { selector: 'href="/results/"', type: 'link' },
            'insights': { selector: 'nav__mega-dropdown', type: 'mega' },
            'schedule': { selector: 'href="/schedule/"', type: 'link' }
        };
        
        const mapping = navMappings[navValue];
        if (mapping) {
            if (mapping.type === 'link') {
                // For regular links, add nav__link--active after nav__link
                const regex = new RegExp(`(class="nav__link"[^>]*${mapping.selector})`, 'g');
                result = result.replace(regex, (match) => {
                    return match.replace('class="nav__link"', 'class="nav__link nav__link--active"');
                });
                // Also try the reverse order
                const regex2 = new RegExp(`(${mapping.selector}[^>]*class="nav__link")`, 'g');
                result = result.replace(regex2, (match) => {
                    return match.replace('class="nav__link"', 'class="nav__link nav__link--active"');
                });
            } else if (mapping.type === 'dropdown') {
                // For dropdowns, add nav__dropdown-trigger--active
                const regex = new RegExp(`(<button class="nav__dropdown-trigger"[^>]*>\\s*${mapping.selector})`, 'g');
                result = result.replace(regex, (match) => {
                    return match.replace('class="nav__dropdown-trigger"', 'class="nav__dropdown-trigger nav__dropdown-trigger--active"');
                });
            } else if (mapping.type === 'mega') {
                // For mega dropdown, add nav__dropdown-trigger--active to the insights trigger
                result = result.replace(
                    /<div class="nav__mega-dropdown">\s*<button class="nav__dropdown-trigger"/,
                    '<div class="nav__mega-dropdown">\n                    <button class="nav__dropdown-trigger nav__dropdown-trigger--active"'
                );
            }
        }
    }
    
    return result;
}

// Replace partial placeholders in content
function replacePartials(content, partials) {
    // Match {{> partialName param="value" param2="value2" }}
    const partialRegex = /\{\{>\s*(\w+)([^}]*)\}\}/g;
    
    return content.replace(partialRegex, (match, partialName, paramsStr) => {
        const partial = partials[partialName];
        if (!partial) {
            console.warn(`Warning: Partial "${partialName}" not found`);
            return match;
        }
        
        // Parse parameters
        const params = {};
        const paramRegex = /(\w+)="([^"]*)"/g;
        let paramMatch;
        while ((paramMatch = paramRegex.exec(paramsStr)) !== null) {
            params[paramMatch[1]] = paramMatch[2];
        }
        
        return processPartial(partial, params);
    });
}

// Recursively get all HTML files
function getHtmlFiles(dir, baseDir = dir) {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(baseDir, fullPath);
        
        if (entry.isDirectory()) {
            // Skip partials directory
            if (entry.name === 'partials') continue;
            files.push(...getHtmlFiles(fullPath, baseDir));
        } else if (entry.name.endsWith('.html')) {
            files.push(relativePath);
        }
    }
    
    return files;
}

// Ensure directory exists
function ensureDir(filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// Build all pages
function build() {
    console.log('Building site...\n');
    
    if (!fs.existsSync(SRC_DIR)) {
        console.error('Error: src/ directory not found');
        process.exit(1);
    }
    
    const partials = loadPartials();
    console.log(`Loaded ${Object.keys(partials).length} partials: ${Object.keys(partials).join(', ')}\n`);
    
    const htmlFiles = getHtmlFiles(SRC_DIR);
    console.log(`Found ${htmlFiles.length} HTML files to process\n`);
    
    for (const file of htmlFiles) {
        const srcPath = path.join(SRC_DIR, file);
        const outPath = path.join(OUT_DIR, file);
        
        let content = fs.readFileSync(srcPath, 'utf-8');
        content = replacePartials(content, partials);
        
        ensureDir(outPath);
        fs.writeFileSync(outPath, content);
        console.log(`  ✓ ${file}`);
    }
    
    console.log(`\nBuild complete! ${htmlFiles.length} files generated.`);
}

// Watch mode
if (process.argv.includes('--watch')) {
    console.log('Watching for changes...\n');
    build();
    
    fs.watch(SRC_DIR, { recursive: true }, (eventType, filename) => {
        if (filename && filename.endsWith('.html')) {
            console.log(`\nFile changed: ${filename}`);
            build();
        }
    });
} else {
    build();
}
