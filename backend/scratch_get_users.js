import mongoose from 'mongoose';

const uri = 'mongodb+srv://amiyamishu5_db_user:Z5xDigQreMeVMApn@cluster0.gmzq7hd.mongodb.net/Fastcom?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(uri)
  .then(async () => {
    console.log('Connected to DB');
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).toArray();
    console.log('Users:');
    users.forEach(u => console.log(`- ${u.email} (${u.role})`));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
