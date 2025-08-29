# Supabase Setup Guide

This guide will help you set up Supabase as the database for your MenuCard application.

## 🚀 Quick Setup

### 1. Supabase Project Setup

You're using the existing Supabase project:
- **URL**: `https://nqgehcucndncjbgcussq.supabase.co`
- **Project ID**: `nqgehcucndncjbgcussq`

### 2. Get Your API Keys

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `nqgehcucndncjbgcussq`
3. Go to **Settings** → **API**
4. Copy the following keys:
   - **anon/public key** (for client-side usage)
   - **service_role key** (for server-side admin operations)

### 3. Get Database Connection String

1. In Supabase Dashboard, go to **Settings** → **Database**
2. Look for **Connection string** section
3. Copy the **URI** format connection string
4. It should look like: `postgresql://postgres:[PASSWORD]@db.nqgehcucndncjbgcussq.supabase.co:5432/postgres`

### 4. Environment Variables Setup

Create a `.env.local` file in your project root:

```bash
# Supabase Database
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.nqgehcucndncjbgcussq.supabase.co:5432/postgres"
SUPABASE_URL="https://nqgehcucndncjbgcussq.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
NEXT_PUBLIC_SUPABASE_URL="https://nqgehcucndncjbgcussq.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (get from Google Console)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OpenRouter API (get from OpenRouter)
OPENROUTER_API_KEY="your-openrouter-api-key"

# Cloudinary (get from Cloudinary)
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="MenuCard"
```

### 5. Database Migration

Run the following commands to set up your database:

```bash
# Generate Prisma client
npx prisma generate

# Push the schema to Supabase
npx prisma db push

# Optional: Seed with sample data
npx prisma db seed
```

## 🔧 Advanced Configuration

### Row Level Security (RLS)

For production, you should enable RLS on your tables. Run these SQL commands in Supabase SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Restaurant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Menu" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MenuCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MenuItem" ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own data
CREATE POLICY "Users can view own profile" ON "User"
  FOR SELECT USING (auth.uid()::text = id);

-- Allow users to manage their own restaurants
CREATE POLICY "Users can manage own restaurants" ON "Restaurant"
  FOR ALL USING (auth.uid()::text = "ownerId");

-- Allow users to manage their own menus
CREATE POLICY "Users can manage own menus" ON "Menu"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "Restaurant" 
      WHERE "Restaurant".id = "Menu"."restaurantId" 
      AND "Restaurant"."ownerId" = auth.uid()::text
    )
  );

-- Public read access for published restaurants
CREATE POLICY "Public can view published restaurants" ON "Restaurant"
  FOR SELECT USING ("isPublic" = true);

-- Public read access for menus of published restaurants
CREATE POLICY "Public can view menus of published restaurants" ON "Menu"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Restaurant" 
      WHERE "Restaurant".id = "Menu"."restaurantId" 
      AND "Restaurant"."isPublic" = true
    )
  );
```

### Supabase Auth Integration (Optional)

If you want to use Supabase Auth instead of NextAuth.js:

1. Enable Google OAuth in Supabase Dashboard:
   - Go to **Authentication** → **Providers**
   - Enable Google
   - Add your Google OAuth credentials

2. Update your authentication flow to use Supabase Auth

## 🧪 Testing the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000`
3. Try signing in with Google
4. Test the camera and menu extraction features

## 🚨 Troubleshooting

### Common Issues:

1. **Database Connection Error**
   - Check your `DATABASE_URL` is correct
   - Ensure your Supabase project is active
   - Verify your password is correct

2. **API Key Issues**
   - Make sure you're using the correct anon key
   - Check that NEXT_PUBLIC_ variables are set for client-side usage

3. **Migration Issues**
   - Run `npx prisma db push` instead of `npx prisma migrate dev` for Supabase
   - Check Supabase logs for any errors

4. **Authentication Issues**
   - Verify NextAuth configuration
   - Check Google OAuth settings
   - Ensure NEXTAUTH_SECRET is set

## 📝 Database Schema

Your database includes these main tables:

- **User** - User profiles and authentication
- **Restaurant** - Restaurant information and settings
- **Menu** - Restaurant menus
- **MenuCategory** - Menu categories (Appetizers, Mains, etc.)
- **MenuItem** - Individual menu items with prices and details

## 🔐 Security Best Practices

1. Never commit your `.env.local` file
2. Use environment variables for all sensitive data
3. Enable RLS in production
4. Regularly rotate your API keys
5. Use the service role key only for server-side operations

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma with Supabase](https://www.prisma.io/docs/guides/database/supabase)
- [NextAuth.js Documentation](https://next-auth.js.org/)

---

Need help? Check the Supabase Dashboard logs or create an issue in the repository!
