pipeline {
    agent any

    environment {
        IMAGE_NAME = 'my-backend'
        IMAGE_REPO = 'taehyun02/my-backend'
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
    }
}
