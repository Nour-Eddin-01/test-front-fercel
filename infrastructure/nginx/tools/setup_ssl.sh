#!/bin/sh

mkdir -p /etc/nginx/ssl
if [ ! -f /etc/nginx/ssl/tradehub.crt ]; then
    echo " Generating Self-Signed SSL Certificate..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/tradehub.key \
        -out /etc/nginx/ssl/tradehub.crt \
        -subj "/C=MA/ST=Benguerir/L=1337/O=TradeHub/CN=localhost"
fi


USER=${KIBANA_USER:-admin}
PASS=${KIBANA_PASSWORD:-tradehub2026}

echo " Generating Kibana Credentials for user: $USER..."
# -b = batch mode, -c = create new file, -m = use MD5 encryption (Standard for Nginx)
# We install 'apache2-utils' in the Dockerfile to get the 'htpasswd' tool
htpasswd -bc /etc/nginx/conf.d/.htpasswd "$USER" "$PASS"

echo " Security Setup Complete!"

# Start Nginx
exec nginx -g "daemon off;"