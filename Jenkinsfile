// This Jenkinsfile is a simplified version that runs directly on the Jenkins agent.
// It assumes that all necessary tools (Docker, git, g++, cmake, Node.js)
// are already installed on the machine running the Jenkins agent.
// This approach avoids the complex 'Docker-in-Docker' or 'Docker outside of Docker' setups.

pipeline {
    // The 'agent any' directive tells Jenkins to run the pipeline on any
    // available agent, which in your case is likely the host machine itself.
    // This is the simplest way to get the pipeline running if the host
    // has all the required tools.
    agent any

    // The 'tools' directive for Node.js is moved to the global level,
    // as it is required by one of the stages.
    tools {
        nodejs 'Node.js 18'
    }

    stages {
        // ---

        // Stage 1: Build the C++ backend.
        stage('Build C++ Backend') {
            steps {
                // Ensure submodules are checked out before installing dependencies.
                // It's good practice to group related commands in a single sh block.
                // The `sudo` command is re-added here, as the host agent might
                // not have root privileges by default. You may need to
                // ensure the Jenkins user has sudo access without a password
                // for this to work seamlessly.
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

        // Stage 2: Build the TypeScript frontend.
        stage('Build TypeScript Frontend') {
            steps {
                // Combine the npm install and build commands for efficiency.
                sh '''
                    cd fe_ts
                    npm install
                    npm run build
                '''
            }
        }
    }
}
