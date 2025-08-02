// This updated Jenkinsfile fixes the issues found in the build log by using a
// Docker agent for a consistent and robust build environment.

pipeline {
    // The 'agent' directive is now configured to use a Docker container.
    // This ensures a clean environment with the necessary tools, resolving the 'sudo' issue.
    // 'ubuntu:latest' is used as a base image, but you can specify a different
    // image if needed (e.g., one with pre-installed dependencies).
    agent {
        docker {
            image 'ubuntu:latest'
        }
    }

    // The 'tools' directive can be defined globally here, but we will define
    // it locally in the 'Build TypeScript Frontend' stage as it is only needed there.

    stages {
        // Since Jenkins automatically checks out the code at the start of a
        // declarative pipeline, we can remove the redundant 'Checkout Source Code' stage.

        // ---

        // Stage 1: Build the C++ backend.
        stage('Build C++ Backend') {
            steps {
                // Because we are now in a clean Docker container, we need to
                // ensure the submodules are checked out correctly. The `git` command
                // is more reliable than a plugin-specific option.
                sh 'git submodule update --init --recursive'

                // We can now install dependencies without 'sudo' because the
                // pipeline is running inside a Docker container with root privileges.
                // It's still good practice to use a single `sh` block for related commands.
                sh '''
                    apt-get update
                    apt-get install -y g++ cmake libpqxx-dev libboost-dev libssl-dev libasio-dev
                '''

                // Now, we run the cmake and build commands for the C++ project.
                sh '''
                    cd be_cpp
                    cmake -B build .
                    cmake --build build
                '''
            }
        }

        // ---

        // Stage 2: Build the TypeScript frontend.
        stage('Build TypeScript Frontend') {
            // This 'tools' block loads a pre-configured Node.js tool.
            // You must configure a tool named "Node.js 18" in Jenkins'
            // 'Manage Jenkins -> Global Tool Configuration'.
            tools {
                nodejs 'Node.js 18'
            }
            steps {
                // Change directory to the frontend project and install Node.js dependencies.
                sh '''
                    cd fe_ts
                    npm install
                '''

                // Finally, run the build command for the frontend.
                sh '''
                    cd fe_ts
                    npm run build
                '''
            }
        }
    }
}
