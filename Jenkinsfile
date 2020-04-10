pipeline {
        agent any
        stages {
            stage('Installing dependencies') {
                steps {
                    nodejs('Node-12.16') {
                      sh 'yarn install --force --network-timeout 1000000'
                    }
                }
            }

            stage('Unit tests') {
                 steps {
                    nodejs('Node-12.16') {
                      sh 'yarn test:ci'
                    }
                 }
            }

            stage('Build') {
              steps {
                nodejs('Node-12.16') {
                  sh 'yarn build'
                }
              }
            }
        }
    }
