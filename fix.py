import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'    useEffect\(\(\) => \{\n\s*if \(\!currentUser\) return;\n\s*const loadOrders = async \(\) => \{.*?\n\s*\};\n\n\s*useEffect\(\(\) => \{\n\s*window\.addEventListener\(''ods_data_updated'', loadOrders\);\n\s*return \(\) => window\.removeEventListener\(''ods_data_updated'', loadOrders\);\n\s*\}, \[\]\);\n\n\s*loadOrders\(\);\n\s*\}, \[currentUser, location\.pathname\]\);', re.DOTALL)

replacement = '''    const loadOrders = async () => {
        if (!currentUser) return;
        try {
            const data = await orderService.getAllOrders();
            setAllOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Global search error:", error);
        }
    };

    useEffect(() => {
        loadOrders();
    }, [currentUser, location.pathname]);

    useEffect(() => {
        window.addEventListener('ods_data_updated', loadOrders);
        return () => window.removeEventListener('ods_data_updated', loadOrders);
    }, [currentUser]);'''

content = pattern.sub(replacement, content)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
