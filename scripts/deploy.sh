#!bin/sh

ENV=$1
CDN_DISTRIBUITION=$2

#PKG_VERSION=`node -p "require('./package.json').version"`
#FOLDER=$PKG_VERSION"_"$TRAVIS_BUILD_NUMBER

# GIT_TAG=$ENV/$FOLDER
# git tag $GIT_TAG
# git push origin $GIT_TAG

#echo Version folder: $S3PATH/$FOLDER

S3PATH=s3://cdn.$ENV.ownid.com/js
aws s3 cp ./dist $S3PATH --recursive
aws cloudfront create-invalidation --distribution-id $CDN_DISTRIBUITION --paths "/*"


