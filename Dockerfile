FROM php:8.2-apache

RUN docker-php-ext-install mysqli pdo pdo_mysql

COPY . /var/www/html/

RUN echo "DirectoryIndex login.html" > /etc/apache2/mods-enabled/dir.conf

EXPOSE 80
