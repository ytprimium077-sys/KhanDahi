# KHAN दही — Signature Premium FINAL

## Admin panel
Open:
`http://localhost:3000/admin`

Default local login:
- Username: `admin`
- Password: `ChangeMe123!`

For production, set:
- `ADMIN_USER`
- `ADMIN_PASSWORD_HASH`
- `SESSION_SECRET`

## Product management
Admin can:
- Add unlimited products
- Upload/replace product images
- Add unlimited Single / Pack / Size variants
- Set Main Price
- Set Offer Price
- Edit/delete products

Public site automatically shows:
- Main price with red strike-through
- Offer price below it

## Local setup
```bash
npm install
npm start
```

## Video
Put the dairy-making video at:
`public/assets/khan-dahi-making.mp4`

## Storage note
This build stores products/settings/images in local files. That is persistent on normal persistent hosting, but Render Free filesystem is ephemeral. For production on a persistent host this works for a small site; a database/object storage can be added later if needed.


## Render admin credentials
For Render, use Environment Variables instead of committing credentials to GitHub:
- `ADMIN_USER` = your admin username
- `ADMIN_PASSWORD` = your normal admin password (the server hashes it with bcrypt at startup)
- `SESSION_SECRET` = a long random secret

`ADMIN_PASSWORD_HASH` is optional for advanced use. `ADMIN_PASSWORD` is simpler and avoids manually generating a bcrypt hash. The password show/hide button is available on the admin login screen.

Default local login: `admin` / `ChangeMe123!`. Change it in Render by setting `ADMIN_USER` and `ADMIN_PASSWORD`.
