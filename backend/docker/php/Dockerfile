FROM php:8.4-cli-alpine

RUN apk add --no-cache \
    bash \
    curl \
    libzip-dev \
    zip \
    oniguruma-dev \
    unzip \
    && docker-php-ext-install pdo pdo_mysql mbstring bcmath zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html