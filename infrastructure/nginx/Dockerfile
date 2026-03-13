FROM nginx:alpine

RUN apk add --no-cache openssl apache2-utils

RUN ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log

COPY default.conf /etc/nginx/conf.d/default.conf
COPY tools/setup_ssl.sh /usr/local/bin/setup_ssl.sh

RUN chmod +x /usr/local/bin/setup_ssl.sh

ENTRYPOINT ["/usr/local/bin/setup_ssl.sh"]