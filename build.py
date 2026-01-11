#!/usr/bin/env python3
"""
Simple build script that compiles HTML templates with partial includes.
Replaces {{> partialName param="value" }} with the partial content.
"""
import os
import re

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(ROOT_DIR, 'src')
PARTIALS_DIR = os.path.join(SRC_DIR, 'partials')

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
    # Match {{> partialName param="value" param2="value2" }}
    pattern = r'\{\{>\s*(\w+)([^}]*)\}\}'
    
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
        
        # Ensure output directory exists
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f'  ✓ {filepath}')
    
    print(f'\nBuild complete! {len(html_files)} files generated.')
    return True

if __name__ == '__main__':
    build()
