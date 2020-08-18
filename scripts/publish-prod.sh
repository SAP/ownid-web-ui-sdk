#!bin/sh

PKG_VERSION=`node -p "require('./package.json').version"`
S3PATH=s3://cdn.ownid.com/js
aws s3 cp ./dist $S3PATH --recursive

