# === Étape 1 : dépendances ===
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn config set registry https://registry.npmjs.org/ && \
    yarn install --frozen-lockfile --prefer-offline --network-timeout 300000

# === Étape 2 : build ===
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .


ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_STRIPE_PUBLIC_KEY
ARG STRIPE_SECRET_KEY
ARG INTERNAL_WEBHOOK_SECRET
ARG STRIPE_WEBHOOK_SECRET
ARG DJANGO_API_URL
ARG NOTCHPAY_ENV
ARG NOTCHPAY_PUBLIC_KEY
ARG NOTCHPAY_PRIVATE_KEY

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}
ENV NEXT_PUBLIC_STRIPE_PUBLIC_KEY=${NEXT_PUBLIC_STRIPE_PUBLIC_KEY}
ENV STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
ENV INTERNAL_WEBHOOK_SECRET=${INTERNAL_WEBHOOK_SECRET}
ENV STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
ENV DJANGO_API_URL=${DJANGO_API_URL}
ENV NOTCHPAY_ENV=${NOTCHPAY_ENV}
ENV NOTCHPAY_PUBLIC_KEY=${NOTCHPAY_PUBLIC_KEY}
ENV NOTCHPAY_PRIVATE_KEY=${NOTCHPAY_PRIVATE_KEY}

RUN yarn build

# === Étape 3 : image finale (légère) ===
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]