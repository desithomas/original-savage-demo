const voteButtons = document.querySelectorAll(".fa-thumbs-up, .fa-thumbs-down");
const trash = document.getElementsByClassName("fa-trash");

//vote button
Array.from(voteButtons).forEach(function(element) {
      element.addEventListener('click', function(){
        const message = this.closest('.message')
        const vote = this.classList.contains('fa-thumbs-up') ? 'up' : 'down'

        fetch(`/messages/${message.dataset.messageId}/vote`, {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({vote: vote})
        })
        .then(response => {
          if (!response.ok) throw new Error('Could not record vote')
          return response.json()
        })
        .then(() => {
          window.location.reload(true)
        })
        .catch(error => console.error(error))
      });
});

//trash
Array.from(trash).forEach(function(element) {
      element.addEventListener('click', function(){
        const name = this.parentNode.parentNode.childNodes[1].innerText
        const msg = this.parentNode.parentNode.childNodes[3].innerText
        fetch('messages', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            'name': name,
            'msg': msg
          })
        }).then(function (response) {
          window.location.reload()
        })
      });
});
