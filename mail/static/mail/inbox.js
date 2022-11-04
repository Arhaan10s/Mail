document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').addEventListener('submit',send_email);
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emails-detail').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}
function send_email(event){
  event.preventDefault();
  const recipients=document.querySelector('#compose-recipients').value;
  const subject=document.querySelector('#compose-subject').value;
  const body=document.querySelector('#compose-body').value;
  
  //send data to backend 
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    // Print result
    console.log(result);
  });
  localStorage.clear();
  load_mailbox('sent');
  return false;
}

function view_email(id)
{
fetch(`/emails/${id}`)
.then(response => response.json())
.then(email => {
    document.querySelector("#emails-view").style.display='none';
    document.querySelector("#emails-detail").style.display='block';
    document.querySelector("#compose-view").style.display='none';
    // mark_email_as_read(id);
    console.log(email);
    document.querySelector("#emails-detail").innerHTML=`
    <ul class="list-group">
    <li class="list-group-item list-group-item-dark"><strong>From : </strong>${email.sender}</li>
    <li class="list-group-item list-group-item-dark"><strong>To : </strong>${email.recipients}</li>
    <li class="list-group-item list-group-item-dark"><strong>Subject : </strong>${email.subject}</li>
    <li class="list-group-item list-group-item-dark"><strong>TimeStamp : </strong>${email.timestamp}</li>
    <li class="list-group-item list-group-item-dark">${email.body}</li>
    </ul>
    `;
    // mark the read as true if the email has been read
    if(!email.read)
    {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          read: true
        })
      })
    }  
    //Archive button
    const btn_arch=document.createElement('button');
    btn_arch.innerHTML=email.archived ? "Unarchive":"Archive";
    btn_arch.className=email.archived ? "btn btn-success":"btn btn-danger";
    
    btn_arch.addEventListener('click',function(){
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: !email.archived
        })  
      })
      .then(()=>{load_mailbox('archive')})
    });
    document.querySelector('#emails-detail').append(btn_arch);
    
    //Reply logic
    const btn_reply=document.createElement('button');
    btn_reply.innerHTML="Reply";
    btn_reply.className="btn btn-info";
    btn_reply.addEventListener('click',function(){
      compose_email();
      document.querySelector('#compose-recipients').value = email.sender;
      let subject=email.subject;
      if(subject.split('',1)[0]!="Re:"){
        subject="Re: " + email.subject;
      }
      document.querySelector('#compose-subject').value = email.subject;
      document.querySelector('#compose-body').value = `ON : ${email.timestamp} ${email.sender} Wrote : ${email.body}`;

    });
    document.querySelector('#emails-detail').append(btn_reply);

  });
}
function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector("#emails-detail").style.display='none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
  // Print emails
  emails.forEach(singleEmail =>{

    //create div for each email
    const newEmail = document.createElement('div');
    newEmail.className="list-group-item list-group-item-action list-group-item-light";
    newEmail.innerHTML = `
    
    <table class="table">
    <td><h6>${singleEmail.sender}</h6></td>
    <td><h5>${singleEmail.subject}</h6></td>
    <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
    <td><p>${singleEmail.timestamp}</p></td>
    </table>
    `;
    
    //changing background colour
    newEmail.className=singleEmail.read?'read':'unread';
    
    newEmail.addEventListener('click',()=>{
     view_email(singleEmail.id)
  });  
    document.querySelector('#emails-view').append(newEmail);
  });  
  
  // ... do something else with emails ...
});
}