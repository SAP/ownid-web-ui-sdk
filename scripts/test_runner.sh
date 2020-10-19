#!/bin/bash
REPO_SLUG=OwnID%2Fautomation
REPO_BRANCH=${3:-"development"}
COMPONENT=${1:-"all"}
LEVEL="smoke"
STAGE=${2:-"dev"}
TESTRAIL="false"
SLACK="true"


START_TIME=$(date +"%s")

printf "Triggering test automation for component \e[1m'%s'\e[0m in branch '%s'\n" "$COMPONENT" "$REPO_BRANCH"

TRIGGER_BODY="{
  \"request\": {
    \"branch\": \"$REPO_BRANCH\",
    \"message\":\"Travis deploy triggered '$COMPONENT' checks\",
    \"merge_mode\":\"deep_merge_append\",
    \"config\": {
      \"env\":{\"global\":[\"LEVEL=$LEVEL\",\"SCOPE_COMPONENTS=$COMPONENT\", \"APP_ENV=$STAGE\", \"TESTRAIL_REPORT=$TESTRAIL\", \"SLACK_REPORT=$SLACK\"]}
    }
  }
}"

TRIGGER_RESP=$( curl -s -X POST \
   -H "Content-Type: application/json" \
   -H "Accept: application/json" \
   -H "Travis-API-Version: 3" \
   -H "Authorization: token $TRAVIS_API_TOKEN" \
   -d "$TRIGGER_BODY" \
   https://travis-ci.cloud.sap.corp/api/repo/$REPO_SLUG/requests )

if [ "$(echo "$TRIGGER_RESP" | jq -r '.["@type"]')" == "pending" ]; then
  BUILDS_LIST=$( curl -s -X GET \
     -H "Content-Type: application/json" \
     -H "Accept: application/json" \
     -H "Travis-API-Version: 3" \
     -H "Authorization: token $TRAVIS_API_TOKEN" \
     https://travis-ci.cloud.sap.corp/api/repo/$REPO_SLUG/builds?branch.name=$REPO_BRANCH\&sort_by=started_atdesc\&limit=1 )

  BUILD_ID=$( echo "$BUILDS_LIST" | jq -r '.builds[0].id' )
  BUILD_NUM=$( echo "$BUILDS_LIST" | jq -r '.builds[0].number' )
  BUILD_STATE=""

  printf "Build #%s | \e[36mTRIGGERED\e[0m | Waiting for results " "$BUILD_NUM"

  while [[ "$BUILD_STATE" != "passed" && "$BUILD_STATE" != "failed" && "$BUILD_STATE" != "canceled" ]]; do
    BUILD_RESP=$( curl -s -X GET \
       -H "Content-Type: application/json" \
       -H "Accept: application/json" \
       -H "Travis-API-Version: 3" \
       -H "Authorization: token $TRAVIS_API_TOKEN" \
       "https://travis-ci.cloud.sap.corp/api/build/$BUILD_ID" )
    BUILD_STATE=$( echo "$BUILD_RESP" | jq -r '.state' )
    if [ "$BUILD_STATE" == "created" ]; then
      printf '\e[36m.\e[0m'
      sleep 10
    elif [ "$BUILD_STATE" == "started" ]; then
      printf '\e[36;1m:\e[0m'
      sleep 10
    elif [ "$BUILD_STATE" == "passed" ]; then
      printf "\e[32;1m PASSED\e[0m"
    elif [ "$BUILD_STATE" == "failed" ]; then
      printf "\e[31;1m FAILED\e[0m"
    elif [ "$BUILD_STATE" == "canceled" ]; then
      printf "\e[1m CANCELED\e[0m"
    else
      printf '\nSomething went wrong, here is last build status:\n%s' "$BUILD_RESP"
      exit 1
    fi
  done

  STOP_TIME=$(date +"%s")
  printf "\nDone. Elapsed time: \e[1;4m%s seconds\e[0m\n" "$((STOP_TIME-START_TIME))"
#  if [ "$BUILD_STATE" == "passed" ]; then exit 0; else exit 1; fi
  exit 0
else
  printf "Something went wrong, here is trigger response output:\n%s" "$TRIGGER_RESP"
fi
