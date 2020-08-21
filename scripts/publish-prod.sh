#!bin/sh

PKG_VERSION=`node -p "require('./package.json').version"`
S3PATH=s3://cdn.ownid.com/js

git tag -a prod/$PKG_VERSION -m "Production release $PKG_VERSION"

aws s3 cp ./dist $S3PATH --recursive

