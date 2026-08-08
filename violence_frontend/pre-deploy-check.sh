#!/bin/bash

echo "🔍 Pre-Deployment Checklist for Vercel"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this script from violence_frontend directory."
    exit 1
fi

echo "✅ In correct directory"
echo ""

# Check for required files
echo "📁 Checking required files..."
required_files=("package.json" "vite.config.ts" "index.html" "vercel.json")
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file exists"
    else
        echo "  ❌ $file missing"
        exit 1
    fi
done
echo ""

# Check environment variables
echo "🔐 Checking environment variables..."
if [ -f ".env.production" ]; then
    echo "  ✅ .env.production exists"
    
    # Check for required variables
    required_vars=("VITE_SUPABASE_URL" "VITE_SUPABASE_ANON_KEY" "VITE_API_URL")
    for var in "${required_vars[@]}"; do
        if grep -q "$var" .env.production; then
            echo "  ✅ $var is defined"
        else
            echo "  ⚠️  $var is missing in .env.production"
        fi
    done
else
    echo "  ⚠️  .env.production not found"
fi
echo ""

# Check if node_modules exists
echo "📦 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "  ✅ node_modules exists"
else
    echo "  ⚠️  node_modules not found. Run 'npm install' first."
fi
echo ""

# Try to build the project
echo "🏗️  Testing build process..."
echo "  Running: npm run build"
echo ""

if npm run build; then
    echo ""
    echo "  ✅ Build successful!"
    echo ""
    
    # Check dist directory
    if [ -d "dist" ]; then
        echo "  ✅ dist directory created"
        echo "  📊 Build output size:"
        du -sh dist
        echo ""
        echo "  📄 Files in dist:"
        ls -lh dist/
    fi
else
    echo ""
    echo "  ❌ Build failed! Fix errors before deploying."
    exit 1
fi

echo ""
echo "======================================"
echo "✅ Pre-deployment checks complete!"
echo ""
echo "Next steps:"
echo "1. Review the VERCEL_DEPLOYMENT.md guide"
echo "2. Push your code to Git"
echo "3. Import project to Vercel"
echo "4. Configure environment variables"
echo "5. Deploy!"
echo ""
echo "Or use Vercel CLI:"
echo "  vercel --prod"
echo ""
