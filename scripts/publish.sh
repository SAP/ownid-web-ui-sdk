#!bin/sh

ENV=$1

PKG_VERSION=`node -p "require('./package.json').version"`
S3PATH=s3://ownid-sdks-bucket/$ENV/web-ui-sdk
FOLDER=$PKG_VERSION"_"$TRAVIS_BUILD_NUMBER

echo Path: $S3PATH/$FOLDER

aws s3 cp ./dist $S3PATH/latest --recursive
aws s3 cp ./dist $S3PATH/$FOLDER --recursive

