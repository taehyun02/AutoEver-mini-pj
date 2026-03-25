pipeline {
    agent any

    environment {
        IMAGE_NAME = 'my-backend-pipeline'
        IMAGE_REPO = 'taehyun02/my-backend-pipeline'
        APP_REPO = 'https://github.com/taehyun02/AutoEver-mini-pj.git'
        MANIFEST_REPO = 'https://github.com/taehyun02/wattup-my-manifest.git'
        GIT_EMAIL = 'jenkins@local'
        GIT_NAME = 'jenkins'
        MASTER_HOST = 'team_ev@10.0.2.10'
        MASTER_APP_DIR = '/home/team_ev/apps/AutoEver-mini-pj'
    }

    stages {
        stage('Checkout Jenkinsfile Source') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Build and Push Backend Image on Master') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    ),
                    usernamePassword(
                        credentialsId: 'github-token-userpass',
                        usernameVariable: 'GIT_USER',
                        passwordVariable: 'GIT_TOKEN'
                    )
                ]) {
                    sh '''
                    ssh -o StrictHostKeyChecking=no ${MASTER_HOST} "
                        set -e

                        if [ ! -d '${MASTER_APP_DIR}/.git' ]; then
                            git clone https://${GIT_USER}:${GIT_TOKEN}@github.com/taehyun02/AutoEver-mini-pj.git ${MASTER_APP_DIR}
                        else
                            cd ${MASTER_APP_DIR}
                            git fetch origin
                            git checkout main
                            git pull origin main
                        fi

                        cd ${MASTER_APP_DIR}/backend

                        echo '${DOCKER_PASS}' | docker login -u '${DOCKER_USER}' --password-stdin

                        docker build -t ${IMAGE_NAME}:latest .
                        docker tag ${IMAGE_NAME}:latest ${IMAGE_REPO}:latest
                        docker tag ${IMAGE_NAME}:latest ${IMAGE_REPO}:${BUILD_NUMBER}

                        docker push ${IMAGE_REPO}:latest
                        docker push ${IMAGE_REPO}:${BUILD_NUMBER}

                        docker logout
                    "
                    '''
                }
            }
        }

        stage('Clone Manifest Repo') {
            steps {
                dir('manifest-repo') {
                    git branch: 'main',
                        credentialsId: 'github-token-userpass',
                        url: "${MANIFEST_REPO}"
                }
            }
        }

        stage('Update Manifest Image Tag') {
            steps {
                dir('manifest-repo') {
                    sh '''
                    sed -i "s|image: .*|image: ${IMAGE_REPO}:${BUILD_NUMBER}|g" backend/deployment.yaml
                    echo "===== updated deployment.yaml ====="
                    cat backend/deployment.yaml
                    '''
                }
            }
        }

        stage('Commit and Push Manifest') {
            steps {
                dir('manifest-repo') {
                    withCredentials([usernamePassword(
                        credentialsId: 'github-token-userpass',
                        usernameVariable: 'GIT_USER',
                        passwordVariable: 'GIT_TOKEN'
                    )]) {
                        sh '''
                        git config user.email "${GIT_EMAIL}"
                        git config user.name "${GIT_NAME}"

                        git add backend/deployment.yaml
                        git commit -m "Update backend image to ${IMAGE_REPO}:${BUILD_NUMBER}" || true

                        git push
                        '''
                    }
                }
            }
        }
    }
}
