// This Jenkinsfile is a final, more robust version that runs directly on the Jenkins agent.
// It explicitly calls 'docker run' for each stage, which avoids the issues with
// 'agent { docker { ... } }' and 'docker: not found' errors.

pipeline {
    // The main agent is set to 'any', as the entire pipeline runs on the host agent.
    // This assumes that the host has Docker and git installed.
    agent any

    // The 'tools' directive is used to provide the Node.js environment.
    tools {
        nodejs 'Node.js 18'
    }

    stages {
        // ---

        // Stage 1: Build the C++ backend inside a Docker container using a manual 'docker run'.
        stage('Build C++ Backend') {
            steps {
                // Use a 'docker run' command to create a container and execute a shell script.
                // We mount the current workspace to the container so that the build output
                // is available on the Jenkins agent after the container exits.
                sh '''
                    docker run --rm -v "$(pwd):/app" ubuntu:latest /bin/bash -c "
                      apt-get update && apt-get install -y g++ cmake libpqxx-dev libboost-dev libssl-dev libasio-dev git &&
                      cd /app &&
                      git submodule update --init --recursive &&
                      cd be_cpp &&
                      cmake -B build . &&
                      cmake --build build
                    "
                '''
            }
        }

        // ---

        // Stage 2: Build the TypeScript frontend inside a Node.js Docker container.
        stage('Build TypeScript Frontend') {
            steps {
                // Use a 'docker run' command with the Node.js image to build the frontend.
                // We mount the workspace to the container to access the source code.
                sh '''
                    docker run --rm -v "$(pwd):/app" node:18 /bin/bash -c "
                      cd /app/fe_ts &&
                      npm install &&
                      npm run build
                    "
                '''
            }
        }
    }
}
