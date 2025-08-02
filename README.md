# C++ & TypeScript Authentication App

## Backend

### Menjalankan

```bash
# lakukan dari folder /be_cpp/
git submodule update --init --recursive
./be_cpp/build/server
```

### Membuat proyek dari nol

```bash
# tambahkan library
# pastikan jalankan dari /cpp_ts_auth/
git submodule add https://github.com/CrowCpp/Crow.git be_cpp/lib/Crow
git submodule add https://github.com/hilch/Bcrypt.cpp.git be_cpp/lib/bcrypt
git submodule add https://github.com/jtv/libpqxx.git be_cpp/lib/libpqxx

cd be_cpp

mkdir build && cd build
mkdir -p ../log
echo "================== START of log ==================" > ../log/build.log
echo "================== log for cmake .. ==================" >> ../log/build.log
cmake .. >> ../log/build.log
echo "================== log for make ==================" >> ../log/build.log
make >> ../log/build.log
echo "================== END of log ==================" >> ../log/build.log
./server
```

## Frontend

### Menjalankan


### Membuat proyek dari nol

```bash
npx create-react-app fe_ts --template typescript
cd fe_ts
npm install react-router-dom
npm start
```

