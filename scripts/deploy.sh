#!bin/sh

ENV=$1

PKG_VERSION=`node -p "require('./package.json').version"`
S3PATH=s3://cdn.ownid.com/$ENV/js
#FOLDER=$PKG_VERSION"_"$TRAVIS_BUILD_NUMBER

# GIT_TAG=$ENV/$FOLDER
# git tag $GIT_TAG
# git push origin $GIT_TAG

#echo Version folder: $S3PATH/$FOLDER
echo Latest folder: $S3PATH/latest

aws s3 cp ./dist $S3PATH/latest --recursive
#aws s3 cp ./dist $S3PATH/$FOLDER --recursive

DISTRIBUTIONID=EDUOQUBKTEHZF
aws cloudfront create-invalidation --distribution-id $DISTRIBUTIONID --paths "/${ENV}/js/latest/*"

