const socket = io();

const form = document.querySelector("#message-form");
let input = form.querySelector("input");
const btn = document.querySelector("#btn");
const locationBtn = document.querySelector("#location");
const messages = document.querySelector(".messages");
const sidebar = document.querySelector("#sidebar");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
  // Latest message
  const lastMessage = messages.lastElementChild

  // Height of last message
  const lastMessageStyle = getComputedStyle(lastMessage)
  const lastMessageMargin = parseInt(lastMessageStyle.marginBottom)
  const lastMessageHeight = lastMessage.offsetHeight + lastMessageMargin
  
  // visible height
  const visibleHeight = messages.offsetHeight

  // Height of messages container
  const containerHeight = messages.scrollHeight

  // scroll distance
  const scrollOffset = messages.scrollTop + visibleHeight

  if(containerHeight - lastMessageHeight <= scrollOffset){
    messages.scrollTop = messages.scrollHeight
  }
}


socket.on("message", message => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("HH:mma")
  });
  
  messages.insertAdjacentHTML("beforeend", html);
  autoscroll()
});

socket.on("locationMessage", message => {
  const html = Mustache.render(locationTemplate, {
    username: message.username,
    url: message.text,
    createdAt: moment(message.createdAt).format("HH:mma")
  });

  messages.insertAdjacentHTML("beforeend", html);
  autoscroll()

});

socket.on("roomData", ({room, users})=>{
  const html = Mustache.render(sidebarTemplate, {
    room, 
    users
  })

  sidebar.innerHTML = html
})

form.addEventListener("submit", e => {
  e.preventDefault();

  btn.setAttribute("disabled", "disabled");

  let inputEl = input.value;
  console.log(inputEl)
  socket.emit("sendMessage", inputEl, error => {
    btn.removeAttribute("disabled");

    input.value = "";
    input.focus();
    if (error) return console.log(error);

    console.log("The message was delivered");
  });
});

locationBtn.addEventListener("click", () => {
  console.log("clicked");
  if (!navigator.geolocation) {
    return alert("Geolocation not supported in browser");
  }
  locationBtn.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition(position => {
    let coordObj = {};
    coordObj.longitude = position.coords.longitude;
    coordObj.latitude = position.coords.latitude;

    socket.emit("sendLocation", coordObj, () => {
      locationBtn.removeAttribute("disabled");
      console.log("Location shared");
    });
  });
});

socket.emit('join', ({username, room}), (error)=>{
    if(error){
      alert(error)
      location.href = '/'
    }
    
})
