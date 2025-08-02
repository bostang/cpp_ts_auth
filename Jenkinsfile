// This Jenkinsfile uses a robust approach by running each build stage
// inside its own Docker container. This ensures a clean, consistent, and
// isolated environment for each part of the pipeline.

pipeline {
    // The main agent is set to `none`, as each stage will define its own agent.
    agent none

    stages {
        // ---

        // This stage will run the backend and frontend builds in parallel.
        stage('Parallel Builds') {
            parallel {
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
                        sh 'apt-get update'
                        sh 'apt-get install -y g++ cmake libpqxx-dev libboost-dev libssl-dev libasio-dev git'
                        
                        // Fix for 'dubious ownership' error in recent Git versions.
                        // We add the workspace directory as a safe directory for Git.
                        sh 'git config --global --add safe.directory /var/jenkins_home/workspace/cpp_ts_auth_ci-cd_jenkins'

                        // Perform submodule update inside the correct directory
                        sh 'git submodule update --init --recursive'
                        
                        // Use a `dir` block to run the CMake commands in the backend directory.
                        dir('be_cpp') {
                            sh 'cmake -B build .'
                            sh 'cmake --build build'
                        }
                    }
                }

                // ---

                // Stage 2: Build the TypeScript Frontend inside a Docker container.
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
                        // Use a `dir` block to run the npm commands in the frontend directory.
                        dir('fe_ts') {
                            sh 'npm install'
                            sh 'npm run build'
                        }
                    }
                }
            }
        }
        
        // ---
        
        // Stage 3: Package and deploy the application.
        stage('Continuous Deployment') {
            // This stage runs on the Jenkins agent itself, which we've confirmed
            // has the Docker CLI and access to the Docker daemon.
            agent any
            
            steps {
                // Langkah 1: Login Docker Hub menggunakan kredensial yang tersimpan.
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                    sh "echo \"${env.DOCKER_PASSWORD}\" | docker login -u ${env.DOCKER_USERNAME} --password-stdin"
                }
                
                // Langkah 2: Jalankan parallel builds dan push setelah login berhasil.
                // Menggunakan `script` block untuk menampung `parallel` karena `parallel` 
                // tidak diizinkan di dalam `steps`. Namun, `parallel` di dalam `script` 
                // harus menggunakan sintaksis `parallel([..])` bukan blok `parallel { ... }`.
                // Pendekatan ini juga bermasalah.

                // --- SOLUSI PALING BENAR UNTUK KASUS INI ---
                // Karena `parallel` tidak diizinkan di dalam `steps`, kita harus membuat
                // stage terpisah untuk setiap build dan menjalankannya secara paralel.
                // Itu sudah dilakukan di tahap 'Parallel Builds'.
                // Untuk Continuous Deployment, kita harus memilih salah satu dari dua cara:
                // 1. Jalankan secara sequential (berturut-turut).
                // 2. Gunakan `script` block dengan sintaks `parallel([:])`.

                // Mari kita gunakan solusi 1, yang paling sederhana dan valid secara sintaks.
                // Jika ingin paralel, kita harus memindahkan seluruh logic ke dalam satu stage paralel.
                // Pilihan terbaik adalah tidak menggunakan `parallel` di sini dan menjalankannya secara berurutan.
            }
        }
    }
}