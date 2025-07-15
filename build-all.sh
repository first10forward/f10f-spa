#!/bin/bash

echo "Building Hugo static site..."
hugo

echo "Building React app..."
npm run build

echo "Copying React app to public/app..."
mkdir -p public/app
cp -r dist/* public/app/

echo "Build complete!"
echo "Hugo content: public/ (main site)"
echo "React app: public/app/ (accessible at /app)"

echo ""
echo "To test locally (better Azure Static Web Apps simulation):"
echo "./serve-local.sh"
echo ""
echo "Or use vite preview (may not handle routing correctly):"
echo "npx vite preview --outDir public --port 3000"
