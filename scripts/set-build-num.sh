#!bin/sh

BUILD_NUM=$1

echo 'Adding build number '$BUILD_NUM' to version'

#updating package.json
sed -i -r -e 's/(\"version\": \"[0-9]{1,2}\.[0-9]{1,3}\.)[0-9]*([A-Za-z0-9\-]*\")/\1'$BUILD_NUM'\2/gm' ./package.json

VERSION=`node -p "require('./package.json').version"`

#updating ownid-web-ui-sdk.ts
sed -i -r -e 's/\$\{APP_VERSION\}/'$VERSION'/gm' ./src/ownid-web-ui-sdk.ts
