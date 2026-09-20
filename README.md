# KHAN दही — Final Furnished

## Run locally
npm install
npm start
Open http://localhost:3000 and admin at http://localhost:3000/admin

## Render Environment
ADMIN_USER=your_admin_id
ADMIN_PASSWORD=your_password
SESSION_SECRET=long-random-secret
NODE_ENV=production

No bcrypt hash is required manually. The server hashes ADMIN_PASSWORD in memory for login comparison.

## Product packages
Each product can have unlimited packages/options. Every package has its own:
- Label (Single / Pack of 6 / Pack of 12)
- Weight/size
- Main price
- Offer price
- Image

On the public site, selecting a package changes the product image in-place and updates a compact glass price panel on the same screen. There is no large price modal.
