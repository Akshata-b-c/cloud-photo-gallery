# Cloud Photo Gallery

## Project Overview
Cloud Photo Gallery is a web application that allows users to create an account, sign in, upload photos, view their personal photo collection, and delete photos.

The application uses React and Supabase for authentication, database management, and private image storage.

## Features
- User registration and email authentication
- Secure sign-in and sign-out
- Upload images (JPG, PNG, WebP, and GIF)
- View uploaded photos in a gallery
- Delete photos
- Store photo details in a database
- Private image storage
- User-specific access policies

## Technologies Used
- React
- Vite
- JavaScript
- CSS
- Supabase Authentication
- Supabase Storage
- Supabase PostgreSQL Database

## Architecture
This project uses Supabase as a free-tier alternative to the AWS services in the original project design.

| Original AWS service | Implementation used |
|---|---|
| Amazon S3 | Supabase Storage |
| Amazon Cognito | Supabase Authentication |
| Amazon DynamoDB | Supabase PostgreSQL |
| AWS Lambda | Browser-side application logic |
| Amazon CloudFront | Supabase Storage delivery |

The implementation preserves the core photo-gallery functionality but does not reproduce every AWS service.

## Installation and Setup

### 1. Clone the repository
```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd cloud-photo-gallery
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://ghdltyjimhrwgfihcehi.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_XRKY7pzrKEHhvpFsI5Nllw_LsiHFPcF
```

Replace the placeholders with your own Supabase project values.

Never upload your `.env` file or secret keys to GitHub.

### 4. Start the application
```bash
npm run dev
```

Open the local URL displayed in your terminal, usually:

`http://localhost:5173/`

## Supabase Configuration
The application requires:
- A Supabase project
- A private Storage bucket named `gallery-photos`
- A `photos` database table
- Row Level Security policies for user-specific photo access
- Storage policies for authenticated users

## Author
Name: Akshata b c

## Links
GitHub Repository:https://github.com/Akshata-b-c/cloud-photo-gallery.git

Live Application:https://cloud-photo-gallery-rust.vercel.app/
