# A Course in Mexican Spanish

An interactive Spanish learning resource built with Astro and deployed on Cloudflare Pages.

## 🔐 Authentication

This site uses simple password-based authentication to protect content. All routes except `/login` require authentication.

### Local Development Setup

1. Copy the example environment file:

   ```sh
   cp .dev.vars.example .dev.vars
   ```

2. Edit `.dev.vars` and set your password:
   ```
   ACCESS_CODE=your-password-here
   ```

### Cloudflare Pages Deployment Setup

To deploy this site, you need to:

#### 1. Create a KV Namespace for Sessions

The Astro Cloudflare adapter requires a KV namespace for session storage:

```sh
npx wrangler kv namespace create SESSION --preview false
```

This will output something like:

```
Created namespace with id "abc123def456..."
```

Then, go to your Cloudflare Pages dashboard:

1. Navigate to your project → **Settings** → **Functions**
2. Scroll to **KV namespace bindings**
3. Add a binding:
   - **Variable name**: `SESSION`
   - **KV namespace**: Select the namespace you just created

Alternatively, if you're deploying via Wrangler CLI, add this to `wrangler.jsonc`:

```jsonc
{
  "kv_namespaces": [
    {
      "binding": "SESSION",
      "id": "your-namespace-id-here",
    },
  ],
}
```

#### 2. Set the ACCESS_CODE Environment Variable

1. Go to your [Cloudflare Pages dashboard](https://dash.cloudflare.com/)
2. Select your project (a-course-in-mexican-spanish)
3. Go to **Settings** → **Environment variables**
4. Add a new variable:
   - **Variable name**: `ACCESS_CODE`
   - **Value**: Your desired password
5. Add it for both **Production** and **Preview** environments
6. Redeploy your site for the changes to take effect

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── fonts/
├── src/
│   ├── components/
│   ├── content/
│   │   └── lessons/
│   ├── layouts/
│   ├── lib/
│   ├── pages/
│   │   ├── appendices/
│   │   ├── front-matter/
│   │   └── lessons/
│   ├── styles/
│   └── middleware.ts
├── astro.config.mjs
├── wrangler.jsonc
└── package.json
```

- **src/middleware.ts**: Authentication middleware that protects all routes
- **src/content/lessons/**: Markdown files for each lesson
- **src/pages/lessons/[...slug].astro**: Dynamic route handler for lessons

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
