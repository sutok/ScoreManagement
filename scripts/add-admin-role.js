#!/usr/bin/env node

/**
 * Add admin role to a user
 * Usage: node scripts/add-admin-role.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addAdminRole() {
  const userId = 'FVcgy4G1fJN1cO9qWe6KgVfiDv82';

  try {
    await db.collection('roles').doc(userId).set({
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Admin role successfully added!');
    console.log(`User ID: ${userId}`);
    console.log('Role: admin');
    console.log('\nPlease logout and login again to see the changes.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding admin role:', error);
    process.exit(1);
  }
}

addAdminRole();
