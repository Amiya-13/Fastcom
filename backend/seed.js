import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';

dotenv.config();

const seedData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({ role: { $ne: 'admin' } }); // Keep admin accounts
        await Product.deleteMany({});
        await Order.deleteMany({});

        // Create shopkeepers
        console.log('👥 Creating shopkeepers...');
        const shopkeepers = [
            {
                name: 'Rajesh Kumar',
                email: 'rajesh@techstore.com',
                password: 'password123',
                role: 'shopkeeper',
                phone: '+91 9876543210',
                shopName: 'Tech Electronics Hub',
                shopDescription: 'Your one-stop shop for all electronic gadgets and accessories',
                isSubscribed: true,
                subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            },
            {
                name: 'Priya Sharma',
                email: 'priya@fashionstore.com',
                password: 'password123',
                role: 'shopkeeper',
                phone: '+91 9876543211',
                shopName: 'Fashion Fiesta',
                shopDescription: 'Trendy clothing and accessories for all occasions',
                isSubscribed: true,
                subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            },
            {
                name: 'Amit Patel',
                email: 'amit@homestore.com',
                password: 'password123',
                role: 'shopkeeper',
                phone: '+91 9876543212',
                shopName: 'Home Decor Paradise',
                shopDescription: 'Beautiful home and kitchen essentials',
                isSubscribed: true,
                subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            },
            {
                name: 'Sneha Reddy',
                email: 'sneha@bookstore.com',
                password: 'password123',
                role: 'shopkeeper',
                phone: '+91 9876543213',
                shopName: 'Book Haven',
                shopDescription: 'Discover your next favorite book',
                isSubscribed: true,
                subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            },
            {
                name: 'Vikram Singh',
                email: 'vikram@sportsstore.com',
                password: 'password123',
                role: 'shopkeeper',
                phone: '+91 9876543214',
                shopName: 'Sports Champion',
                shopDescription: 'Quality sports equipment and fitness gear',
                isSubscribed: true,
                subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            },
            {
                name: 'Ananya Iyer',
                email: 'ananya@beautystore.com',
                password: 'password123',
                role: 'shopkeeper',
                phone: '+91 9876543215',
                shopName: 'Beauty Bliss',
                shopDescription: 'Premium beauty and skincare products',
                isSubscribed: true,
                subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            },
            {
                name: 'Mohit Verma',
                email: 'mohit@grocerystore.com',
                password: 'password123',
                role: 'shopkeeper',
                phone: '+91 9876543216',
                shopName: 'Fresh Mart Grocery',
                shopDescription: 'Fresh groceries delivered to your doorstep',
                isSubscribed: true,
                subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            },
            {
                name: 'Kavya Nair',
                email: 'kavya@toystore.com',
                password: 'password123',
                role: 'shopkeeper',
                phone: '+91 9876543217',
                shopName: 'Kids Toy World',
                shopDescription: 'Fun and educational toys for children',
                isSubscribed: true,
                subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
        ];

        const createdShopkeepers = await User.create(shopkeepers);
        console.log(`✅ Created ${createdShopkeepers.length} shopkeepers`);

        // Create products for each category
        console.log('📦 Creating products...');

        const products = [
            // Electronics
            {
                name: 'Wireless Bluetooth Headphones',
                description: 'Premium noise-cancelling wireless headphones with 30-hour battery life',
                price: 2999,
                category: 'Electronics',
                stock: 50,
                images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'],
                shopkeeper: createdShopkeepers[0]._id,
                shopName: createdShopkeepers[0].shopName
            },
            {
                name: 'Smart Watch Pro',
                description: 'Fitness tracker with heart rate monitor and GPS',
                price: 4499,
                category: 'Electronics',
                stock: 30,
                images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'],
                shopkeeper: createdShopkeepers[0]._id,
                shopName: createdShopkeepers[0].shopName
            },
            {
                name: 'Portable Power Bank 20000mAh',
                description: 'Fast charging power bank with dual USB ports',
                price: 1299,
                category: 'Electronics',
                stock: 100,
                images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400'],
                shopkeeper: createdShopkeepers[0]._id,
                shopName: createdShopkeepers[0].shopName
            },
            {
                name: 'Wireless Mouse',
                description: 'Ergonomic wireless mouse with adjustable DPI',
                price: 599,
                category: 'Electronics',
                stock: 75,
                images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400'],
                shopkeeper: createdShopkeepers[0]._id,
                shopName: createdShopkeepers[0].shopName
            },

            // Fashion
            {
                name: 'Cotton T-Shirt',
                description: 'Comfortable cotton t-shirt available in multiple colors',
                price: 499,
                category: 'Fashion',
                stock: 200,
                images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'],
                shopkeeper: createdShopkeepers[1]._id,
                shopName: createdShopkeepers[1].shopName
            },
            {
                name: 'Denim Jeans',
                description: 'Stylish slim-fit denim jeans for men',
                price: 1299,
                category: 'Fashion',
                stock: 80,
                images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400'],
                shopkeeper: createdShopkeepers[1]._id,
                shopName: createdShopkeepers[1].shopName
            },
            {
                name: 'Designer Handbag',
                description: 'Elegant leather handbag for women',
                price: 2499,
                category: 'Fashion',
                stock: 40,
                images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400'],
                shopkeeper: createdShopkeepers[1]._id,
                shopName: createdShopkeepers[1].shopName
            },
            {
                name: 'Sunglasses',
                description: 'UV protection sunglasses with polarized lenses',
                price: 899,
                category: 'Fashion',
                stock: 60,
                images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400'],
                shopkeeper: createdShopkeepers[1]._id,
                shopName: createdShopkeepers[1].shopName
            },

            // Home & Kitchen
            {
                name: 'Non-Stick Cookware Set',
                description: '5-piece non-stick cookware set with glass lids',
                price: 3499,
                category: 'Home & Kitchen',
                stock: 25,
                images: ['https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400'],
                shopkeeper: createdShopkeepers[2]._id,
                shopName: createdShopkeepers[2].shopName
            },
            {
                name: 'Decorative Wall Clock',
                description: 'Modern silent wall clock for home decoration',
                price: 799,
                category: 'Home & Kitchen',
                stock: 45,
                images: ['https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=400'],
                shopkeeper: createdShopkeepers[2]._id,
                shopName: createdShopkeepers[2].shopName
            },
            {
                name: 'Cushion Covers Set',
                description: 'Set of 5 decorative cushion covers',
                price: 699,
                category: 'Home & Kitchen',
                stock: 70,
                images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'],
                shopkeeper: createdShopkeepers[2]._id,
                shopName: createdShopkeepers[2].shopName
            },
            {
                name: 'LED Table Lamp',
                description: 'Energy-efficient LED desk lamp with adjustable brightness',
                price: 1199,
                category: 'Home & Kitchen',
                stock: 55,
                images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400'],
                shopkeeper: createdShopkeepers[2]._id,
                shopName: createdShopkeepers[2].shopName
            },

            // Books
            {
                name: 'The Psychology of Money',
                description: 'Bestselling book about personal finance and wealth',
                price: 399,
                category: 'Books',
                stock: 90,
                images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'],
                shopkeeper: createdShopkeepers[3]._id,
                shopName: createdShopkeepers[3].shopName
            },
            {
                name: 'Atomic Habits',
                description: 'Transform your life with tiny changes',
                price: 449,
                category: 'Books',
                stock: 85,
                images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400'],
                shopkeeper: createdShopkeepers[3]._id,
                shopName: createdShopkeepers[3].shopName
            },
            {
                name: 'Rich Dad Poor Dad',
                description: 'Classic personal finance book',
                price: 299,
                category: 'Books',
                stock: 100,
                images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400'],
                shopkeeper: createdShopkeepers[3]._id,
                shopName: createdShopkeepers[3].shopName
            },

            // Sports
            {
                name: 'Yoga Mat Premium',
                description: 'Non-slip eco-friendly yoga mat with carrying strap',
                price: 899,
                category: 'Sports',
                stock: 65,
                images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400'],
                shopkeeper: createdShopkeepers[4]._id,
                shopName: createdShopkeepers[4].shopName
            },
            {
                name: 'Dumbbells Set 10kg',
                description: 'Adjustable dumbbells for home workout',
                price: 1899,
                category: 'Sports',
                stock: 35,
                images: ['https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400'],
                shopkeeper: createdShopkeepers[4]._id,
                shopName: createdShopkeepers[4].shopName
            },
            {
                name: 'Badminton Racket',
                description: 'Professional badminton racket with cover',
                price: 1299,
                category: 'Sports',
                stock: 50,
                images: ['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400'],
                shopkeeper: createdShopkeepers[4]._id,
                shopName: createdShopkeepers[4].shopName
            },

            // Beauty
            {
                name: 'Face Serum Vitamin C',
                description: 'Anti-aging vitamin C serum for glowing skin',
                price: 799,
                category: 'Beauty',
                stock: 70,
                images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400'],
                shopkeeper: createdShopkeepers[5]._id,
                shopName: createdShopkeepers[5].shopName
            },
            {
                name: 'Makeup Brush Set',
                description: 'Professional 12-piece makeup brush set',
                price: 1199,
                category: 'Beauty',
                stock: 40,
                images: ['https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400'],
                shopkeeper: createdShopkeepers[5]._id,
                shopName: createdShopkeepers[5].shopName
            },
            {
                name: 'Hair Straightener',
                description: 'Ceramic hair straightener with temperature control',
                price: 1599,
                category: 'Beauty',
                stock: 30,
                images: ['https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=400'],
                shopkeeper: createdShopkeepers[5]._id,
                shopName: createdShopkeepers[5].shopName
            },

            // Grocery
            {
                name: 'Organic Honey 500g',
                description: 'Pure organic honey from local farms',
                price: 299,
                category: 'Grocery',
                stock: 120,
                images: ['https://images.unsplash.com/photo-1587049352846-4a222e784587?w=400'],
                shopkeeper: createdShopkeepers[6]._id,
                shopName: createdShopkeepers[6].shopName
            },
            {
                name: 'Basmati Rice 5kg',
                description: 'Premium aged basmati rice',
                price: 599,
                category: 'Grocery',
                stock: 80,
                images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'],
                shopkeeper: createdShopkeepers[6]._id,
                shopName: createdShopkeepers[6].shopName
            },
            {
                name: 'Mixed Dry Fruits 1kg',
                description: 'Premium quality mixed dry fruits and nuts',
                price: 899,
                category: 'Grocery',
                stock: 60,
                images: ['https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=400'],
                shopkeeper: createdShopkeepers[6]._id,
                shopName: createdShopkeepers[6].shopName
            },

            // Toys
            {
                name: 'Building Blocks Set',
                description: '100-piece colorful building blocks for kids',
                price: 799,
                category: 'Toys',
                stock: 90,
                images: ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400'],
                shopkeeper: createdShopkeepers[7]._id,
                shopName: createdShopkeepers[7].shopName
            },
            {
                name: 'Remote Control Car',
                description: 'High-speed RC car with rechargeable battery',
                price: 1499,
                category: 'Toys',
                stock: 45,
                images: ['https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400'],
                shopkeeper: createdShopkeepers[7]._id,
                shopName: createdShopkeepers[7].shopName
            },
            {
                name: 'Puzzle Game Set',
                description: 'Educational puzzle set for children 5+ years',
                price: 499,
                category: 'Toys',
                stock: 75,
                images: ['https://images.unsplash.com/photo-1566694271453-390536dd1f0d?w=400'],
                shopkeeper: createdShopkeepers[7]._id,
                shopName: createdShopkeepers[7].shopName
            }
        ];

        const createdProducts = await Product.create(products);
        console.log(`✅ Created ${createdProducts.length} products`);

        // Create some sample customers
        console.log('👤 Creating customers...');
        const customers = [
            {
                name: 'Demo Customer',
                email: 'customer@demo.com',
                password: 'password123',
                role: 'customer',
                phone: '+91 9999999999'
            }
        ];

        await User.create(customers);
        console.log(`✅ Created ${customers.length} customers`);

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📝 Login credentials:');
        console.log('   Customer: customer@demo.com / password123');
        console.log('   Shopkeeper: rajesh@techstore.com / password123');
        console.log('              (or any other shopkeeper email)');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
