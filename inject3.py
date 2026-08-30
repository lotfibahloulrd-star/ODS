import os
import re

files = ['src/pages/Tenders.jsx']
for f in files:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        if 'tender_data_updated' not in content:
            pattern = re.compile(r'(const loadTenders = async \(\) => \{.*?\n\s*\};)', re.DOTALL)
            replacement = r"\1\n\n    useEffect(() => {\n        window.addEventListener('tender_data_updated', loadTenders);\n        return () => window.removeEventListener('tender_data_updated', loadTenders);\n    }, []);\n"
            new_content = pattern.sub(replacement, content, count=1)
            with open(f, 'w', encoding='utf-8') as file:
                file.write(new_content)
