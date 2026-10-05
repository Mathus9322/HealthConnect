FROM php:8.4-fpm

RUN apt-get update && apt-get install -y \
    git \
    curl \
    zip \
    unzip \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev

RUN docker-php-ext-install \
    pdo \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Limites d'upload (fichiers joints de la messagerie)
COPY docker/php/uploads.ini /usr/local/etc/php/conf.d/uploads.ini

WORKDIR /var/www

COPY . .

RUN composer install

RUN chmod -R 777 storage bootstrap/cache

# Configure PHP-FPM to listen on all interfaces
RUN sed -i 's/listen = 127.0.0.1:9000/listen = 0.0.0.0:9000/' /usr/local/etc/php-fpm.d/www.conf

EXPOSE 9000

CMD ["php-fpm"]
