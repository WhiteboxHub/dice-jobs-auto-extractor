# Dice_apply
pm2 start scheduler.js --name "cypress-scheduler"
pm2 stop "cypress-scheduler"
npx cypress open
npx cypress run
 node scripts/copyfixtures.js 
