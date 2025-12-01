const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Firebase Config
const firebaseConfig = {
  apiKey: 'AIzaSyAzfb3FfXB9t8eIG301RYbHz8kZwdcPTN0',
  authDomain: 'intrenship-e715a.firebaseapp.com',
  projectId: 'intrenship-e715a',
  storageBucket: 'intrenship-e715a.firebasestorage.app',
  messagingSenderId: '20386322668',
  appId: '1:20386322668:web:4a81f949268207d46f6dc9',
  measurementId: 'G-CC624QVX2X',
};

const createAdmin = async () => {
  try {
    console.log('🔧 กำลังสร้างบัญชีแอดมิน...\n');

    const email = 'admin@vannessplus.com';
    const password = 'admin123';
    const firstName = 'แอดมิน';
    const lastName = 'จำเป็น';
    const phone = '0369852147';
    const position = 'ผู้ดูแลระบบ';

    // เชื่อมต่อ Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    console.log('📧 อีเมล:', email);
    console.log('👤 ชื่อ:', `${firstName} ${lastName}`);
    console.log('📞 เบอร์โทร:', phone);
    console.log('\n🚀 กำลังสร้างบัญชีผู้ใช้...');

    // สร้างบัญชีใน Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log('✅ สร้างบัญชีผู้ใช้สำเร็จ');
    console.log(`📋 UID: ${user.uid}`);

    console.log('\n📝 กำลังเพิ่มข้อมูลแอดมินใน Firestore...');

    // เพิ่มข้อมูลใน Firestore collection 'users'
    const adminData = {
      uid: user.uid,
      email: user.email,
      firstName: firstName,
      lastName: lastName,
      phone: phone,
      position: position,
      role: 'admin',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await addDoc(collection(db, 'users'), adminData);

    console.log('✅ เพิ่มข้อมูลแอดมินใน Firestore สำเร็จ');
    console.log('\n🎉 สร้างแอดมินเรียบร้อยแล้ว!');
    console.log('\n📋 รายละเอียดบัญชี:');
    console.log(`   อีเมล: ${email}`);
    console.log(`   ชื่อ: ${firstName} ${lastName}`);
    console.log(`   ตำแหน่ง: ${position}`);
    console.log(`   เบอร์โทร: ${phone}`);
    console.log(`   สิทธิ์: admin`);
    console.log(`   UID: ${user.uid}`);
    console.log('\n⚠️  สามารถใช้งานได้ทันทีผ่านหน้าล็อคอิน');

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('💡 อีเมลนี้ถูกใช้งานแล้ว - แอดมินนี้มีอยู่แล้วในระบบ');
    } else if (error.code === 'auth/weak-password') {
      console.log('💡 รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
    }
  } finally {
    process.exit(0);
  }
};

// เริ่มทำงาน
createAdmin();
