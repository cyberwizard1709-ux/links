#!/bin/bash

# Export data from SQLite
echo "📦 Exporting data from SQLite..."

# Export categories
sqlite3 ./dev.db -json "SELECT * FROM Category;" > /tmp/categories.json

# Export links  
sqlite3 ./dev.db -json "SELECT * FROM Link;" > /tmp/links.json

# Export users
sqlite3 ./dev.db -json "SELECT * FROM User;" > /tmp/users.json

# Export posts
sqlite3 ./dev.db -json "SELECT * FROM Post;" > /tmp/posts.json

# Export tags
sqlite3 ./dev.db -json "SELECT * FROM Tag;" > /tmp/tags.json

# Export settings
sqlite3 ./dev.db -json "SELECT * FROM Settings;" > /tmp/settings.json

echo "✅ Data exported to /tmp/"
echo ""
echo "Counts:"
echo "Categories: $(cat /tmp/categories.json | grep -c '"id"' || echo 0)"
echo "Links: $(cat /tmp/links.json | grep -c '"id"' || echo 0)"
echo "Users: $(cat /tmp/users.json | grep -c '"id"' || echo 0)"
echo "Posts: $(cat /tmp/posts.json | grep -c '"id"' || echo 0)"
