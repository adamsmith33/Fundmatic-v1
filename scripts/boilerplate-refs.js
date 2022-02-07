//How to Handle Time Stamps
let date = new Date(txn.dateCreated * 1000);
let year = date.getFullYear();
let month = date.getMonth()+1;
let hour = date.getHours();
let day = date.getDate();
let minutes = date.getMinutes();
let seconds = date.getSeconds();
console.log(`${hour}:${minutes}:${seconds} on ${month}/${day}/${year}`);


//How to convert timestamp into UNIX Timestamp
Math.floor(new Date('2012.08.10').getTime() / 1000)

//How to find seconds elapsed between two times
var startTime, endTime;

function start() {
  startTime = new Date();
};

function end() {
  endTime = new Date();
  var timeDiff = endTime - startTime; //in ms
  // strip the ms
  timeDiff /= 1000;

  // get seconds 
  var seconds = Math.round(timeDiff);
  console.log(seconds + " seconds");
}