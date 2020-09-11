#!bin/sh

PKG_VERSION=`node -p "require('./package.json').version"`
S3PATH=s3://cdn.ownid.com/js

GIT_TAG=prod/$PKG_VERSION
git tag -a $GIT_TAG -m "Production release $PKG_VERSION"
git push origin $GIT_TAG

aws s3 cp ./dist $S3PATH --recursive

