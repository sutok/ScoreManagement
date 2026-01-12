#!/bin/bash

# Add admin role to user via Firebase CLI
# Usage: bash scripts/create-admin.sh

USER_ID="FVcgy4G1fJN1cO9qWe6KgVfiDv82"
PROJECT_ID="bowlards"

echo "🔧 Creating admin role for user: $USER_ID"
echo ""

# Create temporary JSON file
TEMP_FILE=$(mktemp)
cat > "$TEMP_FILE" << EOF
{
  "role": "admin",
  "createdAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "updatedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

echo "📄 Role data:"
cat "$TEMP_FILE"
echo ""

# Use firebase firestore command to add document
echo "🚀 Adding document to Firestore..."
firebase firestore:set "roles/$USER_ID" "$TEMP_FILE" --project "$PROJECT_ID"

# Clean up
rm "$TEMP_FILE"

echo ""
echo "✅ Admin role created successfully!"
echo "👤 User ID: $USER_ID"
echo "🔑 Role: admin"
echo ""
echo "⚠️  Please logout and login again to see the changes."
