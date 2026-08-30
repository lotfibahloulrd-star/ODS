import os
import re

files_loadOrders = ['src/pages/Dashboard.jsx', 'src/pages/Ods.jsx', 'src/pages/ContractStatusPage.jsx', 'src/App.jsx']
for f in files_loadOrders:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        if 'ods_data_updated' not in content:
            pattern = re.compile(r'(const loadOrders = async \(\) => \{.*?\n\s*\};)', re.DOTALL)
            replacement = r"\1\n\n    useEffect(() => {\n        window.addEventListener('ods_data_updated', loadOrders);\n        return () => window.removeEventListener('ods_data_updated', loadOrders);\n    }, []);\n"
            new_content = pattern.sub(replacement, content, count=1)
            with open(f, 'w', encoding='utf-8') as file:
                file.write(new_content)

files_loadData = ['src/pages/Kpis.jsx']
for f in files_loadData:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        if 'ods_data_updated' not in content:
            pattern = re.compile(r'(const loadData = async \(\) => \{.*?\n\s*\};)', re.DOTALL)
            replacement = r"\1\n\n  useEffect(() => {\n    window.addEventListener('ods_data_updated', loadData);\n    return () => window.removeEventListener('ods_data_updated', loadData);\n  }, []);\n"
            new_content = pattern.sub(replacement, content, count=1)
            with open(f, 'w', encoding='utf-8') as file:
                file.write(new_content)
