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
                            args '--user root'
                        }
                    }
                    steps {
                        sh 'apt-get update'
                        sh 'apt-get install -y g++ cmake libpqxx-dev libboost-dev libssl-dev libasio-dev git'
                        sh 'git config --global --add safe.directory /var/jenkins_home/workspace/cpp_ts_auth_ci-cd_jenkins'
                        sh 'git submodule update --init --recursive'
                        
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
                            args '--user root'
                        }
                    }
                    steps {
                        // --- PERBAIKAN AKHIR DAN PALING KRUSIAL ---
                        // Kita gabungkan semua langkah frontend ke dalam satu blok `dir`
                        // agar semuanya berjalan di satu tempat dan satu kontainer.
                        dir('fe_ts') {
                            sh '''
                                # Jalankan `npm install` dan `npm run build`
                                npm install
                                npm run build
                            '''
                        }
                        
                        // Setelah `dir` selesai, direktori `fe_ts/dist` sudah ada di workspace host.
                        // Sekarang, kita bisa mengarsipkannya dengan aman.
                        // `archiveArtifacts` bekerja di host Jenkins, bukan di dalam kontainer.
                        archiveArtifacts artifacts: 'fe_ts/dist/**', fingerprint: true
                    }
                }
            }
        }
        
        // ---
        
        // Stage 3: Package and deploy the application.
        stage('Continuous Deployment') {
            agent any
            
            steps {
                // `unarchive` akan mengembalikan file `dist` ke sub-direktori `fe_ts`
                unarchive mapping: ['fe_ts/dist/**': 'fe_ts/dist/']
                
                // Langkah 1: Login Docker Hub sekali saja
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                    sh "echo \"${env.DOCKER_PASSWORD}\" | docker login -u ${env.DOCKER_USERNAME} --password-stdin"
                }
                
                // Langkah 2: Gunakan `script` block dengan sintaks `parallel([:])`
                script {
                    parallel(
                        'Build and Push Backend Image': {
                            dir('be_cpp') {
                                sh "docker build -t bostang/auth-app-cpp-ts-be:latest ."
                                sh "docker tag bostang/auth-app-cpp-ts-be:latest bostang/auth-app-cpp-ts-be:${env.BUILD_NUMBER}"
                                sh "docker push bostang/auth-app-cpp-ts-be:latest"
                                sh "docker push bostang/auth-app-cpp-ts-be:${env.BUILD_NUMBER}"
                            }
                        },
                        'Build and Push Frontend Image': {
                            dir('fe_ts') {
                                sh "docker build -t bostang/auth-app-cpp-ts-fe:latest ."
                                sh "docker tag bostang/auth-app-cpp-ts-fe:latest bostang/auth-app-cpp-ts-fe:${env.BUILD_NUMBER}"
                                sh "docker push bostang/auth-app-cpp-ts-fe:latest"
                                sh "docker push bostang/auth-app-cpp-ts-fe:${env.BUILD_NUMBER}"
                            }
                        }
                    )
                }
            }
        }
    }
}