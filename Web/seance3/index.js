let title = document.getElementById("mainTitle");
title.innerText = "DOM Manipulation Completed";

let content = document.getElementById('paragraph1');
console.log(content);

title.style.fontSize="24px";

let span = document.getElementsByClassName('highlight');
console.log(span);

span[0].textContent = "New Hightlighted Text"
