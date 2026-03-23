pipeline {
    agent any

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
                    sh 'docker build -t my-backend:latest .'
                }
            }
        }
    }
}
