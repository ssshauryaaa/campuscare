#!/bin/bash

echo "Setting up Breach@trix AvD instances..."

TEAMS=("team-a" "team-b" "team-c" "team-d")

# Create instances directory
mkdir -p instances

for TEAM in "${TEAMS[@]}"; do
  echo "→ Creating instance for $TEAM..."

  # Fresh copy of source for each team
  cp -r campuscare instances/$TEAM

  # Remove any leftover WAL files from your dev environment
  rm -f instances/$TEAM/campus.db-shm
  rm -f instances/$TEAM/campus.db-wal
  rm -f instances/$TEAM/.next

  echo "  ✓ $TEAM ready at instances/$TEAM"
done

echo ""
echo "All instances created. Run:"
echo "  docker compose -f docker-compose.dev.yml up -d"
echo ""
echo "Then install deps in each container:"
echo "  docker compose -f docker-compose.dev.yml exec team-a npm install"
echo "  docker compose -f docker-compose.dev.yml exec team-b npm install"
echo "  docker compose -f docker-compose.dev.yml exec team-c npm install"
echo "  docker compose -f docker-compose.dev.yml exec team-d npm install"