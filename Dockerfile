FROM node:20-alpine

WORKDIR /app

# تثبيت مكتبات OpenSSL و libc6-compat اللازمة لعمل Prisma على Alpine
RUN apk add --no-cache openssl libc6-compat

# نسخ ملفات المشروع بالكامل
COPY . .

# تثبيت الحزم
RUN npm install

# توليد Prisma Client
RUN npx prisma generate --schema=./packages/database/prisma/schema.prisma

# ترجمة حزمة قاعدة البيانات أولاً من TS إلى JS داخل مجلد dist
RUN npx tsc -p packages/database

# بناء الـ API فقط عبر Turbo
RUN npx turbo run build --filter=@sports-social/api

# فتح المنفذ وتشغيل السيرفر
EXPOSE 4000
CMD ["node", "apps/api/dist/server.js"]