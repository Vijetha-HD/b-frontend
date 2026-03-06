export const INITIAL_WAREHOUSES = [
    { id: 'WH-001', name: 'Mumbai Central Hub', location: 'Andheri East, Mumbai', manager: 'Rajesh M.', capacity: '85%' },
    { id: 'WH-002', name: 'South India Depot', location: 'Electronic City, Bangalore', manager: 'Suresh K.', capacity: '42%' },
    { id: 'WH-003', name: 'North Logistics Center', location: 'Okhla, Delhi', manager: 'Meera V.', capacity: '12%' },
];

export const INITIAL_INVENTORY = [
    { id: 1, brand: 'Dell', model: 'Latitude 5420', ram: '16GB', ssd: '512GB', grade: 'A', price: 36500, status: 'In Stock', count: 12, warehouseId: 'WH-001', rating: 4.8 },
    { id: 2, brand: 'HP', model: 'EliteBook 840 G5', ram: '8GB', ssd: '256GB', grade: 'B', price: 24000, status: 'In Stock', count: 8, warehouseId: 'WH-001', rating: 4.2 },
    { id: 3, brand: 'Lenovo', model: 'ThinkPad T480', ram: '16GB', ssd: '512GB', grade: 'A', price: 29500, status: 'Low Stock', count: 3, warehouseId: 'WH-002', rating: 4.5 },
    { id: 4, brand: 'Apple', model: 'MacBook Air M1', ram: '8GB', ssd: '256GB', grade: 'A+', price: 58000, status: 'In Stock', count: 5, warehouseId: 'WH-002', rating: 5.0 },
    { id: 5, brand: 'Acer', model: 'Aspire 5', ram: '8GB', ssd: '512GB', grade: 'C', price: 18500, status: 'In Stock', count: 15, warehouseId: 'WH-003', rating: 3.8 },
];

export const INITIAL_ORDERS = [
    { id: 'ORD-7721', customer: 'Arun Kumar', item: 'Dell Latitude 5420', total: 36500, status: 'Shipped', date: '2023-12-15', type: 'B2C', courier: 'BlueDart', tracking: 'SR77210042' },
    { id: 'ORD-7722', customer: 'TechCorp Solutions', item: 'MacBook Air M1', total: 116000, status: 'Processing', date: '2023-12-18', type: 'B2B', courier: null, tracking: null },
    { id: 'ORD-7723', customer: 'Rahul Singh', item: 'HP EliteBook 840', total: 24000, status: 'Delivered', date: '2023-12-10', type: 'B2C', courier: 'Delhivery', tracking: 'SR77239912' },
    { id: 'ORD-7724', customer: 'Modern Schools', item: 'Lenovo ThinkPad', total: 88500, status: 'Shipped', date: '2023-11-20', type: 'B2B', courier: 'Ecom Express', tracking: 'SR11204455' },
    { id: 'ORD-7725', customer: 'Priya Sharma', item: 'Apple MacBook Air', total: 58000, status: 'Delivered', date: '2023-11-15', type: 'B2C', courier: 'Delhivery', tracking: 'SR11158822' },
    { id: 'ORD-7726', customer: 'Global Tech', item: 'Dell XPS 13', total: 95000, status: 'Processing', date: '2023-12-17', type: 'B2B', courier: null, tracking: null },
];

export const INITIAL_REFURB = [
    { id: 'REF-101', item: 'Lenovo L480', stage: 'Testing', tech: 'Vikram', eta: 'Tomorrow' },
    { id: 'REF-102', item: 'Dell Precision 3510', stage: 'Repairing', tech: 'Suresh', eta: 'Friday' },
    { id: 'REF-103', item: 'HP ProBook 440', stage: 'Cleaning', tech: 'Anita', eta: 'Today' },
];

export const INITIAL_TESTIMONIALS = [
    { id: 'T-001', customer: 'Amit Verma', laptopId: 4, rating: 5, comment: 'The M1 Air looks brand new. Amazing battery life and not a single scratch!', date: '2023-12-10' },
    { id: 'T-002', customer: 'Sonal Gupta', laptopId: 1, rating: 4, comment: 'Very reliable machine for work. Dell Latitude series never disappoints.', date: '2023-12-14' },
];

export const INITIAL_BLOGS = [
    { id: 'B-001', title: 'Why Refurbished is the Future', author: 'Aditya Singh', date: '2023-12-01', status: 'Published', excerpt: 'Discover how buying refurbished laptops helps the environment and your wallet.', content: 'Buying refurbished electronics is one of the most effective ways to reduce e-waste...' },
    { id: 'B-002', title: 'MacBook vs ThinkPad: 2024 Guide', author: 'Neha Kapoor', date: '2023-12-10', status: 'Draft', excerpt: 'A deep dive into performance, durability, and value for business professionals.', content: 'For professionals, the choice between a MacBook and a ThinkPad is often a difficult one...' },
];

export const INITIAL_CUSTOMERS = [
    { id: 'CUS-001', name: 'Arun Kumar', email: 'arun@example.com', phone: '+91 98765 43210', type: 'B2C', totalSpent: 73000, lastOrder: '2023-10-24', status: 'Active', location: 'Mumbai' },
    { id: 'CUS-002', name: 'TechCorp Solutions', email: 'procurement@techcorp.com', phone: '+91 80 4422 1100', type: 'B2B', totalSpent: 450000, lastOrder: '2023-10-25', status: 'Active', location: 'Bangalore' },
    { id: 'CUS-003', name: 'Priya Sharma', email: 'priya.s@gmail.com', phone: '+91 99887 76655', type: 'B2C', totalSpent: 58000, lastOrder: '2023-10-21', status: 'Inactive', location: 'Delhi' },
    { id: 'CUS-004', name: 'Modern Schools', email: 'admin@modernschool.edu', phone: '+91 11 2233 4455', type: 'B2B', totalSpent: 285000, lastOrder: '2023-10-22', status: 'Active', location: 'Pune' },
    { id: 'CUS-005', name: 'Rahul Singh', email: 'rahul.singh@outlook.com', phone: '+91 91234 56789', type: 'B2C', totalSpent: 24000, lastOrder: '2023-10-23', status: 'Active', location: 'Kolkata' },
];
