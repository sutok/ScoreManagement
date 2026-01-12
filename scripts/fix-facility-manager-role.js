#!/usr/bin/env node

/**
 * Fix facility_manager role document structure
 * Changes facilities field from string to array
 * Usage: node scripts/fix-facility-manager-role.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixFacilityManagerRole() {
  const userId = 'FVcgy4G1fJN1cO9qWe6KgVfiDv82';
  const facilityId = 'iOJvFURlqzVG2Mqt7UUc';

  try {
    console.log('🔍 Checking current role document...');
    const roleDoc = await db.collection('roles').doc(userId).get();

    if (!roleDoc.exists) {
      console.error('❌ Role document not found');
      process.exit(1);
    }

    const currentData = roleDoc.data();
    console.log('📋 Current data:', JSON.stringify(currentData, null, 2));

    // Update the document with facilities as an array
    await db.collection('roles').doc(userId).update({
      facilities: [facilityId], // Convert string to array
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Successfully updated role document!');
    console.log(`User ID: ${userId}`);
    console.log(`Role: facility_manager`);
    console.log(`Facilities: ["${facilityId}"]`);
    console.log('\nPlease logout and login again to see the changes.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating role:', error);
    process.exit(1);
  }
}

fixFacilityManagerRole();
