<h3>Создание репозитория</h3>	ixaker/appQpartWSS

    rm -rf .git

    git init
    git add .
    git commit -m "first commit"
    git branch -M main
    git remote add origin git@github.com:ixaker/appQpartWSS.git
    git push -u origin main

 <hr>
 
<h3>Подключение к репозиторию</h3>

    mkdir -p /root/dev/wss
    cd /root/dev/wss
    git clone https://github.com/ixaker/appQpartWSS.git .
    npm install
    npm run dev