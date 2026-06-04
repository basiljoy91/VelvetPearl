# Hostinger Production Plan

This plan is written for your current setup:

- Hostinger **Cloud Startup** hosting
- Hostinger **MySQL** database
- Hostinger **managed Node.js app** deployment

## Big Decision

Do **not** deploy this project only through `public_html` in File Manager.

Why:

- `public_html` alone is fine for static HTML/CSS/JS
- your project also needs a running Node.js backend
- the backend handles admin auth, enquiries, analytics, and database writes

For this project, the correct production shape is:

- one Hostinger Node.js app for the website and API
- one Hostinger MySQL database
- the React frontend built into `dist/`
- the Express backend serving `dist/` and `/api/*`

## Phase 1: Create the MySQL Database

This matches the screen you showed in Hostinger:

`Websites -> velvetpearl.in -> Databases -> Management`

Create a new MySQL database and user.

What to fill:

- Database name: short and simple, like `velvet`
- Username: short and simple, like `velvetapp`
- Password: generate and save it safely

Important:

- Hostinger will prepend your account prefix automatically
- final values will look like `u588979449_velvet`

After creation, note these four values:

- database name
- database username
- database password
- database host

For Hostinger managed hosting, the host is usually `localhost`.

## Phase 2: Use the Node.js App Feature

Because your plan is **Cloud Startup**, use Hostinger’s Node.js deployment, not plain file upload to `public_html`.

Important:

- the `Add Website` button is in the main **Websites list view**
- it does **not** appear inside the current website management page
- if `velvetpearl.in` is already added as a regular website, Hostinger currently requires you to remove that website entry first, then add it again as a Node.js app

In hPanel:

1. Go to `Websites`
2. Click `Add Website`
3. Choose `Node.js Apps`
4. Choose either:
   - GitHub repository deployment
   - ZIP upload deployment

For your first launch, ZIP upload is totally fine if that feels easier.

### If `velvetpearl.in` Is Already Present

Your screenshot shows that `velvetpearl.in` already exists as a normal website entry and is currently showing WordPress tools.

That means:

- you are in the wrong screen for Node.js app creation
- you will not see `Add Website` there
- you must go back to the main Websites list

If you want Node.js on the root domain `velvetpearl.in`, do this:

1. Back up anything important from the existing website entry
2. Go to the main `Websites` list
3. Open the options menu `⋮` for `velvetpearl.in`
4. Delete that website entry
5. Wait for Hostinger to release the domain from that website slot
6. Click `Add Website`
7. Choose `Node.js Apps`
8. Add `velvetpearl.in` again during the Node.js app onboarding

Warning:

- deleting a website entry is destructive
- Hostinger says files, configurations, and website-linked data can be deleted with it
- do not do this if that current website still contains anything you need

## Phase 3: Project Build Settings in Hostinger

This repo is now prepared for Hostinger with these scripts:

- Build command: `npm run hostinger:build`
- Start command: `npm run hostinger:start`

What those do:

- `npm run hostinger:build`
  - installs backend dependencies
  - builds the Vite frontend
- `npm run hostinger:start`
  - starts the Express backend from `backend/server.js`

If Hostinger asks for fields manually:

- Framework: `Other` or `Express.js`
- Output directory: `dist`
- Entry file: `backend/server.js`

## Phase 4: Environment Variables

In the Hostinger Node.js app dashboard, open **Environment Variables** and add:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=12h
SETUP_SECRET=replace_with_a_long_random_setup_secret
CORS_ORIGIN=https://velvetpearl.in,https://www.velvetpearl.in
DATABASE_URL=mysql://DB_USER:DB_PASSWORD@localhost:3306/DB_NAME
DB_SSL=false
SERVE_FRONTEND=true
FRONTEND_DIST_PATH=../dist
REQUEST_BODY_LIMIT=250kb
WHATSAPP_CLOUD_API_ENABLED=false
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
ADMIN_WHATSAPP_NUMBER=
WHATSAPP_CUSTOMER_ACK_TEMPLATE_NAME=
WHATSAPP_CUSTOMER_ACK_TEMPLATE_LANGUAGE=en_US
```

Replace:

- `DB_USER` with your real Hostinger database username
- `DB_PASSWORD` with the real password
- `DB_NAME` with the real database name

Example shape:

```env
DATABASE_URL=mysql://u588979449_velvetapp:your_password@localhost:3306/u588979449_velvet
```

## Phase 5: Upload the Project

You have two good options.

### Option A: Upload ZIP

1. From this project folder, create a zip of the repository contents
2. In Hostinger Node.js app setup, choose file upload
3. Upload the zip
4. Set the build/start settings shown above
5. Deploy

### Option B: GitHub

1. Push this repo to GitHub
2. In Hostinger Node.js app setup, choose GitHub import
3. Select the repo
4. Confirm the build/start settings
5. Deploy

## Phase 6: First Deployment Check

After deploy finishes, verify:

- homepage loads
- `/api/health` works
- admin login page opens
- enquiry form submits
- new enquiry row appears in phpMyAdmin

Useful URLs:

- `https://your-domain.com/`
- `https://your-domain.com/api/health`
- `https://your-domain.com/admin`

## Phase 7: Database Verification in phpMyAdmin

Open:

`Websites -> velvetpearl.in -> Databases -> phpMyAdmin`

Check that these tables exist:

- `admins`
- `admin_setup_keys`
- `enquiries`
- `enquiry_counters`
- `drivers`
- `fleet`
- `cab_enquiry_details`
- `room_enquiry_details`
- `tour_enquiry_details`
- `custom_trip_details`
- `enquiry_audit_log`

If they exist, the backend schema bootstrap worked.

## Phase 8: Create the First Admin

Once the site is live:

1. Open `/admin`
2. Choose the first-time setup flow
3. Enter:
   - admin email
   - strong password
   - the exact `SETUP_SECRET` from your environment variables

That creates the first admin account.

## Phase 9: WhatsApp Integration Later

For the first production launch, keep:

```env
WHATSAPP_CLOUD_API_ENABLED=false
```

That reduces launch risk.

Once the website, admin login, and enquiry saving all work correctly, we can enable WhatsApp in a second pass.

## Code Changes Already Made

This repo has been updated for MySQL and Hostinger-managed Node.js deployment:

- PostgreSQL driver replaced with `mysql2`
- backend query layer rewritten for MySQL connection pooling
- MySQL schema added in [`backend/utils/schema.sql`](/Users/basiljoy/VS%20code/roughnote/cabwebsit/backend/utils/schema.sql)
- backend startup now bootstraps MySQL tables
- root scripts added for Hostinger build/start
- backend env template updated for MySQL
- frontend can still be served by Express from `dist/`

## Recommended First Live Run

1. Create the MySQL database in Hostinger
2. Add the Node.js app in hPanel
3. Upload the project zip or connect GitHub
4. Set environment variables
5. Use:
   - Build command: `npm run hostinger:build`
   - Start command: `npm run hostinger:start`
6. Deploy
7. Open `/api/health`
8. Open `/admin`
9. Submit one test enquiry
10. Confirm the new row in phpMyAdmin

## If Deployment Fails

Check these first:

- wrong MySQL username or password
- wrong database name
- `DATABASE_URL` still starts with `postgresql://`
- app uploaded through plain File Manager instead of Node.js Apps
- missing environment variables
- build command not set to `npm run hostinger:build`
- start command not set to `npm run hostinger:start`
