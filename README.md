# Hono Auth

Basic custom username/password auth system.

This is a replica of the [MERN Auth](https://github.com/djimenezweb/mern-auth) server, but using **Prisma/SQLite** and **Hono** instead of Mongo and Express.

Live demo: https://mern-auth-o1gw.onrender.com

- Session based
- Role authorization (user, admin)
- Authenticated users can log in and see their own open sessions.
- Admins can delete users, invalidate sessions and close other user's sessions.

[![Screen capture](https://raw.githubusercontent.com/djimenezweb/mern-auth/refs/heads/master/client/public/screenshot.png)](https://mern-auth-o1gw.onrender.com)

## Back End

- Node.js + Hono
- TypeScript
- Prisma & SQLite
- Zod validation
- Refresh and Access Tokens
- Hashed passwords
- HttpOnly Cookies
- Custom middleware
- Custom error handler
- Protected endpoints
- Auto delete expired sessions from database

## Front End

- Front End code at [MERN Auth repository](https://github.com/djimenezweb/mern-auth)
- Vite + React + TypeScript
- Shadcn/ui
- Tailwind CSS
- Icons: [Lucide](https://lucide.dev/) + [react-icons](https://react-icons.github.io/react-icons/)
- Fonts: [Jost](https://indestructibletype.com/Jost.html) + [JetBrainsMono](https://www.jetbrains.com/lp/mono/)

## License

Licensed under the MIT License. Check the [LICENSE](./LICENSE.md) file for details.
