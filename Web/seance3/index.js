let title = document.getElementById("mainTitle");
title.innerText = "DOM Manipulation Completed";

let content = document.getElementById('paragraph1');
console.log(content);

title.style.fontSize="24px";

let span = document.getElementsByClassName('highlight');
console.log(span);

span[0].textContent = "New Hightlighted Text"

let paragraph = document.createElement("li");
paragraph.innerText = "New Paragraph";
let container = document.querySelector('ul#listContainer');
container.appendChild(paragraph);

let remplacement = document.getElementById("listContainer");
remplacement.firstElementChild.innerText = "Replaced Paragraph";
