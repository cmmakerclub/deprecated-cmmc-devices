rm -rvf dist
gulp build
rsync -avz dist/ root@cmmc.xyz:/var/www/html/devices/ 

git add . 
git commit -m "Rebuild"
git push 




pushd ..
git commit -am "rebuild"
git push

popd

