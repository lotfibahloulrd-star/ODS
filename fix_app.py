import os

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_block = '''    useEffect(() => {
        if (!currentUser) return;
        const loadOrders = async () => {
            try {
                const data = await orderService.getAllOrders();
                setAllOrders(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Global search error:", error);
            }
        };
        loadOrders();
    }, [currentUser, location.pathname]);'''

new_block = '''    const loadOrders = async () => {
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

if old_block in content:
    content = content.replace(old_block, new_block)
    with open('src/App.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Replaced successfully')
else:
    print('Block not found!')
