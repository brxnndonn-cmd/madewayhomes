#!/bin/bash
cd /home/team/shared/madewayhomes
# Ensure symlink
ln -sf client/tailwind.config.cjs tailwind.config.cjs
rm -rf client/dist
bun run build
echo "BUILD_EXIT_CODE=$?"
