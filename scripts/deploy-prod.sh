#!bin/sh

PKG_VERSION=`node -p "require('./package.json').version"`

# GIT_TAG=prod/$PKG_VERSION
# git tag -a $GIT_TAG -m "Production release $PKG_VERSION"
# git push origin $GIT_TAG

echo Prod A update
S3PATH=s3://cdn.ownid.com/js
aws s3 cp ./dist $S3PATH --recursive

echo Prod B update
S3PATH=s3://cdn-b.ownid.com/js
aws s3 cp ./dist $S3PATH --recursive

echo Cache invalidation
aws cloudfront create-invalidation --distribution-id EDUOQUBKTEHZF --paths "/js/*"
