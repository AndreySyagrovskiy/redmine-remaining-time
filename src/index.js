const Redmine = require('node-redmine');

var hostname = process.env.REDMINE_HOST || 'https://redmine.stfalcon.com';
var config = {
    apiKey: process.env.REDMINE_APIKEY || '2fa20c4c817077c78b4695b28d0d502478186867'
};

const redmine = new Redmine(hostname, config);
let promises = [];
let timeКemaining = 0;
let promise;

(new Promise((resolve, reject) => {
    redmine.issues({ assigned_to_id: 250, project_id: 219, created_on: ">=2016-10-01", limit: 200 }, function (err, data) {
        if (err) reject(err);

        resolve(data);
    });
}))
.then(
    data => {
        for(let item of data.issues){
            promises.push(new Promise((resolve, reject) => {
            

                redmine.get_issue_by_id(item.id, null, (err, data) =>{ 
                    if (err) reject(err);
                    if(data.issue.estimated_hours){
                        let div = data.issue.estimated_hours - data.issue.spent_hours;

                        resolve(div > 0 ? div : 0);
                    } else{
                        resolve(0);
                    }
                });
            }));
        }
        return Promise.all(promises);
    }
)
.then(
    data => console.log(data.reduce((previousValue, currentValue, index, array) => previousValue + currentValue))
)
;