FROM php:8.2-cli

# تثبيت متطلبات النظام وامتدادات PHP اللازمة للارافيل
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# تثبيت Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# مجلد العمل
WORKDIR /var/www

# نسخ ملفات المشروع
COPY . /var/www

# تثبيت حزم لارافيل
RUN composer install --no-dev --optimize-autoloader --no-interaction

# الصلاحيات
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# المنفذ
EXPOSE 8080

# تشغيل السيرفر
CMD php artisan serve --host=0.0.0.0 --port=${PORT:-8080}
