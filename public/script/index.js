$(".DivToScroll").animate({ scrollTop: $(document).height() }, "fast");
 var socket = io("https://polar-shore-39060.herokuapp.com/")

      function renderMessage(message){
        
          $(".messages").append('<div class="message"><strong>' + message.author + '</strong>: ' + "<strong>" + message.message.replaceAll("<script>", '')
           + "<strong  style='float:right;'>" + message.date +'</strong></div>');
      }
      socket.on("receivedMessage", function(message) {
          renderMessage(message);
      });
    
      socket.on("previousMessages", function(sendMessages){
          for(message of sendMessages){
              renderMessage(message);
          }
      })
    console.log(name);
      $("#chat").submit(function(event){
          event.preventDefault();
          var time = new Date();
          $("#Time").val(time.getHours() + ':' + time.getMinutes());
          var message = $("input[name=message]").val();
          if(message.length){
              var messageObject = {
                  author: username,
                  message: message,
                  dateMessage: new Date().toLocaleTimeString()
              };
    
              renderMessage(messageObject);
    
              socket.emit("sendMessage", messageObject);
              $("input[name=message]").val("");
          }
      });

function emoji(){
  var picker = new EmojiButton({
  position: 'left'
});
picker.pickerVisible ? picker.hidePicker() : picker.showPicker(input);
picker.on("emoji", function(emoji){
  input.value += emoji;
});
}
var input = document.querySelector('.chatTextInput');

function closeEmoji(){
  $("#emojiLabel").css("display", "none"); 
}
function putEmoji(){
  $("#emojiLabel").css("display", "inline");
}
function closeChat(){
    $("#chatWindow").addClass("closeChatWindow");
    $("#chat").css("display", "none");
  }

function openChat(){
  if($("#chatWindow").hasClass("closeChatWindow")){
    $("#chatWindow").removeClass("closeChatWindow");
    $("#chat").css("display", "inline");
  }else{
    $("#chatWindow").addClass("closeChatWindow");
    $("#chat").css("display", "none");
  }   
}

function postButton() {
    if($("#containerHome").hasClass("containerHome")){
    $("#containerHome").removeClass();
  }else{
    $("#containerHome").addClass("container containerHome containerHomeCss");
  }
  }
  function cancelButton() {
      $("#input").val("");
      $("#textarea").val("");
      $("#containerHome").addClass("containerHome");
  }

  $(document).ready(() => {
    $("#craudim").click(() => {
      alert(
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s"
        );
    });
  });

  function advertising() {
    $("#tesao").removeClass("tesaoAnuncio");
  }

  
  $(document).ready(() => {
    $("#tesao").click(() => {
      $("#tesao").addClass("tesaoAnuncio");
    })
  })

  function clickedPost(obj) {
    $(".delete").each(() => {
      $(".delete").removeClass("inviPostCss");
      
    })
    $(obj).addClass("inviPostCss");
      $(".closeWindowButton").removeClass("closeWindowButton");
      $(".btn-danger").removeClass("inviDelete");
  } 

  function closeWindowOfPost(obs) {
    $("button").each(() => {
      $(".offButtonFunction").addClass("closeWindowButton");
    })
    $(".delete").removeClass("inviPostCss");
    $(".offButtonFunction").addClass("inviDelete");
  }

function dbClickedPost(obj){
    $(".button").each( () => {
      $(".delete").addClass("closeWindowButton");
    });
    $(".delete").removeClass("inviPostCss");
    $(".offButtonFunction").addClass("inviDelete");
}

function spotifyShow(){
  if($("#spotifyDud").hasClass("spotify")){
    $("#spotifyDud").removeClass("spotify");
  $("#spotifyPep").removeClass("spotify");
  }else{
    $("#spotifyDud").addClass("spotify");
  $("#spotifyPep").addClass("spotify");
  }
}

