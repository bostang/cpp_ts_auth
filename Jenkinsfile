// This Jenkinsfile defines a CI pipeline to build both a C++ backend and a
// TypeScript frontend, mirroring the logic of your GitHub Actions workflow.

// The 'pipeline' block is the root of the Jenkins Pipeline script.
pipeline {
    // The 'agent' directive specifies where the pipeline will run.
    // 'any' means Jenkins will allocate an available agent.
    // For a more controlled environment, you could use a Docker image with
    // a specific agent label, for example: 'agent { label 'ubuntu-agent' }'
    agent any

    // The 'stages' block contains the individual stages of the pipeline.
    stages {
        // Stage 1: Checkout the source code from the Git repository.
        // This is a common first step for all CI pipelines.
        stage('Checkout Source Code') {
            steps {
                // The 'checkout scm' step checks out the code from the source
                // control management (SCM) system defined in the Jenkins job configuration.
                // We also add the 'recursive' option to fetch submodules,
                // which mirrors the 'actions/checkout@v3' with 'submodules: recursive'.
                checkout scm: [$class: 'GitSCM', branches: [[name: '*/main'], [name: '*/master']],
                             userRemoteConfigs: [[url: 'https://github.com/bostang/cpp_ts_auth.git', credentialsId: '']],
                             extensions: [[$class: 'SubmoduleOption', recursive: true, parentCredentials: true]]]
            }
        }

        // ---

        // Stage 2: Build the C++ backend.
        stage('Build C++ Backend') {
            // The 'tools' block can be used to load tools configured in Jenkins
            // Global Tool Configuration (e.g., 'Node.js 18').
            // This is just a placeholder, as C++ tools are typically pre-installed on the agent.
            // tools {
            //   nodejs 'Node.js 18'
            // }
            steps {
                // The 'sh' step executes a shell command.
                // We use 'sudo apt-get' commands to install the necessary dependencies.
                // It's good practice to wrap multiple commands in a single 'sh' block
                // with a multiline string to ensure they run in the same shell session.
                sh '''
                    sudo apt-get update
                    sudo apt-get install -y g++ cmake libpqxx-dev libboost-dev libssl-dev libasio-dev
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

        // Stage 3: Build the TypeScript frontend.
        stage('Build TypeScript Frontend') {
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
