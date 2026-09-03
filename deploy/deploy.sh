#!/usr/bin/env bash
# Deploy Kilimanjaro Pazuri. Run on the server, from the repo checkout.
#
#   ./deploy/deploy.sh
#
# Expects .env beside it holding ADMIN_USERNAME and ADMIN_PASSWORD_HASH
# (generate the hash with: npm run hash-password -- "the password").
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
	echo "Missing .env — copy .env.example and fill it in first." >&2
	exit 1
fi

echo "==> Fetching latest"
git pull --ff-only

echo "==> Building and restarting"
docker compose up -d --build

echo "==> Waiting for health"
for i in $(seq 1 30); do
	if docker compose exec -T kilimanjaro-pazuri \
		node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>r.text()).then(t=>{console.log(t);process.exit(0)}).catch(()=>process.exit(1))" 2>/dev/null; then
		exit 0
	fi
	sleep 2
done

echo "Service did not become healthy. Recent logs:" >&2
docker compose logs --tail 40 kilimanjaro-pazuri >&2
exit 1
