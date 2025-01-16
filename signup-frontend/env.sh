#!/bin/sh

# taken from here https://stackoverflow.com/a/77454537
# replaces all env variables with the prefix PARK_ in all JS and CSS files

echo "Replacing env variables in JS and CSS files"

for i in $(env | grep PARK_)
do
    key=$(echo $i | cut -d '=' -f 1)
    value=$(echo $i | cut -d '=' -f 2-)
    echo $key=$value

    # sed JS and CSS only
    find /usr/share/nginx/html -type f \( -name '*.js' -o -name '*.css' \) -exec sed -i "s|${key}|${value}|g" '{}' +
done