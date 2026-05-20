#!/bin/bash
# ── AI Life Manager — Quick Setup Script ──────────────
set -e

echo "🚀 Setting up AI Life Manager Backend..."

# 1. Copy env file
if [ ! -f .env ]; then
  cp .env.example .env
  echo "📋 .env created — fill in your OPENAI_API_KEY and SECRET_KEY!"
fi

# 2. Create virtual environment
if [ ! -d "venv" ]; then
  echo "🐍 Creating virtual environment..."
  python3 -m venv venv
fi

# 3. Activate & install deps
echo "📦 Installing dependencies..."
source venv/bin/activate
pip install -r requirements.txt --quiet

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit .env → add your OPENAI_API_KEY"
echo "  2. Start DB + Redis: docker-compose up postgres redis -d"
echo "  3. Run server:       source venv/bin/activate && uvicorn main:app --reload"
echo "  4. Open docs:        http://localhost:8000/docs"
echo ""
