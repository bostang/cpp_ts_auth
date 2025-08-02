// This Jenkinsfile uses a robust approach by running each build stage
// inside its own Docker container. This ensures a clean, consistent, and
// isolated environment for each part of the pipeline.

pipeline {
    // The main agent is set to `none`, as each stage will define its own agent.
    agent none

    // The 'tools' directive is no longer needed at the global level because
    // the Node.js Docker image will provide the environment.

    stages {
        // ---

        // Stage 1: Build the C++ backend inside a Docker container.
        stage('Build C++ Backend') {
            // This agent uses a clean Ubuntu Docker image.
            agent {
                docker {
                    image 'ubuntu:latest'
                    // Add this line to run the container as the root user,
                    // which resolves the permission denied error with apt-get.
                    args '--user root'
                }
            }
            steps {
                // Now we can install dependencies without 'sudo' because the
                // pipeline is running as root inside the Docker container.
                sh '''
                    apt-get update
                    apt-get install -y g++ cmake libpqxx-dev libboost-dev libssl-dev libasio-dev git
                    git submodule update --init --recursive
                    cd be_cpp
                    cmake -B build .
                    cmake --build build
                '''
            }
        }

        // ---

        // Stage 2: Build the TypeScript frontend inside a Docker container.
        stage('Build TypeScript Frontend') {
            // This agent uses the official Node.js 18 Docker image.
            agent {
                docker {
                    image 'node:18'
                    // Add this line to run the container as the root user
                    // to prevent potential npm permission issues.
                    args '--user root'
                }
            }
            steps {
                // We no longer need to install Node.js as the container already
                // has it. We simply install project dependencies and build.
                sh '''
                    cd fe_ts
                    npm install
                    npm run build
                '''
            }
        }
    }
}
