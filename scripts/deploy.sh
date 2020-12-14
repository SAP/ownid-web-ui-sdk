#!bin/bash

S3_BUCKET=$1
DISTRIBUTIONID=$2

aws s3 sync ./dist $S3_BUCKET --delete
aws cloudfront create-invalidation --distribution-id $DISTRIBUTIONID --paths "/js/*"
