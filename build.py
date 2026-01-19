#!/usr/bin/env python3
"""
Simple build script that compiles HTML templates with partial includes.
Replaces {{> partialName param="value" }} with the partial content.
Also generates sitemap.xml automatically.
"""
import os
import re
from datetime import datetime

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(ROOT_DIR, 'src')
PARTIALS_DIR = os.path.join(SRC_DIR, 'partials')
BASE_URL = "https://www.remotir.com"

def load_partials():
    """Load all HTML partials from src/partials/"""
    partials = {}
    if not os.path.exists(PARTIALS_DIR):
        return partials
    
    for filename in os.listdir(PARTIALS_DIR):
        if filename.endswith('.html'):
            name = filename[:-5]  # Remove .html
            with open(os.path.join(PARTIALS_DIR, filename), 'r', encoding='utf-8') as f:
                partials[name] = f.read()
    
    return partials

def process_partial(content, params):
    """Process a partial with parameters like activeNav"""
    result = content
    
    active_nav = params.get('activeNav')
    if active_nav:
        # Map activeNav values to their replacement patterns
        nav_mappings = {
            'home': ('href="/" class="nav__link"', 'href="/" class="nav__link nav__link--active"'),
            'problems': ('class="nav__dropdown-trigger" aria-expanded="false" aria-haspopup="true">\n                        Your Problems',
                        'class="nav__dropdown-trigger nav__dropdown-trigger--active" aria-expanded="false" aria-haspopup="true">\n                        Your Problems'),
            'solutions': ('class="nav__dropdown-trigger" aria-expanded="false" aria-haspopup="true">\n                        Our Solutions',
                         'class="nav__dropdown-trigger nav__dropdown-trigger--active" aria-expanded="false" aria-haspopup="true">\n                        Our Solutions'),
            'results': ('href="/results/" class="nav__link"', 'href="/results/" class="nav__link nav__link--active"'),
            'insights': ('class="nav__mega-dropdown">\n                    <button class="nav__dropdown-trigger"',
                        'class="nav__mega-dropdown">\n                    <button class="nav__dropdown-trigger nav__dropdown-trigger--active"'),
            'schedule': ('href="/schedule/" class="btn btn--primary"', 'href="/schedule/" class="btn btn--primary"'),  # No visual change for schedule
        }
        
        if active_nav in nav_mappings:
            old_str, new_str = nav_mappings[active_nav]
            result = result.replace(old_str, new_str, 1)
    
    return result

def replace_partials(content, partials):
    """Replace {{> partialName param="value" }} with partial content"""
    # Match {{> partialName param="value" param2="value2" }} (partialName can include hyphens)
    pattern = r'\{\{>\s*([\w-]+)([^}]*)\}\}'
    
    def replacer(match):
        partial_name = match.group(1)
        params_str = match.group(2)
        
        if partial_name not in partials:
            print(f'  Warning: Partial "{partial_name}" not found')
            return match.group(0)
        
        # Parse parameters
        params = {}
        param_pattern = r'(\w+)="([^"]*)"'
        for param_match in re.finditer(param_pattern, params_str):
            params[param_match.group(1)] = param_match.group(2)
        
        return process_partial(partials[partial_name], params)
    
    return re.sub(pattern, replacer, content)

def inject_head_scripts(content, partials):
    """Inject head-scripts partial before </head> tag"""
    if 'head-scripts' not in partials:
        return content
    
    head_scripts = partials['head-scripts']
    # Insert head scripts just before </head>
    return content.replace('</head>', head_scripts + '\n</head>', 1)

def get_html_files(directory, base_dir=None):
    """Recursively get all HTML files, excluding partials"""
    if base_dir is None:
        base_dir = directory
    
    files = []
    for entry in os.listdir(directory):
        full_path = os.path.join(directory, entry)
        
        if os.path.isdir(full_path):
            if entry == 'partials':
                continue
            files.extend(get_html_files(full_path, base_dir))
        elif entry.endswith('.html'):
            rel_path = os.path.relpath(full_path, base_dir)
            files.append(rel_path)
    
    return files

def get_priority(filepath):
    """Determine sitemap priority based on page type and depth"""
    # Homepage
    if filepath == "index.html":
        return "1.0"
    
    # Top-level service/solution pages
    top_level = ['pmf-sprint', 'predictable-revenue', 'pmf-failure', 
                 'unpredictable-pipeline', 'schedule', 'results']
    for page in top_level:
        if filepath.startswith(page + '/'):
            return "0.9"
    
    # Case studies
    if 'case-study' in filepath:
        return "0.8"
    
    # Insights hub
    if filepath == "insights/index.html":
        return "0.8"
    
    # Playbook index pages
    playbooks = ['0-100k-playbook', 'architecting-demand', 'pipeline-physics']
    for playbook in playbooks:
        if filepath == f"insights/{playbook}/index.html":
            return "0.8"
    
    # Glossary pages (lower priority)
    if 'glossary' in filepath:
        return "0.6"
    
    # All other insight chapters
    if filepath.startswith('insights/'):
        return "0.7"
    
    return "0.7"

def get_changefreq(filepath):
    """Determine change frequency based on page type"""
    if filepath == "index.html":
        return "weekly"
    if filepath == "insights/index.html":
        return "weekly"
    return "monthly"

def generate_sitemap(html_files):
    """Generate sitemap.xml from processed HTML files"""
    print('\nGenerating sitemap.xml...')
    
    # Exclude pages that should not be indexed
    excluded_paths = ['thank-you/']
    filtered_files = [f for f in html_files if not any(excl in f for excl in excluded_paths)]
    
    # Sort files for consistent output
    sorted_files = sorted(filtered_files)
    
    # Build XML content
    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]
    
    for filepath in sorted_files:
        # Convert filepath to URL path
        url_path = filepath.replace('index.html', '')
        if url_path and not url_path.endswith('/'):
            url_path += '/'
        if not url_path:
            url_path = '/'
        
        full_url = BASE_URL + '/' + url_path.lstrip('/')
        # Clean up double slashes (except in https://)
        full_url = full_url.replace('///', '//')
        if full_url.endswith('//'):
            full_url = full_url[:-1]
        
        priority = get_priority(filepath)
        changefreq = get_changefreq(filepath)
        
        xml_lines.append('  <url>')
        xml_lines.append(f'    <loc>{full_url}</loc>')
        xml_lines.append(f'    <changefreq>{changefreq}</changefreq>')
        xml_lines.append(f'    <priority>{priority}</priority>')
        xml_lines.append('  </url>')
    
    xml_lines.append('</urlset>')
    
    # Write sitemap
    sitemap_path = os.path.join(ROOT_DIR, 'sitemap.xml')
    with open(sitemap_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(xml_lines))
    
    print(f'  ✓ sitemap.xml ({len(sorted_files)} URLs)')

def build():
    """Build all pages from templates"""
    print('Building site...\n')
    
    if not os.path.exists(SRC_DIR):
        print('Error: src/ directory not found')
        return False
    
    partials = load_partials()
    print(f'Loaded {len(partials)} partials: {", ".join(partials.keys())}\n')
    
    html_files = get_html_files(SRC_DIR)
    print(f'Found {len(html_files)} HTML files to process\n')
    
    for filepath in html_files:
        src_path = os.path.join(SRC_DIR, filepath)
        out_path = os.path.join(ROOT_DIR, filepath)
        
        with open(src_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        content = replace_partials(content, partials)
        content = inject_head_scripts(content, partials)
        
        # Ensure output directory exists
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f'  ✓ {filepath}')
    
    # Generate sitemap
    generate_sitemap(html_files)
    
    print(f'\nBuild complete! {len(html_files)} files generated.')
    return True

if __name__ == '__main__':
    build()
