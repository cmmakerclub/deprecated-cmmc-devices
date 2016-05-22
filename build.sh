rm -rvf dist
gulp build
git add . 
git commit -m "Rebuild"
git push 
pushd ..
git commit -am "rebuild"
git push

rsync -avz dist/ root@cmmc.xyz:/var/www/html/devices/
popd

