pipeline {
    agent any

    environment {
        IMAGE_NAME = 'my-backend-pipeline'
        IMAGE_REPO = 'taehyun02/my-backend-pipeline'
        MANIFEST_REPO = 'https://github.com/taehyun02/wattup-my-manifest.git'
        GIT_EMAIL = 'jenkins@local'
        GIT_NAME = 'jenkins'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Check Directory') {
            steps {
                echo 'Current workspace:'
                sh 'pwd'
                sh 'ls -al'
                sh 'ls -al backend'
            }
        }

        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    sh '''
                    docker build -t ${IMAGE_NAME}:latest .
                    docker tag ${IMAGE_NAME}:latest ${IMAGE_REPO}:latest
                    docker tag ${IMAGE_NAME}:latest ${IMAGE_REPO}:${BUILD_NUMBER}
                    '''
                }
            }
        }

        stage('Push Backend Image') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    docker push ${IMAGE_REPO}:latest
                    docker push ${IMAGE_REPO}:${BUILD_NUMBER}
                    docker logout
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
                    sh '''
                    git config user.email "${GIT_EMAIL}"
                    git config user.name "${GIT_NAME}"
                    git add backend/deployment.yaml
                    git commit -m "Update backend image to ${IMAGE_REPO}:${BUILD_NUMBER}" || true
                    git push origin HEAD:main
                    '''
                }
            }
        }
    }
}
