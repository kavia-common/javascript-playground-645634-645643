#!/bin/bash
cd /tmp/kavia/workspace/code-generation/javascript-playground-645634-645643/javascript_playground_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

