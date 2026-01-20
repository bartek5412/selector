This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Wymagania przed wdrożeniem

1. **Zmienne środowiskowe**: Upewnij się, że w Vercel Dashboard ustawiłeś następujące zmienne środowiskowe:
   - `DATABASE_URL` - URL do bazy danych PostgreSQL
   - `NEXTAUTH_SECRET` - Sekretny klucz dla NextAuth (wygeneruj: `openssl rand -base64 32`)
   - `NEXTAUTH_URL` - URL Twojej aplikacji na Vercel (np. `https://selector-alpha.vercel.app`)
   - `AUTH_SECRET` - (opcjonalnie) Alternatywa dla NEXTAUTH_SECRET w NextAuth 5
   - `AUTH_URL` - (opcjonalnie) URL dla NextAuth 5, zazwyczaj taki sam jak `NEXTAUTH_URL`
   
   **WAŻNE**: `trustHost: true` w konfiguracji NextAuth automatycznie wykrywa URL z nagłówków HTTP, więc `NEXTAUTH_URL` może nie być wymagane, ale zalecane jest jego ustawienie.

2. **Python Runtime**: Aplikacja używa Python serverless functions w folderze `api/`:
   - `api/process-pdf.py` - przetwarzanie plików PDF
   - `api/get-length.py` - obliczanie długości ścieżek
   
   Vercel automatycznie wykryje te pliki i użyje Python 3.12 runtime.

3. **Zależności**: 
   - Node.js dependencies są instalowane przez `npm install`
   - Python dependencies są instalowane z `requirements.txt` automatycznie przez Vercel

4. **Build**: Vercel użyje skryptu `vercel-build` z `package.json`, który:
   - Generuje Prisma Client
   - Uruchamia migracje Prisma (`prisma migrate deploy`)
   - Buduje aplikację Next.js

5. **Migracje bazy danych**: 
   - Migracje są automatycznie uruchamiane podczas builda na Vercel
   - Upewnij się, że `DATABASE_URL` w Vercel wskazuje na poprawną bazę danych PostgreSQL
   - Jeśli baza danych jest pusta, migracje utworzą wszystkie potrzebne tabele

### Struktura projektu

- `src/app/` - Next.js App Router
- `api/` - Python serverless functions (Flask)
- `prisma/` - Prisma schema i migracje
- `requirements.txt` - Python dependencies
- `vercel.json` - Konfiguracja Vercel