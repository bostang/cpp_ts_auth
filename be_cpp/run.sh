#!/bin/bash

# Cek apakah file .env ada
if [ -f .env ]; then
    # Jika ada, baca semua variabel dari file tersebut dan muat ke lingkungan shell
    echo "Memuat environment variables dari file .env..."
    set -a
    source .env
    set +a
else
    echo "File .env tidak ditemukan. Menggunakan nilai default."
fi

# Jalankan server C++
./build/server