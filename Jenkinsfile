// This Jenkinsfile is a final, robust version that runs directly on the Jenkins agent.
// It assumes that the agent is the host machine itself and has all necessary
// build tools (g++, Node.js, etc.) installed.
// This approach eliminates the 'docker: not found' errors by not using Docker
// for the build environment.

pipeline {
    // The 'agent any' directive tells Jenkins to run the pipeline on any
    // available agent, which in your case is the host machine itself.
    agent any

    // The 'tools' directive for Node.js is used to provide the Node.js environment
    // on the host machine. You must have configured 'Node.js 18' in Jenkins'
    // Global Tool Configuration.
    tools {
        nodejs 'Node.js 18'
    }

    stages {
        // ---

        // Stage 1: Build the C++ backend on the host agent.
        stage('Build C++ Backend') {
            steps {
                // Ensure submodules are checked out before installing dependencies.
                // The 'apt-get' commands are run directly on the host, so
                // they require 'sudo'.
                sh '''
                    git submodule update --init --recursive
                    sudo apt-get update
                    sudo apt-get install -y g++ cmake libpqxx-dev libboost-dev libssl-dev libasio-dev
                    cd be_cpp
                    cmake -B build .
                    cmake --build build
                '''
            }
        }

        // ---

        // Stage 2: Build the TypeScript frontend on the host agent.
        stage('Build TypeScript Frontend') {
            steps {
                // Run npm commands directly on the host using the Node.js tool
                // configured in Jenkins.
                sh '''
                    cd fe_ts
                    npm install
                    npm run build
                '''
            }
        }
    }
}
